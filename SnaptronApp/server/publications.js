/**
 * Created by Phani on 2/13/2016.
 */

/**
 * Updates the query and publishes it. Publishes nothing
 * on updating error.
 */
Meteor.publish("queries", function (queryId) {
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
    var regions = SnapApp.RegionDB.findRegionsForQuery(queryId);
    console.log("Published " + regions.count() + " regions for query " + queryId);
    return regions;
});

/**
 * Publishes the junctions relevant to the given query ID.
 */
Meteor.publish("junctions", function (queryId) {
    var junctions = SnapApp.JunctionDB.findJunctionsForQuery(queryId);
    console.log("Published " + junctions.count() + " junctions for query " + queryId);
    return junctions;
});

/**
 * Publishes additional user information.
 */
Meteor.publish("userData", function () {
    if (this.userId) {
        var fields        = {};
        fields[USER_QRYS] = 1;
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
        var queries     = SnapApp.UserDB.getUserQueryIds(this.userId);
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