/**
 * Created by Phani on 3/11/2016.
 */

if (Meteor.isServer) {
    Meteor.methods({
        "sampleNormalizedDifference": function (queryId, inputGroups) {
            this.unblock();
            if (!_.contains(_.keys(inputGroups), "A") || !_.contains(_.keys(inputGroups), "B")) {
                // Proper input groups not present
                return null;
            }

            var groupIdA = inputGroups["A"];
            var groupIdB = inputGroups["B"];
            var results  = sampleNormalizedDifference(queryId, groupIdA, groupIdB);

            if (results == null) {
                return null;
            }
            return Meteor.call("addProcessorToQuery", queryId, "Sample Normalized Difference", inputGroups, results);
        }
    });
}

function sampleNormalizedDifference(queryId, groupIdA, groupIdB) {
    var A = getSampleCounts(queryId, groupIdA);
    var B = getSampleCounts(queryId, groupIdB);

    var allSamps = _.union(_.keys(A), _.keys(B));
    return _.map(allSamps, function (sample) {
        var aVal = A[sample] || 0;
        var bVal = B[sample] || 0;
        return {
            "A": aVal,
            "B": bVal,
            "sample": sample,
            "D": (bVal - aVal) / (bVal + aVal)
        };
    });
}

function getSampleCounts(queryId, groupId) {
    var group   = SnapApp.QueryDB.getGroupFromQuery(queryId, groupId);
    var jncts   = SnapApp.JunctionDB.getJunctions(group[QRY_GROUP_JNCTS]);
    var samples = _.flatten(_.map(jncts, getJnctSamples));
    return _.countBy(samples, _.identity)
}

function getJnctSamples(jnct) {
    if (!_.contains(_.keys(jnct), JNCT_SAMPLES_KEY)) {
        console.warn("Warning: Passed a junction without a samples keys: " + jnct);
        return [];
    }
    return jnct[JNCT_SAMPLES_KEY].split(",");
}