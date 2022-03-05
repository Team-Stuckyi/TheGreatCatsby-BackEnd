module.exports = (app) => {
    const router = require('express').Router();
    const config = require('../../helper/_config');
    const logger = require('../../helper/LogHelper');
    const util = require('../../helper/UtilHelper');
    const fileHelper = require('../../helper/FileHelper');
    const url = require('url');
    const path = require('path');

    const multer = require('multer');
    const thumbnail = require('node-thumbnail').thumb;

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

            const result = {
                rt: result_code,
                rtmsg: result_msg,
                item: req.file,
            };

            logger.debug(result.item.url);

            res.status(result_code).send(result);
        });
    });

    return router;
};

/**
 *
 *
 *
 *
 * 사진 업로드
 *
 *
 *
 *
 *
 *
 */

const fileHelper = require('../helper/FileHelper');
const url = require('url');
const path = require('path');
const multer = require('multer');

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
router.post('/review/upload', (req, res, next) => {
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

        const result = {
            rt: result_code,
            rtmsg: result_msg,
            item: req.file,
        };

        logger.debug(result.item.url);

        res.status(result_code).send(result);
    });
});
