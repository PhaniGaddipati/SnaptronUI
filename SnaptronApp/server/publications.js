/**
 * Created by Phani on 2/13/2016.
 */
Meteor.publish("queries", function (queryId) {
    if (SnapApp.Snaptron.updateQuery(queryId) == null) {
        // Failed
        return [];
    }

    var junctions = SnapApp.JunctionDB.findJunctionsForQuery(queryId);
    var regions = SnapApp.RegionDB.findRegionsForQuery(queryId);
    console.log("Published " + junctions.count()
        + " junctions from " + regions.count() + " regions for id " + queryId);

    return [SnapApp.QueryDB.findQuery(queryId), junctions, regions]
});

