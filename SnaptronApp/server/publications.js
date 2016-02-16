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
    var junctions = Junctions.find({}, {"_id": {"$in": queryJunctions}});
    console.log("Published " + junctions.count() + " junctions");

    return [queries, junctions]
});