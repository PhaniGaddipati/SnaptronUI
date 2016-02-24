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
const CACHE_REFRESH_TIME = 2 * 7 * 24 * 60 * 60 * 1000; // 2 weeks

Meteor.methods({

    /**
     * If a valid cached query is in QueriesDB, return the id (same as queryStr)
     * Otherwise try to load the query/junctions and return the id.
     * On failure returns null
     * @param query
     * @returns {*}
     */
    processQuery: function (query) {
        check(query, String);
        this.unblock();

        // queryStr is the _id to the Queries db
        var cachedResult = Queries.findOne({"_id": query});
        if (cachedResult) {
            console.log("Found cached query (\"" + query + "\")");
            // Already have a cached response. Make sure it hasn't been too long to redo it
            if ((new Date().getTime() - cachedResult.lastLoadedDate.getTime()) > CACHE_REFRESH_TIME) {
                console.log("Discarded cached query (\"" + query + "\")");
                // Expired, remove it
                Queries.remove({"_id": cachedResult._id});
            } else {
                // Cool, just make sure all the junctions are loaded
                loadMissingJunctions(query);
                return cachedResult._id;
            }
        }

        addQueryToDB(query);
        if (loadQuery(query) && loadMissingJunctions(query)) {
            return query;
        }
        return null;
    }
});

/**
 * Adds the query to the database.
 * @param query
 */
function addQueryToDB(query) {
    check(query, String);
    var queryDocument = Queries.findOne({"_id": query});
    if (queryDocument) {
        console.warn("Found an existing document within addQueryToDB! Replacing it.");
    } else {
        queryDocument = {
            "_id": query,
            "lastLoadedDate": new Date(0),
            "metadata": {},
            "regions": [],
            "rfilters": [],
            "sfilters": [],
            "junctions": []
        };
    }
    // Parse out query elements from the given query and update queryDocument
    // Insert updated doc into DB
    var queryTokens = getTokensAsJSONFromQueryString(query);
    for (var key in queryTokens) {
        queryDocument[key] = queryTokens[key];
    }
    Queries.upsert({"_id": query}, queryDocument);
    console.log("Added query to database (\"" + query + "\")");
    return queryDocument._id;
}

function loadQuery(query) {
    check(query, String);
    var queryDocument = Queries.findOne({"_id": query});
    if (queryDocument == null) {
        console.error("Load query called with an ID not found (\"" + query + "\")!");
        return;
    }
    var snaptronQuery = "?regions=" + queryDocument.regions.join(",");
    if (queryDocument.sfilters.length > 0)
        snaptronQuery += "&sfilter=" + queryDocument.sfilters.join("&sfilter=");
    if (queryDocument.rfilters.length > 0)
        snaptronQuery += "&rfilter=" + queryDocument.rfilters.join("&rfilter=");
    snaptronQuery += "&fields=snaptron_id";

    try {
        console.log("Request: " + snaptronQuery);
        var responseTSV = Meteor.http.get(URL + snaptronQuery).content.trim();
        var lines = responseTSV.split("\n").slice(1); // first line is header
        var junctions = [];

        for (var line = 0; line < lines.length; line++) {
            junctions.push(lines[line].split("\t")[1]);
        }

        Queries.update({"_id": query}, {
            $set: {
                "junctions": junctions,
                "lastLoadedDate": new Date()
            }
        });
        console.log("Loaded query (\"" + query + "\")");
        return true;
    } catch (err) {
        console.error("Error in loadQuery");
        console.error(err);
        return false;
    }
}

function loadMissingJunctions(query) {
    check(query, String);
    var queryDocument = Queries.findOne({"_id": query});
    if (queryDocument == null) {
        console.error("loadMissingjunctions called with an ID not found (\"" + query + "\")!");
        return;
    }
    var queryJunctionIDs = queryDocument.junctions;
    var toLoadJunctionIDs = [];
    for (var i = 0; i < queryJunctionIDs.length; i++) {
        if (!Junctions.findOne({"_id": queryJunctionIDs[i]})) {
            toLoadJunctionIDs.push(queryJunctionIDs[i]);
        }
    }
    if (toLoadJunctionIDs.length > 0) {
        console.log("Found " + toLoadJunctionIDs.length + " junctions to load (\"" + query + "\")");
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