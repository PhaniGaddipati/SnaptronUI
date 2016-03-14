/**
 * Created by Phani on 3/11/2016.
 *
 * Sample Normalized Difference
 *
 * Computes the normalized difference between 2 input groups.
 * The results have two fields. The TOP_K result contains the top
 * results in the following format:
 * {    "sample" : "some sampleId",
 *      "A" : count of sample found in group A,
 *      "B" : count of sample found in group B,
 *      "D" : normalized ration (B-A)/(B+A)
 * }
 *
 * The HIST result contains frequency data from the unabridged result set.
 * The format of the histogram is an array of:
 * {    "start" : the bin starting D,
 *      "end"   : the bin ending D,
 *      "count" : the frequency of this bin
 * }
 *
 * The top K results are returned, as well as frequency information
 * from the complete data set.
 *
 * Expected parameters:
 *      k: The top k results to return
 *
 * Optional parameters:
 *      None
 *
 */

const NUM_HIST_BINS    = 10;
SnapApp.Processors.SND = {};

SnapApp.Processors.SND.RESULTS_TOP_K     = "topk";
SnapApp.Processors.SND.RESULTS_HIST      = "hist";
SnapApp.Processors.SND.RESULT_HIST_START = "start";
SnapApp.Processors.SND.RESULT_HIST_END   = "end";
SnapApp.Processors.SND.RESULT_HIST_COUNT = "count";

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
    var results    = {};

    results[SnapApp.Processors.SND.RESULTS_TOP_K] = _.last(sorted, k);
    results[SnapApp.Processors.SND.RESULTS_HIST]  = getHistogram(sorted);

    return results;
}

function getHistogram(results) {
    var dat      = _.pluck(results, "D");
    var min      = Math.floor(_.min(dat));
    var max      = Math.ceil(_.max(dat));
    var binDelta = (max - min) / NUM_HIST_BINS;

    if (binDelta == 0) {
        return {
            min: dat.length
        };
    }

    var counts = _.countBy(dat, function (d) {
        return (d - min) / binDelta;
    });
    var hist   = [];
    for (var i = 0; i < NUM_HIST_BINS; i++) {
        var obj                                       = {};
        obj[SnapApp.Processors.SND.RESULT_HIST_START] = min + i * binDelta;
        obj[SnapApp.Processors.SND.RESULT_HIST_END]   = min + (i + 1) * binDelta;
        obj[SnapApp.Processors.SND.RESULT_HIST_COUNT] = counts[i.toString()] || 0;
        hist.push(obj);
    }
    return hist;
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
