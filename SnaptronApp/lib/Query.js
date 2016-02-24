/**
 * Created by Phani on 2/19/2016.
 */

const OPERATOR_EQ = ":";
const OPERATOR_GT = ">";
const OPERATOR_LT = "<";
const OPERATOR_GTE = ">:";
const OPERATOR_LTE = "<:";

newQuery = function (region) {
    return {
        "region": region,
        "length": null,
        "samples_count": null,
        "coverage_sum": null,
        "coverage_avg": null,
        "coverage_median": null
    }
};

setQueryLength = function (query, op, val) {
    if (val != undefined && val != null && !isNaN(val)) {
        query.length = getOpFromOption(op) + String(val);
    }
};
setQuerySamplesCount = function (query, op, val) {
    if (val != undefined && val != null && !isNaN(val)) {
        query.samples_count = getOpFromOption(op) + String(val);
    }
};
setQueryCoverageSum = function (query, op, val) {
    if (val != undefined && val != null && !isNaN(val)) {
        query.coverage_sum = getOpFromOption(op) + String(val);
    }
};
setQueryCoverageAvg = function (query, op, val) {
    if (val != undefined && val != null && !isNaN(val)) {
        query.coverage_avg = getOpFromOption(op) + String(val);
    }
};
setQueryCoverageMedian = function (query, op, val) {
    if (val != undefined && val != null && !isNaN(val)) {
        query.coverage_median = getOpFromOption(op) + String(val);
    }
};

getQueryString = function (query) {
    var queryStr = "regions=" + query.region;
    if (query.length) {
        queryStr += "&rfilter=length" + query.length;
    }
    if (query.samples_count) {
        queryStr += "&rfilter=samples_count" + query.samples_count;
    }
    if (query.coverage_sum) {
        queryStr += "&rfilter=coverage_sum" + query.coverage_sum;
    }
    if (query.coverage_avg) {
        queryStr += "&rfilter=coverage_avg" + query.coverage_avg;
    }
    if (query.coverage_median) {
        queryStr += "&rfilter=coverage_median" + query.coverage_median;
    }
    return queryStr;
};

getTokensAsJSONFromQueryString = function (queryStr) {
    check(queryStr, String);
    var tokens = queryStr.split("&");
    var regions = [];
    var rfilters = [];
    for (var i = 0; i < tokens.length; i++) {
        var pair = tokens[i].split("=");
        if (pair[0] === "regions") {
            regions.push(pair[1]);
        } else if (par[0] === "rfilter") {
            rfilters.push(pair[1]);
        }
    }
    return {
        "regions": regions,
        "rfilters": rfilters
    }
};

function getOpFromOption(opStr) {
    switch (opStr) {
        case '>':
            return OPERATOR_GT;
        case '<':
            return OPERATOR_LT;
        case '=':
            return OPERATOR_EQ;
        case '≥':
            return OPERATOR_GTE;
        case '≤':
            return OPERATOR_LTE;
    }
    return null;
}