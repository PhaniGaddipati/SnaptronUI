/**
 * Created by Phani on 2/9/2016.
 *
 * This file proves querying functions to get information from the snaptron server
 */

const URL = "http://stingray.cs.jhu.edu:8443/snaptron";
const COLUMN_TYPES = ["str", "str", "str", "int", "int", "int", "str", "bool", "str", "str", "str", "str", "str", "str", "int", "int", "float", "float", "str"];

/**
 * The column that is the junction id in the raw TSV.
 * @type {number}
 */
const SNAPTRON_ID_COL = 1;
const MAX_JUNCTIONS_PER_CALL = 100;
const QUERY_REFRESH_TIME = 2 * 7 * 24 * 60 * 60 * 1000; // 2 weeks

Meteor.methods({

    /**
     * If a valid query is in QueriesDB and successfully sync, return the id (same as queryStr)
     * Otherwise try to load the query/junctions and return the id.
     * On failure returns null
     * @param queryId
     * @returns {*}
     */
    processQuery: function (queryId) {
        this.unblock();

        var query = Queries.findOne({"_id": queryId});
        if (query) {
            if ((new Date().getTime() - query[QUERY_LAST_LOADED_DATE].getTime()) > QUERY_REFRESH_TIME) {
                // We want to update the query
                console.log("Updating query (\"" + queryId + "\")");
                if (!loadQuery(queryId)) {
                    return null;
                }
            }
            if (loadMissingJunctions(queryId)) {
                return queryId;
            }
        }
        return null;
    },

    addQuery: function (queryDoc) {
        return addQueryToDB(queryDoc);
    }
});

/**
 * Adds the query to the database.
 * @param queryDocument
 */
function addQueryToDB(queryDocument) {
    var id = Queries.insert(queryDocument);
    console.log("Added query to database (\"" + id + "\")");
    return id;
}

function loadQuery(queryId) {
    var query = Queries.findOne({"_id": queryId});
    if (query == null) {
        console.error("Load query called with an ID not found (\"" + queryId + "\")!");
        return false;
    }
    var snaptronQuery = "?regions=" + query[QUERY_REGIONS].join(",") + "&contains=1&fields=snaptron_id";

    try {
        var responseTSV = Meteor.http.get(URL + snaptronQuery).content.trim();
        var lines = responseTSV.split("\n").slice(1); // first line is header
        var junctions = [];

        for (var line = 0; line < lines.length; line++) {
            junctions.push(lines[line].split("\t")[1]);
        }

        var newInfo = {};
        newInfo[QUERY_JUNCTIONS] = junctions;
        newInfo[QUERY_LAST_LOADED_DATE] = new Date();
        Queries.update({"_id": queryId}, {$set: newInfo});
        console.log("Loaded query (\"" + queryId + "\")");
        return true;
    } catch (err) {
        console.error("Error in loadQuery");
        console.error(err);
        return false;
    }
}

function loadMissingJunctions(queryId) {
    var query = Queries.findOne({"_id": queryId});
    if (query == null) {
        console.error("loadMissingjunctions called with an ID not found (\"" + queryId + "\")!");
        return;
    }
    var queryJunctionIDs = query[QUERY_JUNCTIONS];
    var toLoadJunctionIDs = [];
    for (var i = 0; i < queryJunctionIDs.length; i++) {
        if (!Junctions.findOne({"_id": queryJunctionIDs[i]})) {
            toLoadJunctionIDs.push(queryJunctionIDs[i]);
        }
    }
    if (toLoadJunctionIDs.length > 0) {
        console.log("Found " + toLoadJunctionIDs.length + " junctions to load (\"" + queryId + "\")");
    }
    try {
        for (var jnctIndex = 0; jnctIndex < toLoadJunctionIDs.length; jnctIndex += MAX_JUNCTIONS_PER_CALL) {
            var idBatch = toLoadJunctionIDs.slice(jnctIndex, jnctIndex + MAX_JUNCTIONS_PER_CALL);
            console.log("Loading junctions " + jnctIndex + "-" + (jnctIndex + idBatch.length - 1));
            var snaptronQuery = "?ids=snaptron:" + idBatch.join(",");
            var responseTSV = Meteor.http.get(URL + snaptronQuery).content.trim();
            loadJunctionsToDB(responseTSV);
        }
        return true;
    } catch (err) {
        console.error("Error in loadMissingJunctions");
        console.error(err);
        return false;
    }
}

/**
 * Adds the junctions in the TSV file to the
 * database, if they don't already exist.
 * Returns an array of the IDs of rows in the TSV.
 * @param rawTSV
 */
function loadJunctionsToDB(rawTSV) {
    check(rawTSV, String);
    var lines = rawTSV.split("\n");
    var headers = lines[0].split("\t");
    var ids = [];

    for (var i = 1; i < lines.length; i++) {
        // Ignore empty lines
        if (lines[i] && 0 !== lines[i].length) {
            //Check if we already have this snaptron_id
            var elems = lines[i].split("\t");
            var id = castMember(elems[SNAPTRON_ID_COL], COLUMN_TYPES[SNAPTRON_ID_COL]);
            if (Junctions.findOne({"_id": id}) == null) {
                // Build the document
                var document = {};
                document["_id"] = id;
                for (var col = 0; col < headers.length; col++) {
                    if (col != SNAPTRON_ID_COL) {
                        document[headers[col]] = castMember(elems[col], COLUMN_TYPES[col]);
                    }
                }
                Junctions.insert(document);
            }
            ids.push(id);
        }
    }

    return ids;
}

function castMember(toCast, type) {
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