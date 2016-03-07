/**
 * Created by Phani on 2/26/2016.
 */

getJunctions = function (junctionIds) {
    check(junctionIds, [String]);
    return Junctions.find({
        "_id": {
            "$in": junctionIds
        }
    }).fetch();
};

getJunction = function (junctionId) {
    check(junctionId, String);
    return Junctions.findOne({"_id": junctionId});
};

hasJunction = function (junctionId) {
    check(junctionId, String);
    return Junctions.find({"_id": junctionId}, {"limit": 1}).count() > 0;
};

/**
 * Adds the junctions to the
 * database, if they don't already exist.
 * @param rawTSV
 * @returns {Array} the ids of the inserted junctions
 */
addJunctions = function (junctions) {
    var ids = [];
    for (var i = 0; i < junctions.length; i++) {
        Junctions.upsert({"_id": junctions[i]["_id"]}, junctions[i]);
        ids.push(junctions[i]["_id"]);
    }
    return ids;
};

/**
 * Returns a cursor for the junctions from the given
 * query with filters applied
 * @param query
 */
findJunctionsForQuery = function (queryId) {
    check(queryId, String);

    var query = getQuery(queryId);
    var queryRegions = getRegions(query[QRY_REGIONS]);
    var queryJunctions = new Set();

    for (var i = 0; i < queryRegions.length; i++) {
        var junctionIds = queryRegions[i][REGION_JUNCTIONS];
        for (var j = 0; j < junctionIds.length; j++) {
            queryJunctions.add(junctionIds[j]);
        }
    }

    var filters = query[QRY_FILTERS];
    var selector = {
        "_id": {
            "$in": Array.from(queryJunctions)
        }
    };

    // Add query filters to the selector
    for (i = 0; i < filters.length; i++) {
        var filterDoc = filters[i];
        var field = filterDoc[QRY_FILTER_FIELD];
        var op = filterDoc[QRY_FILTER_OP];
        var val = filterDoc[QRY_FILTER_VAL];

        var restriction = selector[field];
        if (restriction == null || restriction == undefined) {
            restriction = {};
        }
        restriction[op] = val;
        selector[field] = restriction;
    }

    return Junctions.find(selector);
};

function castMember(toCast, type) {
    check(type, String);
    switch (type) {
        case "str[]":
            return String(toCast).split(",");
        case "float[]":
            var elems = String(toCast).split(",");
            var floats = [];
            for (var i = 0; i < elems.length; i++) {
                floats.push(parseFloat(elems[i]));
            }
            return floats;
        case "str":
            return String(toCast);
        case "int":
            return parseInt(toCast);
        case "bool":
            return parseInt(toCast) != 0;
        case "float":
            return parseFloat(toCast);
    }
}

getJunctionNumberKeys = function () {
    var keys = Object.keys(JNCT_COL_TYPES);
    var numberKeys = [];
    for (var i = 0; i < keys.length; i++) {
        var type = JNCT_COL_TYPES[keys[i]];
        if (type === "int" || type === "float") {
            numberKeys.push(keys[i])
        }
    }
    return numberKeys;
};

getJunctionBoolKeys = function () {
    var keys = Object.keys(JNCT_COL_TYPES);
    var boolKeys = [];
    for (var i = 0; i < keys.length; i++) {
        var type = JNCT_COL_TYPES[keys[i]];
        if (type === "bool") {
            boolKeys.push(keys[i])
        }
    }
    return boolKeys;
};