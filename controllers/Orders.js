/**
 *  orders 테이블에 대한 CRUD 기능을 수행하는 Restful API
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

/** 라우팅 정의 부분 */
module.exports = (app) => {
    let dbcon = null;

    /**
     * 관리자 페이지 - 관리자 주문 관리 페이지
     * 제품 주문을 화면에 보여주는 데이터
     * [GET] /orderlist.html
     * 전송 정보 : price, order_date, member, order_status => name, member => email, products => name
     */

    router.get('/orders/all', async (req, res, next) => {
        //검색어 파라미터 받기 -> 검색어가 없을 경우 전체 목록 조회이므로 유효성 검사 안함
        const query = req.get('query');

        //현재 페이지 번호 받기 (기본값은 1)
        const page = req.get('page', 1);

        //한 페이지에 보여질 목록 수 받기 (기본값은 10, 최소 10, 최대 30)
        const rows = req.get('rows', 10);
        // 데이터 조회 결과가 저장될 빈 변수
        let json = null;
        let pagenation = null;
        let totalCount = null;

        try {
            // 데이터베이스 접속
            dbcon = await mysql2.createConnection(config.database);
            await dbcon.connect();

            let sql1 =
                "SELECT orders.order_id, orders.order_price, DATE_FORMAT(orders.order_date, '%Y-%m-%d') AS order_date, orders.order_status, members.name, members.email, products.name, products.info_photo FROM orders INNER JOIN members ON orders.user_id = members.user_id INNER JOIN products ON orders.prod_id = products.prod_id";

            let args1 = [];

            if (query != null) {
                sql1 += " WHERE order_price LIKE ('%', ?, '%')";
                args1.push(query);
            }
            const [result1] = await dbcon.query(sql1, args1);
            totalCount = result1[0].cnt;

            //페이지번호 정보를 계산한다.
            pagenation = utilHelper.pagenation(totalCount, page, rows);
            logger.debug(JSON.stringify(pagenation));

            let sql2 =
                "SELECT orders.order_id, orders.order_price, DATE_FORMAT(orders.order_date, '%Y-%m-%d') AS order_date, orders.order_status, members.name, members.email, products.name, products.info_photo FROM orders INNER JOIN members ON orders.user_id = members.user_id INNER JOIN products ON orders.prod_id = products.prod_id";
            //sql 문에 설정할 치환값
            let args2 = [];

            if (query != null) {
                sql2 += " WHERE order_price LIKE concat ('%', ?, '%')";
                args2.push(query);
            }

            sql2 += ' LIMIT ?,?';
            args2.push(pagenation.offset);
            args2.push(pagenation.listCount);

            const [result2] = await dbcon.query(sql2, args2);

            // 조회 결과를 미리 준비한 변수에 저장함
            json = result2;
        } catch (err) {
            return next(err);
        } finally {
            dbcon.end();
        }
        // 모든 처리에 성공했으므로 정상 조회 결과 구성
        logger.info(JSON.stringify({ pagenation: pagenation, item: json, totalCount: totalCount }));
        res.sendJson({ pagenation: pagenation, item: json, totalCount: totalCount });
    });

    /**
     * 사용자 페이지 - 리뷰 페이지
     * [GET] - review
     * 사용자가 리뷰를 작성전에 해당 상품의 리뷰를 썻는지 확인
     * 전송 정보 : order_id, user_id, prod_id
     */
    router.get('/orders/:user_id/:prod_id', async (req, res, next) => {
        const userid = req.get('user_id');
        const prodid = req.get('prod_id');

        if (userid === null || prodid === null) {
            return next(new Error(400));
        }

        // 데이터 조회 결과가 저장될 빈 변수
        let json = null;

        try {
            // 데이터베이스 접속
            dbcon = await mysql2.createConnection(config.database);
            await dbcon.connect();

            // 데이터 조회
            const sql =
                'SELECT order_id, user_id, prod_id FROM orders WHERE user_id = ? && prod_id = ?';
            const [result] = await dbcon.query(sql, [userid, prodid]);

            // 조회 결과를 미리 준비한 변수에 저장함
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
     * 관리자 페이지 - 관리자 주문 관리 페이지
     * 제품 주문 삭제
     * [delete] orderlist.html
     * 전송 정보
     */

    router.delete('/orders/del/:order_id', async (req, res, next) => {
        const orderid = req.get('order_id');

        if (orderid === undefined) {
            return next(new Error(400));
        }

        /** 데이터 삭제하기*/
        try {
            // 데이터베이스 접속
            dbcon = await mysql2.createConnection(config.database);
            await dbcon.connect();

            // 데이터 삭제하기
            const sql = 'DELETE FROM orders WHERE order_id=?';
            const [result1] = await dbcon.query(sql, [orderid]);

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

    /**
     * 사용자페이지 - 결제 페이지
     * [POST] - showmethemoney
     * 결제를 하는 순간 orderlist에 데이터 추가
     * 전송 정보 : order_price, order_date, order_select, order_count, member => name, member => email, products
     */

    router.post('/orders/post/:user_id', async (req, res, next) => {
        //const user_id = req.get("user_id");
        // 저장을 위한 파라미터 입력받기
        const order_price = req.post('order_price');
        const order_date = req.post('order_date');
        const order_select = req.post('order_select');
        const order_count = req.post('order_count');
        const prodid = req.post('prod_id');
        const userid = req.post('user_id');
        try {
            regexHelper.value(order_price, '총 금액 입력이 없습니다.');
            regexHelper.value(order_select, '결재방식을 고르지 않았습니다.');
            regexHelper.value(order_count, '주문 카운트가 되지 않았습니다.');
        } catch (err) {
            return next(err);
        }

        /** 데이터 저장하기 */
        // 데이터 조회 결과가 저장될 빈 변수
        let json = null;

        try {
            // 데이터베이스 접속
            dbcon = await mysql2.createConnection(config.database);
            await dbcon.connect();

            // 데이터 저장하기
            const sql1 =
                'INSERT INTO orders (order_price, order_date, order_select, order_count, prod_id, user_id) VALUES (?, now(), ?, ?, ?, ?)';

            const input_data1 = [
                order_price,
                order_date,
                order_select,
                order_count,
                prodid,
                userid,
            ];
            const [result1] = await dbcon.query(sql1, input_data1);

            // 새로 저장된 데이터의 PK값을 활용하여 다시 조회
            let sql2 =
                "SELECT orders.order_id, orders.order_price, DATE_FORMAT(orders.order_date, '%Y-%m-%d') AS order_date, members.name, members.tel, members.addr1, products.name FROM orders INNER JOIN members ON orders.user_id = members.user_id INNER JOIN products ON orders.prod_id = products.prod_id WHERE orders.order_id = ?";
            const [result2] = await dbcon.query(sql2, [userid]);

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
     * 사용자 페이지 - 결제 완료 페이지
     * [GET] - thankyou
     * 결재 후 사용자에게 결제 정보를 띄워주는 데이터
     * 전송 정보 : order_price, order_select, order_count
     */

    router.get('/orders/thanku/:order_id', async (req, res, next) => {
        const orderid = req.get('order_id');
        /** user_id 값을 가져와서 inner join 한다 */
        if (orderid === null) {
            return next(new Error(400));
        }

        // 데이터 조회 결과가 저장될 빈 변수
        let json = null;

        try {
            // 데이터베이스 접속
            dbcon = await mysql2.createConnection(config.database);
            await dbcon.connect();

            // 데이터 조회
            const sql =
                'SELECT orders.order_price, orders.order_select, orders.order_count, members.user_id, members.tel, members.addr1 FROM orders INNER JOIN members ON orders.user_id = members.user_id WHERE orders.order_id=?';
            const [result] = await dbcon.query(sql, [orderid]);

            // 조회 결과를 미리 준비한 변수에 저장함
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
 * PayAdress 컴포넌트
 * 주소를 수정하는 라우터
 * [PUT] /product
 * 전송 정보 : tel, addr1, user_id
 */
    /** 데이터 수정 --> Update(UPDATE) */
    router.put('/orders/member/:user_id', async (req, res, next) => {
        const user_id = req.get('user_id');
        const tel = req.post('tel');
        const addr1 = req.post('addr1');

        if (user_id === null || tel === null || addr1 === null) {
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
            const sql = 'UPDATE members SET tel=?, addr1=? WHERE user_id=?';
            const input_data = [tel, addr1, order_status, user_id];
            const [result1] = await dbcon.query(sql, input_data);

            // 결과 행 수가 0이라면 예외처리
            if (result1.affectedRows < 1) {
                throw new Error('수정된 데이터가 없습니다.');
            }
            // 새로 저장된 데이터의 PK값을 활용하여 다시 조회
            const sql2 =
                'SELECT members.user_id, members.tel, members.addr1 FROM members INNER JOIN orders ON orders.user_id = members.user_id WHERE members.user_id=?';
            const [result2] = await dbcon.query(sql2, [user_id]);

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
     * 관리자 페이지 - 일반 주문 관리 페이지
     * 주문 정보를 화면에 보여주는 데이터
     * [PUT] /orders
     * 전송 정보 : order_id, order_date, order_price, order_status
     */
    /** 데이터 수정 --> Update(UPDATE) */
    router.put('/orders/:order_id', async (req, res, next) => {
        const order_id = req.get('order_id');
        const order_date = req.put('order_date');
        const order_price = req.put('order_price');
        const order_status = req.put('order_status');

        if (order_id === null || order_date === null || order_price === null || order_status === null) {
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
            const sql = 'UPDATE orders SET order_date=?, order_price=?, order_status=? WHERE order_id=?';
            const input_data = [order_date, order_price, order_status, order_id];
            const [result1] = await dbcon.query(sql, input_data);

            // 결과 행 수가 0이라면 예외처리
            if (result1.affectedRows < 1) {
                throw new Error('수정된 데이터가 없습니다.');
            }

            // 새로 저장된 데이터의 PK값을 활용하여 다시 조회
            const sql2 = 'SELECT order_id, order_date, order_price, order_status FROM orders WHERE order_id=?';
            const [result2] = await dbcon.query(sql2, [order_id]);

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
    
    return router;
};
