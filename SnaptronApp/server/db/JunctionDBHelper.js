/**
 * Created by Phani on 2/26/2016.
 */

JUNCTION_ID_FIELD = "snaptron_id";
JUNCTION_COLUMN_TYPES = {
    "DataSource:Type": "str",
    "snaptron_id": "str",
    "chromosome": "str",
    "start": "int",
    "end": "int",
    "length": "int",
    "strand": "str",
    "annotated?": "bool",
    "left_motif": "str",
    "right_motif": "str",
    "left_annotated?": "str",
    "right_annotated?": "str",
    "samples": "str",
    "read_coverage_by_sample": "str",
    "samples_count": "int",
    "coverage_sum": "float",
    "coverage_avg": "float",
    "coverage_median": "float",
    "source_dataset_id": "str"
};

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
 * Adds the junctions in the TSV file to the
 * database, if they don't already exist.
 * Returns an array of the IDs of rows in the TSV.
 * @param rawTSV
 */
addJunctionsFromTSV = function (rawTSV) {
    check(rawTSV, String);
    // Get rid of commented lines
    rawTSV.replace(/[#].+/g, "");

    var lines = rawTSV.split("\n");
    var headers = lines[0].split("\t");
    var ids = [];

    for (var i = 1; i < lines.length; i++) {
        if (lines[i] && 0 != lines[i].length) {
            var elems = lines[i].split("\t");
            var junctionDoc = {};

            for (var col = 0; col < elems.length; col++) {
                if (headers[col] == JUNCTION_ID_FIELD) {
                    junctionDoc["_id"] = elems[col];
                } else {
                    junctionDoc[headers[col]] = castMember(elems[col], JUNCTION_COLUMN_TYPES[headers[col]])
                }
            }

            Junctions.upsert({"_id": junctionDoc["_id"]}, junctionDoc);
            ids.push(junctionDoc["_id"]);
        }
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
    var queryRegions = getRegions(query[QUERY_REGIONS]);
    var queryJunctions = new Set();

    for (var i = 0; i < queryRegions.length; i++) {
        var junctionIds = queryRegions[i][REGION_JUNCTIONS];
        for (var j = 0; j < junctionIds.length; j++) {
            queryJunctions.add(junctionIds[j]);
        }
    }

    var filters = query[QUERY_FILTERS];
    var selector = {
        "_id": {
            "$in": Array.from(queryJunctions)
        }
    };

    // Add query filters to the selector
    for (i = 0; i < filters.length; i++) {
        var filterDoc = filters[i];
        var field = filterDoc[QUERY_FILTER_FIELD];
        var op = filterDoc[QUERY_FILTER_OP];
        var val = filterDoc[QUERY_FILTER_VAL];

        var restriction = {};
        restriction[op] = val;
        selector[field] = restriction;

        //TODO Will there ever be multiple filters for the same field?
    }

    return Junctions.find(selector);
};

function castMember(toCast, type) {
    check(type, String);
    switch (type) {
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