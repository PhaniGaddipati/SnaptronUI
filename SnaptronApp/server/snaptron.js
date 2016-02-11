/**
 * Created by Phani on 2/9/2016.
 *
 * This file proves querying functions to get information from the snaptron server
 */

const URL = "http://stingray.cs.jhu.edu:8443/snaptron/?rquery=";

/**
 * Max time in ms thata cached query is valid
 * @type {number}
 */
const CACHE_VALID_DURATION = 86400000;

Meteor.methods({

    /**
     * Loads the results for the given query into
     * the 'currData' collection
     *
     * TODO: Make it an async method with callback
     *
     * @param queryStr
     */
    loadQueryResults: function (queryStr) {
        var cachedID = Meteor.call("getIdForQuery", queryStr);
        if (cachedID != null) {
            //Clear old data
            Meteor.currData.remove({});

            //Build new data
            var cachedResponse = Meteor.queriesDB.findOne({"_id": cachedID});
            var rawTSV = LZString.decompressFromUint8Array(cachedResponse.content);
            var lines = rawTSV.split("\n");
            var headers = lines[0].split("\t");
            var numJncts = 0;
            for (var i = 1; i < lines.length; i++) {
                // Ignore empty lines
                if (lines[i] && 0 !== lines[i].length) {
                    var elems = lines[i].split("\t");
                    var document = {};
                    // Match header column to the data
                    for (var col = 0; col < headers.length; col++) {
                        document[headers[col]] = elems[col];
                    }
                    Meteor.currData.insert(document);
                    numJncts++;
                }
            }

            // Attach metadata
            var metaData = {
                "tag": "metadata",
                "query": cachedResponse.query,
                "date": cachedResponse.date,
                "num": numJncts
            };
            Meteor.currData.insert(metaData);
        }
    },

    /**
     * Queries the snaptron server, or returns a cached result
     * @param queryStr The query string
     * @returns The id of the document in queriesDB or null if a reuslt wasn't obtains
     */
    getIdForQuery: function (queryStr) {
        check(queryStr, String);
        this.unblock();
        var cachedResult = Meteor.queriesDB.findOne({"query": queryStr});
        if (cachedResult) {
            if ((new Date() - cachedResult.date) > CACHE_VALID_DURATION) {
                // Invalid entry, discard it
                Meteor.queriesDB.remove({"_id": cachedResult._id});
                console.log("Discarded cached result for query \"" + queryStr + "\" from DB.");
            } else {
                console.log("Found valid cached reuslt for query \"" + queryStr + "\" --> " + cachedResult._id);
                return cachedResult._id;
            }
        }
        try {
            var response = Meteor.http.call("GET", URL + queryStr);
            // Successful request, add it to the DB
            var _id = new Meteor.Collection.ObjectID()._str;
            Meteor.queriesDB.insert({
                "_id": _id,
                "query": queryStr,
                "content": LZString.compressToUint8Array(response.content),
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