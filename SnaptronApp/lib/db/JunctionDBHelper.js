/**
 * Created by Phani on 2/26/2016.
 */

SnapApp.JunctionDB = {};

SnapApp.JunctionDB.getJunctions = function (junctionIds) {
    check(junctionIds, [String]);
    return Junctions.find({
        "_id": {
            "$in": junctionIds
        }
    }).fetch();
};

SnapApp.JunctionDB.getJunction = function (junctionId) {
    check(junctionId, String);
    return Junctions.findOne({"_id": junctionId});
};

SnapApp.JunctionDB.hasJunction = function (junctionId) {
    check(junctionId, String);
    return Junctions.find({"_id": junctionId}, {"limit": 1}).count() > 0;
};

/**
 * Adds the junctions to the
 * database, if they don't already exist.
 * @param junctions
 * @returns {Array} the ids of the inserted junctions
 */
SnapApp.JunctionDB.addJunctions = function (junctions) {
    return Junctions.batchInsert(junctions);
};

/**
 * Returns a cursor for the junctions from the given
 * query with filters applied
 * @param queryId
 * @param fieldsProj
 * @param limProj
 */
SnapApp.JunctionDB.findJunctionsForQuery = function (queryId, fieldsProj, limProj) {
    check(queryId, String);

    var query = SnapApp.QueryDB.getQuery(queryId);
    if (query == null) {
        return null;
    }
    var queryRegions   = SnapApp.RegionDB.getRegions(query[QRY_REGIONS]);
    var queryJunctions = new Set();

    for (var i = 0; i < queryRegions.length; i++) {
        var junctionIds = queryRegions[i][REGION_JUNCTIONS];
        for (var j = 0; j < junctionIds.length; j++) {
            queryJunctions.add(junctionIds[j]);
        }
    }

    var filters  = query[QRY_FILTERS];
    var selector = {
        "_id": {
            "$in": Array.from(queryJunctions)
        }
    };

    // Add query filters to the selector
    for (i = 0; i < filters.length; i++) {
        var filterDoc = filters[i];
        var field     = filterDoc[QRY_FILTER_FIELD];
        var op        = filterDoc[QRY_FILTER_OP];
        var val       = filterDoc[QRY_FILTER_VAL];

        var restriction = selector[field];
        if (restriction == null || restriction == undefined) {
            restriction = {};
        }
        restriction[op] = val;
        selector[field] = restriction;
    }

    var proj = {};
    if (fieldsProj) {
        proj.fields = fieldsProj;
    }
    if (limProj) {
        proj.limit = limProj;
        proj.sort  = {
            samples_count: -1
        }
    }

    return Junctions.find(selector, proj);
};

SnapApp.JunctionDB.getJunctionNumberKeys = function () {
    var keys       = Object.keys(JNCT_COL_TYPES);
    var numberKeys = [];
    for (var i = 0; i < keys.length; i++) {
        var type = JNCT_COL_TYPES[keys[i]];
        if (type === "int" || type === "float") {
            numberKeys.push(keys[i])
        }
    }
    return numberKeys;
};

SnapApp.JunctionDB.getJunctionBoolKeys = function () {
    var keys     = Object.keys(JNCT_COL_TYPES);
    var boolKeys = [];
    for (var i = 0; i < keys.length; i++) {
        var type = JNCT_COL_TYPES[keys[i]];
        if (type === "bool") {
            boolKeys.push(keys[i])
        }
    }
    return boolKeys;
};