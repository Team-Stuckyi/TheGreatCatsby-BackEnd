/**
 * ------------------------------------------------------------
 * 1) 모듈 참조
 * ------------------------------------------------------------
 */
// 직접 구현한 모듈

const config = require('./helper/_config');
const logger = require('./helper/LogHelper');
const util = require('./helper/UtilHelper');
const fileHelper = require('./helper/FileHelper');
const webHelper = require('./helper/WebHelper');
const expressSession = require('express-session');
const ExpressMysqlSession = require('express-mysql-session');
const BadRequestException = require('./exceptions/BadRequestException');
const PageNotFoundException = require('./exceptions/PageNotFoundException');
const RuntimeException = require('./exceptions/RuntimeException');

// 내장 모듈
const url = require('url');
const path = require('path');
// 설치가 필요한 모듈
/**
 * yarn add express
 * yarn add express-useragent
 * yarn add serve-static
 * yarn add serve-favicon
 * yarn add body-parser
 * yarn add method-override
 * yarn add cookie-parser
 * yarn add express-session
 * yarn add multer
 * yarn add nodemailer
 * yarn add node-thumbnail
 */
// express 본체
const express = require('express');
// CORS 문제 해결을 위한 모듈
const cors = require('cors');
// 클라이언트의 정보를 조회할 수 있는 기능
const useragent = require('express-useragent');
// 특정 폴더의 파일을 URL로 노출 시킴
const static = require('serve-static');
// favicon처리
const favicon = require('serve-favicon');
// POST 파라미터처리
const bodyParser = require('body-parser');
// PUT 파라미터처리
const methodOverride = require('method-override');

/**
 * ------------------------------------------------------------
 * 2) 객체 생성
 * ------------------------------------------------------------
 */
// 여기서 생성한 app 객체의 use() 함수를 사용해서
// 각종 외부기능, 설정내용, URL을 계속해서 확장하는 형태로 구현이 진행된다.
const app = express();

// CORS 문제 해결 모듈 사용 설정
app.use(cors());

/**
 * ------------------------------------------------------------
 * 3) 클라이언트의 접속시 초기화 -> 접속한 클라이언트의 정보를 파악
 * ------------------------------------------------------------
 */

// app 객체에 UserAgent 모듈을 탑재
app.use(useragent.express());

/** req,res 객체의 기능을 확장하는 모듈 */
app.use(webHelper());

// 클라이언트의 접속을 감지
app.use((req, res, next) => {
    logger.debug('클라이언트가 접속했습니다.');

    // 클라이언트가 접속한 시간
    const beginTime = Date.now();

    // 클라이언트의 IP주소
    const ip =
        req.headers['x-forwarded-for'] ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        req.connection.socket.remoteAddress;

    // 클라이언트의 디바이스 정보 기록 (UserAgent 사용)
    logger.debug(
        `[client] ${ip} / ${req.useragent.os} / ${req.useragent.browser} ( ${req.useragent.version}) / ${req.useragent.platform}`
    );

    // 클라이언트가 요청한 페이지 URL
    // 콜백함수에 전달되는 req 파라미터는 클라이언트가 요청한 URL의 각 부분을 변수로 담고 있다.
    const current_url = url.format({
        protocol: req.protocol, // ex) http://
        host: req.get('host'), // ex) 172.16.141.1
        port: req.port, // ex) 3000
        pathname: req.originalUrl, // ex) /page1.html
    });

    logger.debug(`[${req.method}]` + decodeURIComponent(current_url));

    // 클라이언트의 접속이 종료된 경우의 이벤트
    res.on('finish', () => {
        // 접속 종료시간
        const endTime = Date.now();

        // 이번 접속에서 클라이언트가 머문 시간 = 백엔드가 실행하는게 걸린 시간
        const time = endTime - beginTime;
        logger.debug(`클라이언트의 접속이 종료되었습니다. ::: [runtime] ${time} ms`);
        logger.debug('--------------------------------------------------');
    });

    // 이 콜백함수를 종료하고 요청 URL에 연결된 기능으로 제어를 넘김
    next();
});

/**
 * ------------------------------------------------------------
 * 4) Express 객체의 추가 설정
 * ------------------------------------------------------------
 */

/** POST 파라미터 수신 모듈 설정 */
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.text()); //TEXT형식의 파라미터 수신 가능
app.use(bodyParser.json()); // JSON형식의 파라미터 수신 가능

/** HTTP PUT, DELETE 전송방식 확장 */
app.use(methodOverride('X-HTTP-Method'));
app.use(methodOverride('X-HTTP-Method-Override'));
app.use(methodOverride('X-Method-Override'));
app.use(methodOverride('_method'));

// HTML,CSS,IMG,JS 등의 정적 파일을 URL에 노출시킬 폴더 연결
app.use('/', static(config.public_path));
app.use('/_files/uploads', static(config.public_path));

// favicon 설정
app.use(favicon(config.favicon_path));

// 라우터(URL 분배기) 객체 설정 --> 맨마지막에 설정
const router = express.Router();
// 라우터를 express에 등록
app.use('/', router);

/**
 * ------------------------------------------------------------
 * 5) 각 URL별 백엔드 기능 정의
 * ------------------------------------------------------------
 */

/** 세션 설정 */
app.use(
    expressSession({
        secret: config.secure.session_encrypt_key,
        resave: false,
        saveUninitialized: false,
        store: new ExpressMysqlSession(config.database),
    })
);

/** Custom Router */
app.use(require('./controllers/Members.js')(app));
app.use(require('./controllers/Admins.js')(app));
app.use(require('./controllers/Orders.js')(app));
app.use(require('./controllers/Reviews.js')(app));
app.use(require('./controllers/Products.js')(app));

// 런타임 에러가 발생한 경우에 대한 일괄 처리
app.use((err, req, res, next) => {
    if (err instanceof BadRequestException) {
        res.sendError(err);
    } else {
        res.sendError(new RuntimeException(err.message));
    }
});

// 앞에서 정의하지 않은 그 밖의 URL에 대한 일괄 처리
app.use('*', (req, res, next) => {
    const err = new PageNotFoundException();
    res.sendError(err);
});

/**
 * ------------------------------------------------------------
 * 6) 설정한 내용을 기반으로 서버 구동 시작
 * ------------------------------------------------------------
 */
// 백엔드를 가동하고 3000번 포트에서 대기
const ip = util.myip();

app.listen(config.server_port, () => {
    logger.debug('--------------------------------------------------');
    logger.debug('|              start Express Server              |');
    logger.debug('--------------------------------------------------');

    ip.forEach((v, i) => {
        logger.debug('server address => http://' + v + ':' + config.server_port);
    });

    logger.debug('--------------------------------------------------');
});
