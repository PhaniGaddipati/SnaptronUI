/**
 * Created by Phani on 2/13/2016.
 */
Meteor.publish("queries", function (queryStr) {
    var queryID = Meteor.call("processQuery", queryStr);
    var queries = Queries.find({_id: queryID});
    var firstQuery = Queries.findOne({_id: queryID});
    var queryJunctions = [];
    if (firstQuery != null) {
        queryJunctions = firstQuery.junctions;
    }
    var junctions = Junctions.find({"_id": {"$in": queryJunctions}});
    if (queryJunctions.length != junctions.count()) {
        console.warn("Inconsistency found! Cached query id \"" + queryID
            + "\" claims " + queryJunctions.length
            + " junctions but only " + junctions.count() + " found.");
    }
    console.log("Found and published " + junctions.count() + " junctions for id " + queryID);

    return [queries, junctions]
});