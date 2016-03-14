/**
 * Created by Phani on 3/11/2016.
 *
 * Sample Normalized Difference
 *
 * Computes the normalized difference between 2 input groups.
 * The results are of the format
 * {    "sample" : "some sampleId",
 *      "A" : count of sample found in group A,
 *      "B" : count of sample found in group B,
 *      "D" : normalized ration (B-A)/(B+A)
 * }
 *
 * Expected parameters:
 *      k: The top k results to return
 *
 * Optional parameters:
 *      None
 *
 */

if (Meteor.isServer) {
    Meteor.methods({
        "sampleNormalizedDifference": function (queryId, inputGroups, params) {
            this.unblock();
            if (!validateInput(inputGroups, params)) {
                return null;
            }
            return sampleNormalizedDifference(queryId, inputGroups["A"], inputGroups["B"], params["k"]);
        }
    });
}

function sampleNormalizedDifference(queryId, groupIdA, groupIdB, k) {
    var A = getSampleCounts(queryId, groupIdA);
    var B = getSampleCounts(queryId, groupIdB);

    var allSamps   = _.union(_.keys(A), _.keys(B));
    var allResults = _.map(allSamps, function (sample) {
        var aVal = A[sample] || 0;
        var bVal = B[sample] || 0;
        return {
            "A": aVal,
            "B": bVal,
            "sample": sample,
            "D": (bVal - aVal) / (bVal + aVal)
        };
    });
    var sorted     = _.sortBy(allResults, "D");
    return _.last(sorted, k);
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

function validateInput(inputGroups, params) {
    if (!_.contains(_.keys(inputGroups), "A") || !_.contains(_.keys(inputGroups), "B")) {
        // Proper input groups not present
        return false;
    }
    var k;
    if (!_.contains(_.keys(params), "k")) {
        return false;
    } else {
        k = parseInt(params["k"]);
        if (!_.isFinite(k) || k <= 0) {
            // Invalid k value
            return false;
        }
    }
    return true;
}