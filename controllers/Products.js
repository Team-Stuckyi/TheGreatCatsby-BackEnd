/**
* @filename : Products.js
* @author : 전찬민 (cksals37530@gmail.com)
* @description : 상품정보 라우터 페이지
*/

/** 모듈 참조 부분 */
const config = require("../helper/_config");
const logger = require("../helper/LogHelper");
const router = require("express").Router();
const mysql2 = require("mysql2/promise");
const regexHelper = require("../helper/RegexHelper");
const utilHelper = require("../helper/UtilHelper");

/** 라우팅 정의 부분 */
module.exports = (app) => {
    let dbcon = null;

    /**
    * 관리자 페이지 - 일반 상품 관리 페이지, 사용자 페이지 - 메인페이지
    * 사용자 정보를 화면에 보여주는 데이터
    * [GET] /products
    * 전송 정보 : prod_id, name, stock, status, price, category, tumbnail_photo, info_photo, prod_info, prod_feature, reg_date, review_id, review_count, star_avg
    */
    /** 전체 목록 조회 */
    router.get("/products/all", async (req, res, next) => {

        // 검색어 파라미터 받기 -> 검색어가 없을 경우 전체 목록 조회이므로 유효성검사 안함
        const query = req.get('query');

        // 현재 페이지 번호 받기 (기본값 1)
        const page = req.get('page', 1);

        // 한 페이지에 보여질 목록 수 받기 ( 기본값 10, 최소 10, 최대 20) [협의 후 수정]
        const rows = req.get('rows', 10);

        // 데이터 조회 결과가 저장될 빈 변수
        let json = null;
        let pagenation = null;

        try {
            // 데이터베이스 접속
            dbcon = await mysql2.createConnection(config.database);
            await dbcon.connect();

            // 전체 데이터 수를 조회
            let sql1 = 'SELECT prod_id, name, stock, status, price, category, thumbnail_photo, info_photo, prod_info, prod_feature, reg_date, review_count, stars_avg FROM products';

            let args1 = [];

            if (query != null) {
                sql1 += " WHERE prod_id LIKE concat('%', ?, '%')";
                args1.push(query);
            }

            const [result1] = await dbcon.query(sql1, args1);
            const totalCount = result1[0].cnt;

            // 페이지 정보를 계산한다.
            pagenation = utilHelper.pagenation(totalCount, page, rows);
            logger.debug(JSON.stringify(pagenation));

            // 데이터 조회
            let sql2 = "SELECT prod_id, name, stock, status, price, category, thumbnail_photo, info_photo, prod_info, prod_feature, reg_date, review_count, stars_avg FROM products";

            let args2 = [];

            if (query != null) {
                sql2 += " WHERE products LIKE concat('%', ?, '%')";
                args2.push(query);
            }

            sql2 += " LIMIT ?, ?";
            args2.push(pagenation.offset);
            args2.push(pagenation.listCount);

            const [result2] = await dbcon.query(sql2, args2);

            // 조회결과를 미리 준비한 변수에 저장함
            json = result2;
        } catch (err) {
            return next(err);
        } finally {
            dbcon.end();
        }

        // 모든 처리에 성공했으므로 정상 조회 결과 구성
        res.sendJson({ pagenation: pagenation, item: json });
    });

    /**
    * 관리자 페이지 - 일반 상품 관리 페이지
    * 사용자 정보를 화면에 보여주는 데이터
    * [POST] /products
    * 전송 정보 : prod_id, name, stock, status, price, category, tumbnail_photo, info_photo, prod_info, prod_feature, review_id, review_count, star_avg
    */
    /** 데이터 추가 --> Create(INSERT) */
    router.post("/products", async (req, res, next) => {
        // 저장을 위한 파라미터 입력받기
        const name = req.post("name");
        const stock = req.post("stock");
        const price = req.post("price");
        const category = req.post("category");
        const thumbnail_photo = req.post("thumbnail_photo");
        const info_photo = req.post("info_photo");
        const prod_info = req.post("prod_info");
        const prod_feature = req.post("prod_feature");
        const reg_date = req.post("reg_date");

        if (
            name === null ||
            stock === null ||
            price === null ||
            category === null ||
            prod_info === null ||
            prod_feature === null ||
            thumbnail_photo === null ||
            reg_date === null ||
            info_photo === null
        ) {
            return next(new Error(400));
        }

        /** 데이터 저장하기 */
        // 데이터 조회 결과가 저장될 빈 변수
        let json = null;

        try {
            // 데이터베이스 접속
            dbcon = await mysql2.createConnection(config.database);
            await dbcon.connect();

            // 데이터 저장하기
            const sql = "INSERT INTO products (name, stock, price, category, prod_info, prod_feature, thumbnail_photo, info_photo, reg_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
            const input_data =
                [name, stock, price, category, prod_info, prod_feature, thumbnail_photo, info_photo, reg_date];

            const [result1] = await dbcon.query(sql, input_data);

            // 새로 저장된 데이터의 PK값을 활용하여 다시 조회
            const sql2 = "SELECT prod_id, name, stock, price, category, prod_info, prod_feature, thumbnail_photo, info_photo, reg_date FROM products WHERE prod_id=?";

            const [result2] = await dbcon.query(sql2, [result1.insertId]);

            // 조회결과를 미리 준비한 변수에 저장함
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
    * 관리자 페이지 - 일반 상품 관리 페이지
    * 사용자 정보를 화면에 보여주는 데이터
    * [PUT] /product
    * 전송 정보 : prod_id, name, stock, status, 
    */
    /** 데이터 수정 --> Update(UPDATE) */
    router.put("/products/:prod_id", async (req, res, next) => {
        const prod_id = req.get("prod_id");
        const name = req.put("name");
        const stock = req.put("stock");
        const status = req.put("status");

        if (prod_id === null || name === null || stock === null || status === null) {
            return next(new Error(400));
        }

        /** 데이터 수정하기 */
        // 데이터 조회 결과가 저장될 빈 변수
        let json = null;

        try {
            // 데이터베이스 접속
            dbcon = await mysql2.createConnection(config.database);
            await dbcon.connect();

            // 데이터 수정하기
            const sql = "UPDATE products SET name=?, stock=?, status=? WHERE prod_id=?";
            const input_data = [name, stock, status, prod_id];
            const [result1] = await dbcon.query(sql, input_data);

            // 결과 행 수가 0이라면 예외처리
            if (result1.affectedRows < 1) {
                throw new Error("수정된 데이터가 없습니다.");
            }

            // 새로 저장된 데이터의 PK값을 활용하여 다시 조회
            const sql2 = "SELECT prod_id, name, stock, status FROM products WHERE prod_id=?";
            const [result2] = await dbcon.query(sql2, [name]);

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
    * 관리자 페이지 - 일반 상품 관리 페이지
    * 사용자 정보를 화면에 보여주는 데이터
    * [DELETE] /products
    */
    /** 데이터 삭제 --> Delete(DELETE) */
    router.delete("/products/:prod_id", async (req, res, next) => {
        const prod_id = req.get("prod_id");

        if (prod_id === undefined) {
            return next(new Error(400));
        }

        /** 데이터 삭제하기 */
        try {
            // 데이터베이스 접속
            dbcon = await mysql2.createConnection(config.database);
            await dbcon.connect();

            // 데이터 삭제하기
            const sql = "DELETE FROM products WHERE prod_id=?";
            const [result1] = await dbcon.query(sql, [prod_id]);

            // 결과 행 수가 0이라면 예외처리
            if (result1.affectedRows < 1) {
                throw new Error("삭제된 데이터가 없습니다.");
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
}