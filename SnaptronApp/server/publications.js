/**
 * Created by Phani on 2/13/2016.
 */
Meteor.publish("queries", function (queryId) {
    var queryID = Meteor.call("processQuery", queryId);
    if (!queryID) {
        // Failed
        return [];
    }

    var query = Queries.findOne({_id: queryID});
    var queryRegionJunctions = query[QUERY_JUNCTIONS];
    //TODO Filter
    var filteredJunctions = Junctions.find({"_id": {"$in": queryRegionJunctions}});
    console.log("Found and published " + filteredJunctions.count() + " junctions for id " + queryID);

    return [Queries.find({_id: queryID}), filteredJunctions]
});