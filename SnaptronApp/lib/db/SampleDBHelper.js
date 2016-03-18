/**
 * Created by Phani on 3/18/2016.
 */

SnapApp.SampleDB = {};

Meteor.methods({
    getSamplesForJunctions: function (junctionIds, loadIfMissing) {
        if (loadIfMissing === undefined) {
            loadIfMissing = false;
        }
        if (loadIfMissing) {
            SnapApp.Snaptron.loadMissingJunctionSamples(junctionIds);
        }
        return SnapApp.SampleDB.getSamplesForJunctions(junctionIds);
    }
});

SnapApp.SampleDB.getSamples = function (sampleIds) {
    return Samples.find({
        "_id": {
            "$in": sampleIds
        }
    }).fetch();
};

SnapApp.SampleDB.getSamplesForJunctions = function (junctionIds) {
    var junctions = SnapApp.JunctionDB.getJunctions(junctionIds);
    return SnapApp.SampleDB.getSamples(_.flatten(_.pluck(junctions, JNCT_SAMPLES_KEY)));
};

SnapApp.SampleDB.getSample = function (sampleId) {
    check(sampleId, String);
    return Samples.findOne({"_id": sampleId});
};

SnapApp.SampleDB.hasSample = function (sampleId) {
    return Samples.find({"_id": sampleId}, {"limit": 1}).count() > 0;
};

/**
 * Adds the samples to the
 * database, if they don't already exist.
 * @param samples
 * @returns {Array} the ids of the inserted samples
 */
SnapApp.SampleDB.addSamples = function (samples) {
    var ids = [];
    for (var i = 0; i < samples.length; i++) {
        Samples.upsert({"_id": samples[i]["_id"]}, samples[i]);
        ids.push(samples[i]["_id"]);
    }
    return ids;
};