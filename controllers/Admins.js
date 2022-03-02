/**
 *  admins 테이블에 대한 CRUD 기능을 수행하는 Restful API
 */

/** 모듈 참조 부분 */
const config = require("../helper/_config");
const logger = require("../helper/LogHelper");
const regexHelper = require("../helper/RegexHelper");
const utilHelper = require("../helper/UtilHelper");
const BadRequestException = require("../exceptions/BadRequestException");
const RuntimeException = require("../exceptions/RuntimeException");
const PageNotFoundException = require("../exceptions/PageNotFoundException");
const router = require("express").Router();
const mysql2 = require("mysql2/promise");

module.exports = (app) => {
    let dbcon = null;

    /**
     * 관리자 페이지 - 관리자 회원 관리 페이지
     * 관리자 정보를 화면에 보여주는 데이터
     * [GET] /manageadmin
     * 전송 정보 : email, name, status, tel, reg_date
     */

    router.get("/admins/all", async (req, res, next) => {
        // 데이터 조회 결과가 저장될 빈 변수
        let json = null;

        try {
            // 데이터베이스 접속
            dbcon = await mysql2.createConnection(config.database);
            await dbcon.connect();

            //만약 탈퇴회원은 출력하고 싶지 않은 경우 WHERE status = 'N'
            let sql =
                "SELECT user_id, email, name, tel, status, DATE_FORMAT(reg_date, '%Y-%m-%d') as reg_date FROM admins";
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
     * 관리자 페이지 - 관리자 회원 가입
     * 관리자 회원을 등록하는 데이터
     * [POST] /manageadmin
     * 전송 정보 : email, password, name, status, tel, reg_date
     */

    router.post("/admins/join", async (req, res, next) => {
        // 파라미터 받기
        const email = req.post("email");
        const password = req.post("password");
        const name = req.post("name");

        if (email === null) {
            return next(new Error(400));
        }

        /** 데이터 저장하기 */
        let json = null;

        try {
            //데이터베이스 접속
            dbcon = await mysql2.createConnection(config.database);
            await dbcon.connect();

            //전체 데이터 수를 조회 (중복검사)
            const sql1 = "SELECT COUNT(*) AS cnt FROM admins WHERE email=?";
            const args1 = [email];

            const [result1] = await dbcon.query(sql1, args1);

            const totalCount = result1[0].cnt;

            if (totalCount > 0) {
                throw new BadRequestException("이미 사용중인 아이디 입니다.");
            }

            //전송받은 모든 정보를 회원 테이블에 저장 (INSERT)
            const sql2 =
                "INSERT INTO admins (email, password, name, status, reg_date) VALUES (?,?,?,'Y', now())";
            const input_data = [email, password, name];
            const [result2] = await dbcon.query(sql2, input_data);
        } catch (err) {
            return next(err);
        } finally {
            dbcon.end();
        }

        res.sendJson();
    });

    /**
     * 관리자 페이지 - 관리자 회원 로그인 페이지
     * 관리자 회원이 로그인하는 페이지
     * [POST] /login
     * 전송 정보 : email, password
     */

    router.post("/admins/login", async (req, res, next) => {
        // 파라미터 받기
        const email = req.post("email");
        const password = req.post("password");

        // 데이터 조회 결과가 저장될 빈 변수
        let json = null;

        try {
            // 데이터베이스 접속
            dbcon = await mysql2.createConnection(config.database);
            await dbcon.connect();

            // 아이디와 비밀번호가 일치하는 데이터 조회 (조회 결과에서 비밀번호는 제외)
            let sql1 =
                "SELECT user_id, email, name, status, tel, reg_date FROM admins WHERE email=? AND password=?";
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
            return next(
                new BadRequestException("아이디나 비밀번호가 잘못 되었습니다.")
            );
        }

        // 탈퇴한 회원은 로그인 금지
        if (json[0].status == "N") {
            return next(new BadRequestException("탈퇴한 회원입니다."));
        }

        // 조회 결과를 세션에 저장
        req.session.memberInfo = json[0];
        console.log(json);
        res.sendJson();
    });

    /**
     * 관리자 페이지 - 관리자 회원 로그아웃
     * 로그인 된 관리자 회원을 로그아웃 처리
     * [DELETE] /members
     * 전송정보 : session으로 넘겨 처리
     */

    router.delete("/admins/logout", async (req, res, next) => {
        if (!req.session.memberInfo) {
            return next(new BadRequestException("로그인 중이 아닙니다."));
        }
        try {
            await req.session.destroy();
        } catch (e) {
            return next(e);
        }
        res.sendJson();
    });

    /**
     * 관리자 페이지 - 회원정보 수정
     * 회원과 관련된 처리의 경우 UPDATE나 DELETE에서 사용할 WHERE의 PK값을
     * 보안상의 이유로 별도 전송하지 않는다.
     * 로그인을 할 경우 회원의 정보가 SESSION에 저장되어 있을 것이므로
     * 모든 개별 회원에 대한 접근은 SESSION 데이터를 활용해야 한다.
     * [PUT] /manageadmin
     * 전송정보 : session으로 넘겨 처리
     */
    router.put("/admins/edit", async (req, res, next) => {
        if (!req.session.memberInfo) {
            return next(new BadRequestException("로그인 중이 아닙니다."));
        }
    });

    /**
     * 관리자 페이지 - 회원탈퇴 처리
     * 탈퇴 처리가 회원 데이터를 삭제하는 것을 의미하므로 DELETE방식의 접근이 맞지만,
     * 컬럼의 값을 UPDATE하는 것으로 처리 (status Y => N)
     * [DELETE] /manageadmin
     * 전송정보 : status
     */

    router.delete("/admims/getout", async (req, res, next) => {
        const email = req.delete("email");
        const password = req.delete("password");
        const status = req.delete("status");

        try {
            regexHelper.value(email, "이메일을 입력하세요");
            regexHelper.value(password, "비밀번호를 입력하세요");

            dbcon = await mysql2.createConnection(config.database);
            await dbcon.connect();

            // 아이디와 비밀번호가 일치하는 데이터를 조회 (조회결과에서 비밀번호는 제외)

            let sql1 =
                "UPDATE admins SET status='N' WHERE email=? AND password=?";
            let args1 = [email, password];

            const [result1] = await dbcon.query(sql1, args1);

            // 결과 행 수가 0이라면 예외 처리
            if (result1.affectedRows < 1) {
                throw new Error("탈퇴처리에 실패했습니다.");
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
    return router;
};
