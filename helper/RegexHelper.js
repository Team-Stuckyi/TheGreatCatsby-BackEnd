const BadRequestException = require("../exceptions/BadRequestException");

class RegexHelper {
    value(content, msg) {
        if (content == undefined || content == null || content.trim().length == 0) {
            throw new BadRequestException(msg);
        }
        return true;
    }

    maxLength(content, len, msg) {
        if (!this.value(content) || content.length > len) {
            throw new BadRequestException(msg);
        }

        return true;
    }

    minLength(selector, len, msg) {
        //앞뒤의 공백을 제외하고 내용만 추출
        if (!this.value(content) || content.length < len) {
            throw new BadRequestException(msg);
        }

        return true;
    }

    compareTo(origin, compare, msg) {
        var src = origin.trim(); //원본값을 가져온다.
        var dsc = compare.trim(); //비교할 값을 가져온다.

        if (src != dsc) {
            throw new BadRequestException(msg);
        }
        return true;
    }

    field(content, msg, regexExpr) {
        var src = content.trim();

        //입력값이 없거나 입력값에 대한 정규표현식 검사가 실패라면?
        if (!src || !regexExpr.test(src)) {
            throw new BadRequestException(msg);
        }
        return true;
    }

    num(content, msg) {
        return this.field(content, msg, /^[0-9]*$/);
    }

    eng(content, msg) {
        return this.find(content, msg, /^[a-zA-Z]*$/);
    }

    kor(content, msg) {
        return this.field(content, msg, /^[ㄱ-ㅎ가-힣]*$/);
    }

    engNum(content, msg) {
        return this.field(content, msg, /^[a-zA-Z0-9]*$/);
    }

    korNum(content, msg) {
        return this.field(content, msg, /^[ㄱ-ㅎ가-힣0-9]*$/);
    }

    email(content, msg) {
        return this.field(
            content,
            msg,
            /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i
        );
    }

    cellphone(content, msg) {
        return this.field(content, msg, /^01(?:0|1|[6-9])(?:\d{3}|\d{4})\d{4}$/);
    }

    telphone(content, msg) {
        return this.field(content, msg, /^\d{2,3}\d{3,4}\d{4}$/);
    }

    phone(content, msg) {
        var check1 = /^01(?:0|1|[6-9])(?:\d{3}|\d{4})\d{4}$/;
        var check2 = /^\d{2,3}\d{3,4}\d{4}$/;

        var src = content.trim();

        if (!src || (!check1.test(src) && !check2.test(src))) {
            throw new BadRequestException(msg);
        }
        return true;
    }
}

module.exports = new RegexHelper();
