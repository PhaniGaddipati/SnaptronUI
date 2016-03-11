/**
 * Created by Phani on 3/11/2016.
 */

SnapApp.Processors.sampleNormalizedDifference = function (queryId, groupIdA, groupIdB) {
    var A = getSampleCounts(queryId, groupIdA);
    var B = getSampleCounts(queryId, groupIdB);

    console.log(A);
    console.log(B);

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
};

function getSampleCounts(queryId, groupId) {
    var group = SnapApp.QueryDB.getGroupFromQuery(queryId, groupId);
    var jncts = SnapApp.JunctionDB.getJunctions(group[QRY_GROUP_JNCTS]);
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