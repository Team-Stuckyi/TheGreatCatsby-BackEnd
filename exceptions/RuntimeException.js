class RuntimeException extends Error {
    constructor(msg = "요청을 처리하는데 실패했습니다.") {
        super(msg);
        // 멤버변수 추가
        this._statusCode = 500;
    }
    get statusCode() {
        return this._statusCode;
    }
}

module.exports = RuntimeException;
