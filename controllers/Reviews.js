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

const fileHelper = require('../helper/FileHelper');
const url = require('url');
const path = require('path');
const multer = require('multer');

module.exports = (app) => {
    /** multer 객체 생성 --> 파일제한 : 5개 20M */
    const multipart = multer({
        storage: multer.diskStorage({
            /** 업로드 된 파일의 저장될 디렉토리 설정 */
            // req는 요청정보, file은 최종적으로 업로드된 결과 데이터가 저장되어 있을 객체
            destination: (req, file, callback) => {
                //폴더생성
                fileHelper.mkdirs(config.upload.dir);
                fileHelper.mkdirs(config.upload.dir);
                console.debug(file);

                // 업로드 정보에 백엔드의 업로드 파일 저장 폴더 위치를 추가하낟.
                file.dir = config.upload.dir.replace(/\\/gi, '/');

                // multer 객체에게 업로드 경로를 전달
                callback(null, config.upload.dir);
            },

            /** 업로드 된 파일이 저장될 파일명 설정 */
            // file.originalname 변수에 파일이름이 저장되어 있다. -> ex helloworld.png
            filename: (req, file, callback) => {
                // 파일의 확장자만 추출 --> .png
                const extName = path.extname(file.originalname);
                // 파일이 저장될 이름 (현재 시각)
                const saveName = new Date().getTime().toString() + extName.toLowerCase();
                // 업로드 정보에 백엔드의 업로드 파일 이름을 추가한다.
                file.savename = saveName;
                // 여러개의 파일을 업로드 할때 경로가 생기지 않는 문제 해결하기
                file.path = path.join(file.dir, saveName);
                // 업로드 정보에 파일에 접근할 수 있는 URL값 추가
                file.url = path.join(config.upload.path, saveName).replace(/\\/gi, '/');
                // 구성된 정보를 req객체에게 추가
                if (req.file instanceof Array) {
                    req.file.push(file);
                } else {
                    req.file = file;
                }

                callback(null, saveName);
            },
        }),
        /** 요량, 최대 업로드 파일 수 제한 설정 */
        limits: {
            files: config.upload.max_count,
            fileSize: config.upload.max_size,
        },
        /**업로드 될 파일의 확장자 제한 */
        fileFilter: (req, file, callback) => {
            //파일의 종류 얻기
            var mimetype = file.mimetype;

            //파일 종류 문자열에 "image/"가 포함되어 있지 않은 경우
            if (mimetype.indexOf('image/') == -1) {
                const err = new Error();
                err.result_code = 500;
                err.result_msg = '이미지 파일만 업로드 가능합니다.';
                return callback(err);
            }

            callback(null, true);
        },
    });

    // 하나의 파일 업로드
    router.route('/upload/simple').post((req, res, next) => {
        // name속성값이 myphoto인 경우, 업로드 수행.
        const upload = multipart.single('myphoto');

        upload(req, res, async (err) => {
            let result_code = 200;
            let result_msg = 'ok';

            if (err) {
                if (err instanceof multer.MulterError) {
                    switch (err.code) {
                        case 'LIMIT_FILE_COUNT':
                            err.result_code = 500;
                            err.result_msg = '업로드 가능한 파일 수를 초과했습니다.';
                            break;
                        case 'LIMIT_FILE_SIZE':
                            err.result_code = 500;
                            err.result_msg = '업로드 가능한 파일 용량을 초과했습니다.';
                            break;
                        default:
                            err.result_code = 500;
                            err.result_msg = '알 수 없는 에러가 발생했습니다.';
                            break;
                    }
                }
                logger.error(err);
                result_code = err.result_code;
                result_msg = err.result_msg;
            }
            /** 업로드 결과에 이상이 없다면 썸네일 이미지 생성 */
            const thumb_size_list = [480, 750, 1080];

            // 원하는 썸네일 사이즈만큼 반복처리
            for (let i = 0; i < thumb_size_list.length; i++) {
                const v = thumb_size_list[i];

                // 생성될 썸네일 파일의 옵션과 파일이름을 생성
                const thumb_options = {
                    source: req.file.path, // 썸네일을 생성할 원본 경로
                    destination: config.thumbnail.dir, // 썸네일이 생성될 경로
                    width: v, // 썸네일 크기 (기본값 800)
                    prefix: 'thumb_',
                    suffix: '_' + v + 'w',
                    override: true,
                };

                // 생성될 썸네일 파일의 이름을 예상
                const basename = req.file.savename;
                const filename = basename.substring(0, basename.lastIndexOf('.'));
                const thumbname =
                    thumb_options.prefix + filename + thumb_options.suffix + path.extname(basename);

                // 썸네일 정보를 width를 key로 갖는 json 형태로 추가하기 위해 key 이름 생성
                const key = v + 'w';

                // 프론트엔드에게 전송될 정보에 "thumbnail"이라는 프로퍼티가 없다면 빈 json 형태로 생성
                if (!req.file.hasOwnProperty('thumbnail')) {
                    req.file.thumbnail = {};
                }

                req.file.thumbnail[key] = '/thumb/' + thumbname;

                try {
                    await thumbnail(thumb_options);
                } catch (error) {
                    console.error(error);
                }
            }

            const result = {
                rt: result_code,
                rtmsg: result_msg,
                item: req.file,
            };

            res.status(result_code).send(result);
        });
    });

    let dbcon = null;

    /*
     * 관리자 페이지- 리뷰 관리 조회 페이지
     * 사용자 페이지 - 상품 상세페이지, 구매 후기 페이지
     * 리뷰 작성 정보를 화면에 보여주는 데이터
     * [GET]
     * admin => reviewlist.html
     * user => prodlist.html. review.html
     * 전송 정보 : user_id => users => name, email , prod_id => products =>name, stars, review_text, write_date, review_photo
     */

    router.get('/reviews/look', async (req, res, next) => {
        //검색어 파라미터 받기 -> 검색어가 없을 경우 전체 목록 조회이므로 유효성 검사 안함
        const query = req.get('query');

        //현재 페이지 번호 받기 (기본값은 1)
        const page = req.get('page', 1);

        //한 페이지에 보여질 목록 수 받기 (기본값은 10, 최소 10, 최대 30)
        const rows = req.get('rows', 10);
        // 데이터 조회 결과가 저장될 빈 변수
        let json = null;
        let pagenation = null;

        try {
            // 데이터베이스 접속
            dbcon = await mysql2.createConnection(config.database);
            await dbcon.connect();

            let sql1 =
                "SELECT r.review_id, m.email, p.name, m.name, r.review_text, r.stars, DATE_FORMAT(r.write_date, '%Y-%m-%d') AS write_date, r.review_photo FROM reviews r LEFT JOIN orders  o ON r.order_id = o.order_id LEFT JOIN members  m ON o.user_id = m.user_id  LEFT JOIN products p ON o.prod_id = p.prod_id;";

            let args1 = [];

            if (query != null) {
                sql1 += " WHERE r.review_text LIKE ('%', ?, '%')";
                args1.push(query);
            }

            const [result1] = await dbcon.query(sql1, args1);

            // 조회 결과를 미리 준비한 변수에 저장함
            json = result1;
        } catch (err) {
            return next(err);
        } finally {
            dbcon.end();
        }
        // 모든 처리에 성공했으므로 정상 조회 결과 구성
        res.sendJson({ pagenation: pagenation, item: json });
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

    /**
     * 사용자 페이지 - 구매 후기 페이지
     * 리뷰를 등록하는 데이터
     * [POST] /reviewlist.html
     * 전송 정보 : review_id, review_text, review_photo, stars,
     */
    router.post('/reviews/write', async (req, res, next) => {
        // 저장을 위한 파라미터 받기
        const review_text = req.post('review_text');
        const review_photo = req.post('review_photo');
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
