/**
 * Created by Phani on 3/2/2016.
 */

SnapApp.UserDB = {};

Meteor.methods({
    "removeQueryFromUser": function (queryId) {
        if (SnapApp.QueryDB.isQueryCurrentUsers(queryId)) {
            SnapApp.UserDB.removeQueryFromUser(Meteor.userId(), queryId);
        }
    }
});

if (Meteor.isServer) {
    Accounts.onCreateUser(function (options, user) {
        user[USER_QRYS] = [];
        return user;
    });
}

SnapApp.UserDB.getUser = function (userId) {
    return Users.findOne(userId);
};

SnapApp.UserDB.addQueryToUser = function (userId, queryId) {
    if (userId != null) {
        var pushDoc        = {};
        pushDoc[USER_QRYS] = queryId;
        Users.update(userId, {"$push": pushDoc});
        console.log("Added query " + queryId + " to user " + userId);
    }
};

SnapApp.UserDB.removeQueryFromUser = function (userId, queryId) {
    if (userId != null) {
        var pullDoc        = {};
        pullDoc[USER_QRYS] = queryId;
        Users.update(userId, {"$pull": pullDoc});
        console.log("Removed query " + queryId + " from user " + userId);
    }
};

SnapApp.UserDB.getUserQueryIds = function (userId) {
    if (userId != null) {
        return SnapApp.UserDB.getUser(userId)[USER_QRYS];
    }
    return [];
};