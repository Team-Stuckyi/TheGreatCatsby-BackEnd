/**
 *  reviews 테이블에 대한 CRUD 기능을 수행하는 Restful API
 */

/** 모듈 참조 부분 */
const config = require('../helper/_config');
const logger = require('../helper/LogHelper');
const regexHelper = require('../helper/RegexHelper');
const utilHelper = require('../helper/UtilHelper');
const BadRequestException = require('../exceptions/BadRequestException');
const RuntimeException = require('../exceptions/RuntimeException');
const PageNotFoundException = require('../exceptions/PageNotFoundException');
const router = require('express').Router();
const mysql2 = require('mysql2/promise');

const url = require('url');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

module.exports = (app) => {
    let dbcon = null;

    /** =-=-=-=-=-=-=-=-=-=-= router.GET =-=-=-=-=-=-=-=-=-=-=  */

    /*
     * 관리자 페이지- 리뷰 관리 조회 페이지
     * [GET] /review/admin
     */
    router.get('/review/admin', async (req, res, next) => {
        // 데이터 조회 결과가 저장될 빈 변수
        let json = null;

        try {
            // 데이터베이스 접속
            dbcon = await mysql2.createConnection(config.database);
            await dbcon.connect();

            let sql =
                "SELECT r.review_id, p.name AS pname, m.email, r.review_text, r.stars, DATE_FORMAT(r.write_date, '%Y-%m-%d') AS write_date FROM reviews AS r LEFT JOIN orders AS o ON r.order_id = o.order_id LEFT JOIN members AS m ON o.user_id = m.user_id LEFT JOIN products p ON o.prod_id = p.prod_id;";
            const [result] = await dbcon.query(sql);
            json = result;
        } catch (err) {
            return next(err);
        } finally {
            dbcon.end();
        }
        res.sendJson({ item: json });
    });

    /**
     * 사용자 페이지 - 리뷰 페이지
     * 특정 리뷰
     * [GET] /review/:prodId
     * 전송 정보 : prod_id, name, stock, status, price, category, tumbnail_photo, info_photo, prod_info, prod_feature, reg_date, review_id, review_count, star_avg
     */
    /** 특정 목록 조회 */
    router.get('/review/:proid', async (req, res, next) => {
        const prod_id = req.get('proid');

        if (prod_id === null) {
            return next(new Error(400));
        }

        // 데이터 조회 결과가 저장될 빈 변수
        let json = null;

        try {
            // 데이터베이스 접속
            dbcon = await mysql2.createConnection(config.database);
            await dbcon.connect();

            // 데이터 조회
            let sql =
                "SELECT r.review_id, m.email, p.name, m.name, r.review_text, r.stars, DATE_FORMAT(r.write_date, '%Y-%m-%d') AS write_date, r.review_photo FROM reviews r LEFT JOIN orders o ON r.order_id = o.order_id LEFT JOIN members  m ON o.user_id = m.user_id  LEFT JOIN products p ON o.prod_id = p.prod_id WHERE p.prod_id = ?";

            const [result] = await dbcon.query(sql, [prod_id]);

            json = result;
        } catch (err) {
            return next(err);
        } finally {
            dbcon.end();
        }

        // 모든 처리에 성공했으므로 정상 조회 결과 구성
        res.sendJson({ item: json });
    });

    /** =-=-=-=-=-=-=-=-=-=-= router.POST =-=-=-=-=-=-=-=-=-=-=  */

    /**
     * 사용자 페이지 - 구매 후기 페이지
     * 리뷰를 등록하는 데이터
     * [POST] /reviewlist.html
     * 전송 정보 : review_id, review_text, review_photo, stars,
     */
    fs.readdir('_files/uploads', (error) => {
        // uploads 폴더 없으면 생성
        if (error) {
            fs.mkdirSync('_files/uploads');
        }
    });

    const upload = multer({
        storage: multer.diskStorage({
            destination(req, file, cb) {
                cb(null, '_files/uploads/');
            },
            filename(req, file, cb) {
                const ext = path.extname(file.originalname);
                cb(null, 'img' + Date.now() + ext);
            },
        }),
        limits: { fileSize: 5 * 1024 * 1024 },
    });

    router.post('/reviews/write', upload.single('imgFile'), async (req, res, next) => {
        // 저장을 위한 파라미터 받기
        const review_text = req.post('review_text');
        const review_photo = `/${req.file.filename}`;
        const stars = req.post('stars');
        const order_id = req.post('order_id');

        if (review_text === null || stars === null || order_id === null) {
            return next(new Error(400));
        }

        // 데이터 저장하기
        // 데이터 조회 결과가 저장될 빈 변수
        let json = null;

        try {
            // 데이터베이스 접속
            dbcon = await mysql2.createConnection(config.database);
            await dbcon.connect();

            // 데이터 저장하기

            const sql =
                'INSERT INTO reviews (order_id, review_text, review_photo, stars, write_date) VALUES (?, ?, ?, ?, now())';

            const input_data = [order_id, review_text, review_photo, stars];
            const [result1] = await dbcon.query(sql, input_data);

            let sql2 =
                "SELECT review_text, review_photo, stars, DATE_FORMAT(write_date, '%Y-%m-%d') AS write_date, review_id, order_id FROM reviews WHERE order_id = ?";
            const [result2] = await dbcon.query(sql2, [result1.insertId]);

            // 조회 결과를 미리 준비한 변수에 저장함
            json = result2;
        } catch (err) {
            return next(err);
        } finally {
            dbcon.end();
        }

        // 모든 처리에 성공했으므로 정상 조회 결과 구성
        res.sendJson({ item: json });
    });

    /** =-=-=-=-=-=-=-=-=-=-= router.DELETE =-=-=-=-=-=-=-=-=-=-=  */

    /**
     * 관리자 페이지 - 리뷰 관리 페이지
     * 사용자가 작성한 리뷰를 삭제
     * [DELETE] /reviewlist.html
     * 전송 정보
     */

    router.delete('/reviews/del/:review_id', async (req, res, next) => {
        const reviewid = req.get('review_id');

        if (reviewid === null) {
            //  400 Bad Request -> 잘못된 요청
            return next(new Error(400));
        }

        /** 데이터 삭제하기 */
        try {
            // 데이터베이스 접속
            dbcon = await mysql2.createConnection(config.database);
            await dbcon.connect();

            // 데이터 삭제하기
            const sql = 'DELETE FROM reviews WHERE review_id=?';
            const [result1] = await dbcon.query(sql, [reviewid]);

            console.log(result1);
            // 결과 행 수가 0이라면 예외처리
            if (result1.affectedRows < 1) {
                throw new Error('삭제된 데이터가 없습니다.');
            }
        } catch (err) {
            return next(err);
        } finally {
            dbcon.end();
        }

        // 모든 처리에 성공했으므로 정상 조회 결과 구성
        res.sendJson();
    });

    return router;
};
