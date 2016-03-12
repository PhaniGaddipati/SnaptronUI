/**
 * Created by Phani on 3/1/2016.
 */

numberWithCommas = function (x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

filterOpToStr = function (str) {
    if (str == MONGO_OPERATOR_EQ) {
        return "==";
    }
    if (str == MONGO_OPERATOR_GT) {
        return ">";
    }
    if (str == MONGO_OPERATOR_LT) {
        return "<";
    }
    if (str == MONGO_OPERATOR_GTE) {
        return "≥";
    }
    if (str == MONGO_OPERATOR_LTE) {
        return "≤";
    }
};

/**
 * Converts an operator string to the Mongo operator.
 * @param opStr
 * @returns {*}
 */
getOpFromOptionStr = function (opStr) {
    switch (opStr) {
        case '>':
            return MONGO_OPERATOR_GT;
        case '<':
            return MONGO_OPERATOR_LT;
        case '=':
            return MONGO_OPERATOR_EQ;
        case '≥':
            return MONGO_OPERATOR_GTE;
        case '≤':
            return MONGO_OPERATOR_LTE;
    }
    return null;
};

getFilterFromFields = function (field, opStr, val) {
    var filter = {};
    if (!isNaN(val)) {
        filter[QRY_FILTER_FIELD] = field;
        filter[QRY_FILTER_OP]    = getOpFromOptionStr(opStr);
        filter[QRY_FILTER_VAL]   = val;
        return filter;
    }
};