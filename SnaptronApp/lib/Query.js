/**
 * Created by Phani on 2/19/2016.
 */

OPERATOR_EQ = "$eq";
OPERATOR_GT = "$gt";
OPERATOR_LT = "$lt";
OPERATOR_GTE = "$gte";
OPERATOR_LTE = "$lte";

QUERY_METADATA = "metadata";
QUERY_LAST_LOADED_DATE = "lastLoadedDate";
QUERY_REGIONS = "regions";
QUERY_FILTERS = "filters";
QUERY_JUNCTIONS = "junctions";

QUERY_FILTER_FIELD = "filter";
QUERY_FILTER_OP = "op";
QUERY_FILTER_VAL = "val";
QUERY_FILTER_SAMPLE_COUNT = "samples_count";
QUERY_FILTER_COV_SUM = "coverage_sum";
QUERY_FILTER_COV_AVG = "coverage_avg";
QUERY_FILTER_COV_MED = "coverage_median";
QUERY_FILTER_LENGTH = "length";


newQuery = function () {
    var queryDoc = {};
    queryDoc[QUERY_LAST_LOADED_DATE] = new Date(0);
    queryDoc[QUERY_METADATA] = [];
    queryDoc[QUERY_REGIONS] = [];
    queryDoc[QUERY_FILTERS] = [];
    queryDoc[QUERY_JUNCTIONS] = [];
    return queryDoc;
};
addQueryRegion = function (query, region) {
    check(region, String);
    query[QUERY_REGIONS].push(region);
    return query;
};
addQueryFilter = function (query, filter, opStr, val) {
    check(filter, String);
    if (!isNaN(val)) {
        var filterDoc = {};
        filterDoc[QUERY_FILTER_FIELD] = filter;
        filterDoc[QUERY_FILTER_OP] = getOpFromOptionStr(opStr);
        filterDoc[QUERY_FILTER_VAL] = val;
        query[QUERY_FILTERS].push(filterDoc);
    }
    return query;
};
addQueryJunctions = function (query, junctions) {
    var current = query[QUERY_JUNCTIONS];
    query[QUERY_JUNCTIONS] = current.concat(junctions);
    return query;
};
setQueryJunctions = function (query, junctions) {
    query[QUERY_JUNCTIONS] = junctions;
    return query;
};
updateQueryLastLoadedTime = function (query) {
    query[QUERY_LAST_LOADED_DATE] = new Date();
    return query;
};
addQueryMetadata = function (query, key, val) {
    check(key, String);
    query[QUERY_METADATA].push({key: val});
    return query;
};

function getOpFromOptionStr(opStr) {
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