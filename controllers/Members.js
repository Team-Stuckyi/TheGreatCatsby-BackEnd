/**
 * Members 테이블에 대한 CRUD 기능을 수행하는 Restful API
 */

/** 모듈 참조 부분 */
const config = require('../helper/_config');
const logger = require('../helper/LogHelper');
const regexHelper = require('../helper/RegexHelper');
const utilHelper = require('../helper/UtilHelper');
const router = require('express').Router();
const mysql2 = require('mysql2/promise');

const BadRequestException = require('../exceptions/BadRequestException');

/** 라우팅 정의 부분 */
module.exports = (app) => {
    let dbcon = null;

    /** =-=-=-=-=-=-=-=-=-=-= router.get =-=-=-=-=-=-=-=-=-=-=  */

    /**
     * 관리자 페이지 - 일반 회원 관리
     * 사용자 정보를 화면에 보여주는 데이터
     * [GET] /members/all
     * 전송 정보 : user_id, email, name, tel, status, addr2
     */
    router.get('/members/all', async (req, res, next) => {
        //검색어 파라미터 받기 -> 검색어가 없을 경우 전체 목록 조회이므로 유효성 검사 안함
        const query = req.get('query');

        // 현재 페이지 번호 받기 (기본값 1)
        const page = req.get('page', 1);

        // 한 페이지에 보여질 목록 수 받기(기본값은 10, 최소 10, 최대 30)
        const rows = req.get('rows', 10);

        // 데이터 조회 결과가 저장될 빈 변수
        let json = null;
        let pagenation = null;

        try {
            // 데이터베이스 접속
            dbcon = await mysql2.createConnection(config.database);
            await dbcon.connect();

            // 전체 데이터 수를 조회
            let sql1 = 'SELECT COUNT(*) AS cnt FROM members';

            let args1 = [];

            if (query != null) {
                sql1 += " WHERE user_id LIKE concat('%', ?, '%')";
                args1.push(query);
            }

            const [result1] = await dbcon.query(sql1, args1);
            const totalCount = result1[0].cnt;

            // 페이지번호 정보를 계산한다.
            pagenation = utilHelper.pagenation(totalCount, page, rows);
            logger.debug(JSON.stringify(pagenation));

            // 데이터 조회
            let sql2 =
                "SELECT user_id, email, name, status, tel, addr1, addr2, DATE_FORMAT(reg_date, '%Y-%m-%d') AS reg_date FROM members";

            // SQL문에 설정할 치환값
            let args2 = [];

            if (query != null) {
                sql2 += " WHERE user_id LIKE concat('%', ?, '%')";
                args2.push(query);
            }

            sql2 += ' LIMIT ?, ?';
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
        res.sendJson({ pagenation: pagenation, item: json });
    });

    /**
     * 사용자 페이지 - 결제 페이지
     * 최근 배송지 (값 있을 시)
     * [GET] /members/address
     * 전송 정보 : tel, addr1, addr2
     */
    router.get('/members/address/:memberid', async (req, res, next) => {
        // 데이터 조회 결과가 저장될 빈 변수
        let json = null;

        try {
            // 데이터베이스 접속
            dbcon = await mysql2.createConnection(config.database);
            await dbcon.connect();

            // 전체 데이터 수를 조회
            let sql =
                "SELECT user_id, tel, addr1, addr2, DATE_FORMAT(reg_date, '%Y-%m-%d') AS reg_date FROM members";
            const [result] = await dbcon.query(sql);
            json = result;
        } catch (err) {
            return next(err);
        } finally {
            dbcon.end();
        }

        res.sendJson({ item: json });
    });

    /** =-=-=-=-=-=-=-=-=-=-= router.post =-=-=-=-=-=-=-=-=-=-=  */

    /**
     * 사용자 페이지 - 회원 가입 페이지
     * 가입시 회원 정보 보내기
     * [post] /members/join
     * 전송 정보 : email, password, name
     */
    router.post('/members/join', async (req, res, next) => {
        // 저장을 위한 파라미터 입력받기
        const email = req.post('email');
        const password = req.post('password');
        const name = req.post('name');

        if (email === null) {
            return next(new Error(400));
        }

        /** 데이터 저장하기 */
        // 데이터 조회 결과가 저장될 빈 변수
        let json = null;

        try {
            // 데이터베이스 접속
            dbcon = await mysql2.createConnection(config.database);
            await dbcon.connect();

            //전체 데이터 수를 조회 (중복검사)
            const sql1 = 'SELECT COUNT(*) AS cnt FROM members WHERE email=?';
            const args1 = [email];

            const [result1] = await dbcon.query(sql1, args1);

            const totalCount = result1[0].cnt;

            if (totalCount > 0) {
                throw new BadRequestException('이미 사용중인 아이디 입니다.');
            }

            //전송받은 모든 정보를 회원 테이블에 저장 (INSERT)
            const sql2 =
                "INSERT INTO members (email, password, name, status, reg_date) VALUES (?, ?, ?, 'Y', now())";
            const input_data = [email, password, name];
            const [result2] = await dbcon.query(sql2, input_data);

            // 새로 저장된 데이터의 PK값을 활용하여 다시 조회
            const sql3 =
                "SELECT user_id, email, password, status, DATE_FORMAT(reg_date, '%Y-%m-%d') AS reg_date FROM members WHERE user_id=?";
            const [result3] = await dbcon.query(sql3, [result1.insertId]);

            // 조회 결과를 미리 준비한 변수에 저장함
            json = result3;
        } catch (err) {
            return next(err);
        } finally {
            dbcon.end();
        }

        // 모든 처리에 성공했으므로 정상 조회 결과 구성
        res.sendJson({ item: json });
    });

    /**
     * 사용자 페이지 - 로그인 페이지
     * 로그인시 회원 정보 보내기
     * [POST] /members/login
     * 전송 정보 : email, password
     */
    router.post('/members/login', async (req, res, next) => {
        // 파라미터 받기
        const email = req.post('email');
        const password = req.post('password');

        // 데이터 조회 결과가 저장될 빈 변수
        let json = null;

        try {
            // 데이터베이스 접속
            dbcon = await mysql2.createConnection(config.database);
            await dbcon.connect();

            // 아이디와 비밀번호가 일치하는 데이터 조회 (조회 결과에서 비밀번호는 제외)
            let sql1 =
                'SELECT user_id, email, name, status, tel, reg_date FROM members WHERE email=? AND password=?';
            let args1 = [email, password];

            const [result1] = await dbcon.query(sql1, args1);

            // 조회된 회원정보 객체를 저장하고 있는 1차원 배열
            json = result1;
        } catch (err) {
            return next(err);
        } finally {
            dbcon.end();
        }

        // 조회된 데이터가 없다면? WHERE절이 맞지 않다는 의미 -> 아이디, 비번 틀림
        if (json == null || json.length == 0) {
            return next(new BadRequestException('아이디나 비밀번호가 잘못 되었습니다.'));
        }

        // 탈퇴한 회원은 로그인 금지
        if (json[0].status == 'N') {
            return next(new BadRequestException('탈퇴한 회원입니다.'));
        }
        console.log(json[0]);
        // 조회 결과를 세션에 저장
        req.session.memberInfo = json[0];

        res.sendJson();
    });

    /** =-=-=-=-=-=-=-=-=-=-= router.put =-=-=-=-=-=-=-=-=-=-=  */

    /**
     * 사용자 페이지 - 결제 페이지
     * 신규 배송 입력시 업데이트
     * [POST] /members/address/:user_id
     * 전송 정보 : tel, addr1, addr2
     */
    router.put('/members/address/:user_id', async (req, res, next) => {
        const user_id = req.get('user_id');
        const tel = req.post('tel');
        const addr1 = req.post('addr1');
        const addr2 = req.post('addr2');

        if (user_id === null || tel === null || addr1 === null || addr2 === null) {
            //  400 Bad Request -> 잘못된 요청
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
            const sql = 'UPDATE members SET tel=?, addr1=?, addr2=? WHERE user_id=?';
            const input_data = [tel, addr1, addr2, user_id];
            const [result1] = await dbcon.query(sql, input_data);

            // 결과 행 수가 0이라면 예외처리
            if (result1.affectedRows < 1) {
                throw new Error('수정된 데이터가 없습니다.');
            }

            // 새로 저장된 데이터의 PK값을 활용하여 다시 조회
            const sql2 =
                'SELECT user_id, name, status, tel, addr1, addr2 FROM members WHERE user_id=?';
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
     * 관리자 페이지 - 일반 회원 관리
     * 사용자 정보 수정
     * [PUT] /members/address/:user_id
     * 수정 정보 : name, status, tel, add
     */
    router.put('/members/:user_id', async (req, res, next) => {
        const user_id = req.get('user_id');
        const name = req.post('name');
        const status = req.post('status');
        const tel = req.post('tel');
        const add2 = req.post('addr2');

        if (user_id === null || name === null || tel === null || status === null || add2 === null) {
            //  400 Bad Request -> 잘못된 요청
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
            const sql = 'UPDATE members SET name=?, status=?, tel=?, addr2=? WHERE user_id=?';
            const input_data = [name, status, tel, add2, user_id];
            const [result1] = await dbcon.query(sql, input_data);

            // 결과 행 수가 0이라면 예외처리
            if (result1.affectedRows < 1) {
                throw new Error('수정된 데이터가 없습니다.');
            }

            // 새로 저장된 데이터의 PK값을 활용하여 다시 조회
            const sql2 =
                'SELECT user_id, name, status, tel, addr1, addr2 FROM members WHERE user_id=?';
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

    /** =-=-=-=-=-=-=-=-=-=-= router.delete =-=-=-=-=-=-=-=-=-=-=  */
    /**
     * 관리자 페이지 - 일반 회원 관리
     * [DELETE] /members/:user_id
     * 사용자 정보 삭제
     */
    router.delete('/members/:user_id', async (req, res, next) => {
        const email = req.delete('email');
        const password = req.delete('password');

        try {
            regexHelper.value(email, '이메일을 입력하세요');
            regexHelper.value(password, '비밀번호를 입력하세요');

            dbcon = await mysql2.createConnection(config.database);
            await dbcon.connect();

            // 아이디와 비밀번호가 일치하는 데이터를 조회 (조회결과에서 비밀번호는 제외)

            let sql1 = "UPDATE members SET status='N' WHERE email=? AND password=?";
            let args1 = [email, password];

            const [result1] = await dbcon.query(sql1, args1);

            // 결과 행 수가 0이라면 예외 처리
            if (result1.affectedRows < 1) {
                throw new Error('탈퇴처리에 실패했습니다.');
            }

            // 강제 로그아웃(세션 삭제)
            await req.session.destroy();
        } catch (err) {
            return next(err);
        } finally {
            dbcon.end();
        }
        res.sendJson();
    });

    /**
     * 관리자 페이지 - 일반 회원 관리
     * [DELETE] /members/logout
     * 사용자 정보 삭제
     */
    router.delete('/members/logout', async (req, res, next) => {
        if (!req.session.memberInfo) {
            return next(new BadRequestException('로그인 중이 아닙니다.'));
        }
        try {
            await req.session.destroy();
        } catch (e) {
            return next(e);
        }
        res.sendJson();
    });

    return router;
};
