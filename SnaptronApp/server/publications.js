/**
 * Created by Phani on 2/13/2016.
 */
Meteor.publish("junctions", function (queryStr) {
    var queryID = Meteor.call("processQuery", queryStr);
    var jncts = Queries.findOne({_id: queryID}).junctions;
    var resultCursor = Junctions.find({}, {"_id": {"$in": jncts}});
    console.log("Published " + resultCursor.count() + " junctions");
    return resultCursor;
});

Meteor.publish("queries", function (queryStr) {
    var queryID = Meteor.call("processQuery", queryStr);
    return Queries.find({_id: queryID});
});