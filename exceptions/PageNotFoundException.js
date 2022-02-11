class PageNotFoundException extends Error {
    constructor(msg = "페이지를 찾을 수 없습니다.") {
        super(msg);
        // 멤버변수 추가
        this._statusCode = 404;
    }
    get statusCode() {
        return this._statusCode;
    }
}

module.exports = PageNotFoundException;
