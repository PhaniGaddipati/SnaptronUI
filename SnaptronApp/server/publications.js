/**
 * Created by Phani on 2/13/2016.
 */
Meteor.publish("queries", function (queryId) {
    if (updateQuery(queryId) == null) {
        // Failed
        return [];
    }

    var junctions = findJunctionsForQuery(queryId);
    var regions = findRegionsForQuery(queryId);
    console.log("Published " + junctions.count()
        + " junctions from " + regions.count() + " regions for id " + queryId);

    return [findQuery(queryId), junctions, regions]
});

