/**
 * Created by Phani on 2/13/2016.
 */

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
 * The junctions are not included in this publication
 */
Meteor.publish("queryRegionsNoJncts", function (queryId) {
    check(queryId, String);

    var regions = SnapApp.RegionDB.findRegionsForQueryNoJunctions(queryId);
    if (regions == null) {
        return [];
    }
    console.log("Published " + regions.count() + " regions for query " + queryId);
    return regions;
});

/**
 * Publishes the junctions relevant to the given query ID.
 * Sample lists are not published.
 */
Meteor.publish("queryJunctionsNoSamps", function (queryId) {
    check(queryId, String);

    var fieldProj                = {};
    fieldProj[JNCT_SAMPLES_KEY]  = 0;
    fieldProj[JNCT_COVERAGE_KEY] = 0;
    var junctions                = SnapApp.JunctionDB.findJunctionsForQuery(queryId, fieldProj);
    if (junctions == null) {
        return [];
    }
    console.log("Published " + junctions.count() + " junctions (no samps) for query " + queryId);
    return junctions;
});

/**
 * Publishes the junctions relevant to the given query ID.
 */
Meteor.publish("queryJunctions", function (queryId) {
    check(queryId, String);

    var junctions = SnapApp.JunctionDB.findJunctionsForQuery(queryId);
    if (junctions == null) {
        return [];
    }
    console.log("Published " + junctions.count() + " junctions for query " + queryId);
    return junctions;
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