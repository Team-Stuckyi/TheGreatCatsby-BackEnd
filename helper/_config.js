const path = require('path');
const keyarr = require('./key.json');

module.exports = {
    // 로그 파일이 저장될 경로 및 출력 레벨
    log: {
        // 개발자가 필요에 의해 기록하는 정보들을 저장할 파일
        debug: {
            path: path.join(__dirname, '../_files/_logs'),
            level: 'debug',
        },
        // 시스템에 심각한 문제가 발생했을 떄의 정보를 저장할 파일
        error: {
            path: path.join(__dirname, '../_files/_logs'),
            level: 'error',
        },
    },

    /** 웹 서버 포트번호 */
    server_port: 3000,

    /** public 디렉토리 경로 */
    public_path: path.join(__dirname, '../public'),

    /** favicon 경로 */
    favicon_path: path.join(__dirname, '../public/favicon.png'),

    /** 쿠키 저장시 사용할 도메인 */
    // 1) localhost인 경우 공백으로 설정
    // 2) 도메인이 naver.com인 경우 앞에 점을 붙여서 명시 ->".naver.com"
    cookie_domain: '',

    /** 보안키 (암호화 키) */
    secure: {
        cookie_encrypt_key: '1234567890',
        session_encrypt_key: '1234567890',
    },

    /** 업로드 경로 */
    upload: {
        path: 'upload',
        dir: path.join(__dirname, '../_files/upload'),
        max_size: 1024 * 1024 * 20,
        max_count: 10,
    },

    /** 썸네일 이미지 생성 경로 */
    thumbnail: {
        sizes: [480, 750, 1080],
        dir: path.join(__dirname, '../_files/thumb'),
    },

    /** 데이터베이스 연동 정보 */
    database: {
        host: keyarr.key[0].host, // mySQL 서버 주소 (다른 PC에 접속인 경우 IP접속)
        user: keyarr.key[2].user, // 접근 권한 아이디 (root = 관리자)
        password: keyarr.key[3].password, // 설치시 입력한 비밀번호
        database: keyarr.key[4].database, // 사용할 데이터베이스 이름
    },
};
