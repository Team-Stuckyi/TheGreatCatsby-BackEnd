/**
 * 로그 처리 모듈
 */

/** 1) 패키지 참조 */
const fileHelper = require("./FileHelper.js"); // 로그 처리 모듈
const winston = require("winston");
const winstonDaily = require("winston-daily-rotate-file");
const path = require("path");
const config = require("./_config");

/** 2) 로그가 저장될 폴더 생성 */
fileHelper.mkdirs(config.log.debug.path);
fileHelper.mkdirs(config.log.error.path);

/** 3) 로그가 출력할 형식 지정 함수 참조 */
const { combine, timestamp, printf, splat, simple } = winston.format;

/** 4) winston 객체 만들기 */
const logger = winston.createLogger({
    // 로그의 전반적인 형식
    format: combine(
        timestamp({
            // 날짜 출력형식은 https://day.js.org/docs/en/display/format 참고
            // format : "YYYY-MM-DD HH:mm:ss"
            format: "YY/MM/DD HH:mm.ss SSS",
        }),
        printf((info) => {
            return `${info.timestamp} [${info.level}: ${info.message}]`;
        }),
        splat()
    ),
    // 일반 로그 규칙 정의
    transports: [
        // 하루에 하나씩 파일 형태로 기록하기 위한 설정
        new winstonDaily({
            name: "debug-file",
            level: config.log.debug.level, // 출력할 로그의 수준
            datePattern: "YYMMDD", // 파일 이름에 표시될 날짜 형식
            dirname: config.log.debug.path, // 파일이 저장될 위치
            filename: "log_%DATE%.log", // 파일이름 형식. %Date%는 datePattern의 값
            maxsize: 50000000,
            maxFiles: 50,
            zippedArchive: true,
        }),

        // 하루에 하나씩 파일 형태로 기록하기 위한 설정
        new winstonDaily({
            name: "error-file",
            level: config.log.error.level,
            datePattern: "YYMMDD",
            dirname: config.log.error.path,
            filename: "log_%DATE%.log",
            maxsize: 50000000,
            maxFiles: 50,
            zippedArchive: true,
        }),
    ],
});

/** 5) 콘솔 설정 */
// 프로덕션 버전(=상용화 버전)이 아니라면?
if (process.env.NODE_ENV !== "production") {
    logger.add(
        new winston.transports.Console({
            prettyPrint: true,
            showLevel: true,
            level: config.log.debug.level,
            format: combine(
                winston.format.colorize(),
                printf((info) => {
                    return `${info.timestamp} [${info.level}]: ${info.message}`;
                })
            ),
        })
    );
}

/** 6) 모듈 내보내기 */
module.exports = logger;
