/**
 * Created by Phani on 3/13/2016.
 */

Template.accountPage.helpers({
    "isSignedIn": function () {
        return Meteor.userId() != null;
    },
    "userEmail": function () {
        if (Meteor.userId()) {
            return Meteor.user()[USER_EMAILS][0][USER_EMAIL_ADDRESS];
        }
        return "";
    },
    "numQueries": function () {
        if (Meteor.userId()) {
            return Queries.find().count();
        }
        return "";
    },
    "queries": function () {
        return _.sortBy(SnapApp.QueryDB.getQueries(
            SnapApp.UserDB.getUserQueryIds(Meteor.userId()))
            , QRY_CREATED_DATE);
    },
    "regions": function (query) {
        return _.pluck(SnapApp.RegionDB.findRegionsForQuery(query._id).fetch(), "_id").join(", ");
    },
    queryDate: function (query) {
        var date = query[QRY_CREATED_DATE];
        return moment(date).format("MMMM Do, YYYY");
    },
    queryName: function (query) {
        if (query[QRY_NAME] == null) {
            return "<i>Unnamed</i>";
        }
        return query[QRY_NAME];
    }
});

Template.accountPage.events({
    "click .removeQryBtn": function () {
        onRemoveQuery(this);
    }
});

function onRemoveQuery(query) {
    Meteor.call("removeQueryFromUser", query["_id"]);
}