/**
 * Created by Phani on 3/11/2016.
 *
 * Junction Inclusion Ratio
 *
 * Computes the inclusion ratio between 2 input groups.
 * The results have two fields. The TOP_K result contains the top
 * results in the following format:
 * {    "sample" : "some sampleId",
 *      "A" : count of sample found in group A,
 *      "B" : count of sample found in group B,
 *      "D" : junction inclusion ratio (B-A)/(B+A+1)
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

const NUM_HIST_BINS    = 15;

Meteor.methods({
    "junctionInclusionRatio": function (queryId, inputGroups, params) {
        if (!validateInput(inputGroups, params)) {
            return null;
        }
        return junctionInclusionRatio(queryId, inputGroups["A"], inputGroups["B"], params["k"]);
    }
});

function junctionInclusionRatio(queryId, groupIdA, groupIdB, k) {
    var A = getSampleCoverages(queryId, groupIdA);
    var B = getSampleCoverages(queryId, groupIdB);

    var allSamps   = _.union(_.keys(A), _.keys(B));
    var allResults = _.map(allSamps, function (sample) {
        var aVal = A[sample] || 0;
        var bVal = B[sample] || 0;
        return {
            "A": aVal,
            "B": bVal,
            "sample": sample,
            "D": (bVal - aVal) / (bVal + aVal + 1)
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
    var binDelta = 2 / (NUM_HIST_BINS);

    var counts = _.countBy(dat, function (d) {
        return parseInt(Math.min(NUM_HIST_BINS - 1, Math.floor((d + 1) / binDelta))).toString();
    });
    var hist   = [];
    for (var i = 0; i < NUM_HIST_BINS; i++) {
        var obj                                       = {};
        obj[SnapApp.Processors.SND.RESULT_HIST_START] = -1 + i * binDelta;
        obj[SnapApp.Processors.SND.RESULT_HIST_END]   = -1 + (i + 1) * binDelta;
        obj[SnapApp.Processors.SND.RESULT_HIST_COUNT] = counts[i.toString()] || 0;
        hist.push(obj);
    }
    return hist;
}

function getSampleCoverages(queryId, groupId) {
    var group  = SnapApp.QueryDB.getGroupFromQuery(queryId, groupId);
    var jncts  = SnapApp.JunctionDB.getJunctions(group[QRY_GROUP_JNCTS]);
    var result = {};

    _.each(jncts, function (jnct) {
        var samples   = jnct[JNCT_SAMPLES_KEY];
        var coverages = jnct[JNCT_COVERAGE_KEY];
        for (var i = 0; i < samples.length; i++) {
            result[samples[i]] = (result[samples[i]] || 0) + coverages[i];
        }
    });

    return result;
}

/**
 * Ensures that the given groups are unique and a k is given.
 * @param inputGroups
 * @param params
 * @returns {boolean}
 */
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
