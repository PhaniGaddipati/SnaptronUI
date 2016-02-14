/**
 * Created by Phani on 2/9/2016.
 *
 * This file proves querying functions to get information from the snaptron server
 */

const URL = "http://stingray.cs.jhu.edu:8443/snaptron/?rquery=";

/**
 * The column that is the junction id in the raw TSV.
 * @type {number}
 */
const SNAPTRON_ID_COL = 1;

Meteor.methods({

    /**
     * Queries the snaptron server, or returns a cached result
     * @param queryStr The query string
     * @returns The id of the document in Queries or null if a reuslt wasn't obtains
     */
    processQuery: function (queryStr) {
        check(queryStr, String);
        this.unblock();
        var cachedResult = Queries.findOne({"query": queryStr});
        if (cachedResult) {
            console.log("Found valid cached reuslt for query \"" + queryStr + "\" --> " + cachedResult._id);
            return cachedResult._id;
        }
        try {
            var response = Meteor.http.call("GET", URL + queryStr);
            // Successful request, add it to the DB
            var _id = new Meteor.Collection.ObjectID()._str;
            var junctionIds = loadJunctionsToDB(response.content);

            Queries.insert({
                "_id": _id,
                "query": queryStr,
                "junctions": junctionIds,
                "numJunctions": junctionIds.length,
                "date": new Date()
            }, function (err, result) {
                if (err) {
                    console.error("Failed to cache result for query\"" + queryStr + "\" into DB.");
                    console.error(err);
                } else {
                    console.log("Cached result for query\"" + queryStr + "\" into DB --> " + _id);
                }
            });
            return _id;
        } catch (err) {
            console.error(err);
            return null;
        }
    }
});

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
    //var types = lines[1].split("\t");
    var types = ["str", "str", "str", "int", "int", "int", "str", "bool", "str", "str", "str", "str", "str", "str", "int", "int", "float", "float", "str"];
    var ids = [];

    for (var i = 1; i < lines.length; i++) {
        // Ignore empty lines
        if (lines[i] && 0 !== lines[i].length) {
            //Check if we already have this snaptron_id
            var elems = lines[i].split("\t");
            var id = castMember(elems[SNAPTRON_ID_COL], types[SNAPTRON_ID_COL]);
            if (Junctions.findOne({"_id": id}) == null) {
                // Build the document
                var document = {};
                document["_id"] = id;
                for (var col = 0; col < headers.length; col++) {
                    if (col != SNAPTRON_ID_COL) {
                        document[headers[col]] = castMember(elems[col], types[col]);
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