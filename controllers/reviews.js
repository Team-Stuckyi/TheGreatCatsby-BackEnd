/**
 *  admins 테이블에 대한 CRUD 기능을 수행하는 Restful API
 */

/** 모듈 참조 부분 */
const config = require("../helper/_config");
const logger = require("../helper/LogHelper");
const regexHelper = require("../helper/RegexHelper");
const utilHelper = require("../helper/UtilHelper");
const BadRequestException = require("../exceptions/BadRequestException");
const router = require("express").Router();
const mysql2 = require("mysql2/promise");

module.exports = (app) => {
    let dbcon = null;

    // Test
    router.get("/test", (req, res, next) => {
        res.end("test");
    });

    /*
        *= reviewlist.html =*
        - 전송방식: DELETE
        - 전송정보: -
        - 설명: 리뷰 삭제하기
    */
    router.delete("/del_review", async (req, res, next) => {
        // http://url/del_review?review_id=??? 접근시 해당 리뷰 삭제됨
        const review_id = req.body.review_id;

        // review_id 파라미터로 제공되었을 경우
        if (review_id) {
            dbcon = await mysql2.createConnection(config.database);
            await dbcon.connect();

            // 아이디와 비밀번호가 일치하는 데이터를 조회 (조회결과에서 비밀번호는 제외)
            let sql1 = "DELETE FROM reviews WHERE review_id = ?";
            let args1 = [review_id];

            const [result1] = await dbcon.query(sql1, args1);

            // 결과 행 수가 0이라면 예외 처리
            if (result1.affectedRows < 1) {
                throw new Error("리뷰 삭제에 실패했습니다.");
            }

            res.sendJson();
        }
        
        // review_id 파라미터가 존재하지 않을 경우
        else {
            res.send("<script>alert('유효하지 않은 리뷰입니다.');</script>");
        }
    })
    

    /*
        *= reviewlist.html =*
        - 전송방식: GET
        - 전송정보: review_id, review_text, stars, write_date
        - 설명: 리뷰 정보 가져오기
    */
    router.get("/get_reviews", async (req, res, next) => {
        // 리뷰를 가져올 대상 상품 ID
        const prod_id = req.params.prod_id;
        // prod_id 파라미터가 제공되었을 경우
        if (prod_id) {
            // 데이터베이스에서 대상 Product의 리뷰를 모두 가져와서 반환
            let resJSON = {
                0: {
                    "review_id": "0",
                    "review_text": "너무좋아요 잘쓰고있어요",
                    "stars": 5,
                    "write_date": String(new Date())
                }
            }
            res.json(resJSON);
        }
        // prod_id 파라미터가 주어지지 않았을 경우
        else {
            // 데이터베이스에 등록된 모든 리뷰를 반환
            resJSON = {
                0: {
                    "review_id": "0",
                    "review_text": "너무좋아요 잘쓰고있어요",
                    "stars": 5,
                    "write_date": String(new Date())
                },
                1: {
                    "review_id": "1",
                    "review_text": "마감 퀄리티가 너무구려요",
                    "stars": 2,
                    "write_date": String(new Date())
                }
            }
            res.json(resJSON);
        }
    });

    /*
        *= prodlist.html =*
        - 전송방식: GET
        - 전송정보: stars, review_text, write_date, user_id, review_photo
        - 설명: 구매후기 - 평점, 후기글, 작성날짜, 리뷰사진
    */
        router.get("/get_reviews2", async (req, res, next) => {
            // 리뷰를 가져올 대상 상품 ID
            const prod_id = req.params.prod_id;
            // prod_id 파라미터가 제공되었을 경우
            if (prod_id) {
                // 데이터베이스에서 대상 Product의 리뷰를 모두 가져와서 반환
                let resJSON = {
                    0: {
                        "review_id": "0",
                        "review_text": "너무좋아요 잘쓰고있어요",
                        "stars": 5,
                        "user_id": "xeros",
                        "review_photo": "http://localhost/images/review.jpg",
                        "write_date": String(new Date())
                    }
                }
                res.json(resJSON);
            }
            // prod_id 파라미터가 주어지지 않았을 경우
            else {
                // 데이터베이스에 등록된 모든 리뷰를 반환
                resJSON = {
                    0: {
                        "review_id": "0",
                        "review_text": "너무좋아요 잘쓰고있어요",
                        "stars": 5,
                        "user_id": "xeros",
                        "review_photo": "http://localhost/images/review.jpg",
                        "write_date": String(new Date())
                    },
                    1: {
                        "review_id": "1",
                        "review_text": "마감 퀄리티가 너무구려요",
                        "stars": 2,
                        "user_id": "shtmfwo123",
                        "review_photo": "http://localhost/images/review.jpg",
                        "write_date": String(new Date())
                    }
                }
                res.json(resJSON);
            }
        });
    
    /*
        *= review.html =*
        - 전송방식: GET + JOIN
        - 전송정보: review_id, stars, write_date, review_text, review_photo
        - 설명: 리뷰 조회
    */
    
    
    /*
        *= review.html =*
        - 전송방식: POST
        - 전송정보: stars, review_text, review_photo
        - 설명: 리뷰 작성
    */
    router.post("/write_review", async (req, res, next) => {
        // 파라미터 받기
        const stars = req.post("stars");
        const review_text = req.post("review_text");
        const review_photo = req.post("review_photo"); // 파일 업로드 구현?

        // POST 전송값 Response (임시)
        res.json({ "stars": stars, "review_text": review_text, "review_photo": review_photo });
    });
    
    return router;
};
