/**
 * Created by Phani on 2/13/2016.
 */
Meteor.publish("queries", function (queryId) {
    if (SnapApp.Snaptron.updateQuery(queryId) == null) {
        // Failed
        return [];
    }

    console.log("Published query " + queryId);
    return SnapApp.QueryDB.findQuery(queryId)
});

Meteor.publish("regions", function (queryId) {
    var regions = SnapApp.RegionDB.findRegionsForQuery(queryId);
    console.log("Published " + regions.count() + " regions for query " + queryId);
    return regions;
});

Meteor.publish("junctions", function (queryId) {
    var junctions = SnapApp.JunctionDB.findJunctionsForQuery(queryId);
    console.log("Published " + junctions.count() + " junctions for query " + queryId);
    return junctions;
});