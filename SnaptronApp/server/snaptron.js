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
                "content": LZString.compress(response.content),
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