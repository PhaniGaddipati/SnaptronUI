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
        "region": region.toLowerCase(),
        "length": null,
        "samples_count": null,
        "coverage_sum": null,
        "coverage_avg": null,
        "coverage_median": null
    }
};

setLength = function (query, op, val) {
    query.length = op + str(val);
};
setSamplesCount = function (query, op, val) {
    query.samples_count = op + str(val);
};
setCoverageSum = function (query, op, val) {
    query.coverage_sum = op + str(val);
};
setCoverageAvg = function (query, op, val) {
    query.coverage_avg = op + str(val);
};
setCoverageMedian = function (query, op, val) {
    query.coverage_median = op + str(val);
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