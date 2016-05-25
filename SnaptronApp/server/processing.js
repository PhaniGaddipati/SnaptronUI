/**
 * Created by Phani on 5/25/2016.
 */

// Use meteor method so it's done on the server
Meteor.methods({
    "startProcessor": function (type, queryId, inputGroups, params) {
        var result = Meteor.call(SnapApp.Processors.Index[type][SnapApp.Processors.FUNCTION],
            queryId, inputGroups, params);
        if (result) {
            Meteor.call("addProcessorToQuery", queryId, type, inputGroups, params, result);
        }
    }
});
