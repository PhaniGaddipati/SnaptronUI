/**
 * Created by Phani on 2/13/2016.
 */

var SAMPLE_LIMIT = 50;

/**
 * Updates the query and publishes it. Publishes nothing
 * on updating error.
 */
Meteor.publish("queries", function (queryId) {
    check(queryId, String);

    if (SnapApp.Snaptron.updateQuery(queryId) == null) {
        // Failed
        return [];
    }

    console.log("Published query " + queryId);
    return SnapApp.QueryDB.findQuery(queryId)
});

/**
 * Publishes the regions relevant to the given query ID.
 */
Meteor.publish("regions", function (queryId) {
    check(queryId, String);

    var regions = SnapApp.RegionDB.findRegionsForQuery(queryId);
    if (regions == null) {
        return [];
    }
    console.log("Published " + regions.count() + " regions for query " + queryId);
    return regions;
});

/**
 * Publishes the junctions relevant to the given query ID.
 */
Meteor.publish("junctions", function (queryId) {
    check(queryId, String);

    var junctions = SnapApp.JunctionDB.findJunctionsForQuery(queryId);
    if (junctions == null) {
        return [];
    }
    console.log("Published " + junctions.count() + " junctions for query " + queryId);
    return junctions;
});

/**
 * Publishes samples that a part of the given junctions by ID.
 */
Meteor.publish("samplesForJunctions", function (junctionIds, searchQuery) {
    check(junctionIds, [String]);
    check(searchQuery, Match.OneOf(String, null, undefined));

    SnapApp.Snaptron.loadMissingJunctionSamples(junctionIds);
    var junctions = SnapApp.JunctionDB.getJunctions(junctionIds);
    var sampleIds = _.flatten(_.pluck(junctions, JNCT_SAMPLES_KEY));

    var query = {
        "_id": {
            "$in": sampleIds
        }
    };
    var proj  = {limit: SAMPLE_LIMIT};

    if (searchQuery && searchQuery.trim() !== "") {
        query["$text"] = {$search: searchQuery};
        proj["fields"] = {score: {$meta: "textScore"}};
        proj["sort"]   = {score: {$meta: "textScore"}};
    }

    var samples = Samples.find(query, proj);
    console.log("Published " + Math.min(samples.count(), SAMPLE_LIMIT) + " samples for " + junctionIds.length + " junctions");
    return samples;
});
/**
 * Publishes the elements relevant to a processor. The publishing is delegated
 * to the processor's publishFunction as defined in the index.
 */
Meteor.publish("processorElements", function (queryId, processorId) {
    check(queryId, String);
    check(processorId, String);

    var processor = SnapApp.QueryDB.getProcessorFromQuery(queryId, processorId);
    if (!processor) {
        return [];
    }
    var index = SnapApp.Processors.Index[processor[QRY_PROCESSOR_TYPE]];
    if (index[SnapApp.Processors.PUBLISH_FUNCTION] == null) {
        // Nothing to publish
        return [];
    }
    console.log("Delegating publishing of processorElements for " + processorId);
    return index[SnapApp.Processors.PUBLISH_FUNCTION](processor);
});

/**
 * Publishes additional user information.
 */
Meteor.publish("userData", function () {
    if (this.userId) {
        var fields                = {};
        fields[USER_QRYS]         = 1;
        fields[USER_STARRED_QRYS] = 1;
        return Users.find({_id: this.userId}, {fields: fields});
    } else {
        this.ready();
    }
});

/**
 * Publishes queries and regions for the purposes of the account page.
 * All queries relevant to the user are published, as well as all of the
 * regions that are a part of these queries.
 *
 * The following fields are NOT published to minimized data:
 *      QRY_FILTERS, QRY_GROUPS, QRY_PROCESSORS,
 *      REGION_JUNCTIONS
 */
Meteor.publish("userQueriesAndRegions", function () {
    if (this.userId) {
        var queries     = _.union(SnapApp.UserDB.getUserQueryIds(this.userId),
            SnapApp.UserDB.getUserStarredQueryIds(this.userId));
        var qrySelector = {
            "_id": {"$in": queries}
        };
        var qryFields   = {};

        qryFields[QRY_FILTERS]    = 0;
        qryFields[QRY_GROUPS]     = 0;
        qryFields[QRY_PROCESSORS] = 0;
        var queryCursor           = Queries.find(qrySelector, {fields: qryFields});

        var regions                    = _.flatten(_.pluck(queryCursor.fetch(), QRY_REGIONS));
        var regionSelector             = {
            "_id": {"$in": regions}
        };
        var regionFields               = {};
        regionFields[REGION_JUNCTIONS] = 0;

        return [queryCursor, Regions.find(regionSelector, {fields: regionFields})]
    } else {
        this.ready();
    }
});