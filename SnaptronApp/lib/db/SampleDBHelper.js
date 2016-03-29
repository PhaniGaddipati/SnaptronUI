/**
 * Created by Phani on 3/18/2016.
 */

SnapApp.SampleDB = {};

Meteor.methods({
    /**
     * Returns samples relevant to the given junctions.
     * Not found samples are loaded if specified.
     * @param junctionIds
     * @param loadIfMissing
     * @returns {*|any}
     */
    getSamplesForJunctions: function (junctionIds, loadIfMissing) {
        check(junctionIds, [String]);
        if (loadIfMissing === undefined) {
            loadIfMissing = false;
        }
        if (loadIfMissing) {
            SnapApp.Snaptron.loadMissingJunctionSamples(junctionIds);
        }
        return SnapApp.SampleDB.getSamplesForJunctions(junctionIds);
    },

    /**
     * Gets the sample by ID, loading if requested and missing.
     * @param sampleId
     * @param loadIfMissing
     */
    getSample: function (sampleId, loadIfMissing) {
        check(sampleId, String);

        if (loadIfMissing === undefined) {
            loadIfMissing = false;
        }
        if (loadIfMissing && Meteor.isServer) {
            SnapApp.Snaptron.loadMissingSamples([sampleId]);
        }
        return SnapApp.SampleDB.getSample(sampleId);
    }
});

if (Meteor.isServer) {
    Meteor.methods({
        /**
         * Loads missing samples and searches them using the text index.
         * @param junctionIds
         * @param keysToInclude
         * @param searchQuery
         * @param limit
         * @returns {any|*}
         */
        searchSamplesForJunctions: function (junctionIds, keysToInclude, searchQuery, limit) {
            check(junctionIds, [String]);
            check(keysToInclude, [String]);
            check(limit, Number);
            check(searchQuery, Match.OneOf(String, null, undefined));


            SnapApp.Snaptron.loadMissingJunctionSamples(junctionIds);
            return SnapApp.SampleDB.searchSamplesForJunctions(junctionIds, keysToInclude, searchQuery, limit);
        }
    })
}

/**
 * Finds samples given by an array of IDs.
 * @param sampleIds
 * @returns {Cursor}
 */
SnapApp.SampleDB.findSamples = function (sampleIds) {
    return Samples.find({
        "_id": {
            "$in": sampleIds
        }
    });
};

/**
 * Gets samples given by an array of IDs.
 * @param sampleIds
 * @returns {*|any}
 */
SnapApp.SampleDB.getSamples = function (sampleIds) {
    return SnapApp.SampleDB.findSamples(sampleIds).fetch();
};

/**
 * Finds all samples a part of junctions given by ID.
 * @param junctionIds
 */
SnapApp.SampleDB.findSamplesForJunctions = function (junctionIds) {
    var junctions = SnapApp.JunctionDB.getJunctions(junctionIds);
    return SnapApp.SampleDB.findSamples(_.flatten(_.pluck(junctions, JNCT_SAMPLES_KEY)));
};

/**
 * Get all samples that are a part of the junctions given by ID.
 * @param junctionIds
 * @returns {*|any}
 */
SnapApp.SampleDB.getSamplesForJunctions = function (junctionIds) {
    return SnapApp.SampleDB.findSamplesForJunctions(junctionIds).fetch();
};


/**
 * Searches the sample set for the given junctions using the text index (if a query if given)
 * and returns the samples found.
 * @param junctionIds
 * @param keysToInclude
 * @param searchQuery
 * @param limit
 * @returns {any}
 */
SnapApp.SampleDB.searchSamplesForJunctions = function (junctionIds, keysToInclude, searchQuery, limit) {
    check(junctionIds, [String]);
    check(keysToInclude, [String]);
    check(limit, Match.OneOf(null, undefined, Number));
    check(searchQuery, Match.OneOf(String, null, undefined));

    var junctions = SnapApp.JunctionDB.getJunctions(junctionIds);
    var sampleIds = _.flatten(_.pluck(junctions, JNCT_SAMPLES_KEY));

    var query = {
        "_id": {
            "$in": sampleIds
        }
    };

    var proj = {};
    if (limit) {
        proj.limit = limit;
    }
    if (keysToInclude) {
        var fields = {};
        _.each(keysToInclude, function (key) {
            fields[key] = 1;
        });
        proj.fields = fields;
    }

    if (searchQuery && searchQuery.trim() !== "") {
        query["$text"] = {$search: searchQuery};
        proj["fields"] = {score: {$meta: "textScore"}};
        proj["sort"]   = {score: {$meta: "textScore"}};
    }

    return Samples.find(query, proj).fetch();
};

/**
 * Get a particular sample by ID.
 * @param sampleId
 * @returns {any}
 */
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