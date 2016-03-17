/**
 * Created by Phani on 3/2/2016.
 */

SnapApp.UserDB = {};

Meteor.methods({
    /**
     * Add the query to the users owned queries list if they are
     * the owner.
     * @param queryId
     */
    "addQueryToUser": function (queryId) {
        if (SnapApp.QueryDB.isQueryCurrentUsers(queryId)) {
            SnapApp.UserDB.addQueryToUser(Meteor.userId(), queryId);
        }
    },
    /**
     * If the current user owns the query, remove it.
     * @param queryId
     */
    "removeQueryFromUser": function (queryId) {
        if (SnapApp.QueryDB.isQueryCurrentUsers(queryId)) {
            SnapApp.UserDB.removeQueryFromUser(Meteor.userId(), queryId);
        }
    },
    /**
     * Adds a query as "starred" to the current user.
     * @param queryId
     */
    "addStarredQueryToUser": function (queryId) {
        SnapApp.UserDB.addStarredQueryToUser(Meteor.userId(), queryId);
    },
    /**
     * Removes a starred from the current user.
     * @param queryId
     */
    "removeStarredQueryFromUser": function (queryId) {
        SnapApp.UserDB.removeStarredQueryFromUser(Meteor.userId(), queryId);
    }
});

if (Meteor.isServer) {
    Accounts.onCreateUser(function (options, user) {
        user[USER_QRYS]         = [];
        user[USER_STARRED_QRYS] = [];
        return user;
    });
}

/**
 * Gets a user by user id.
 * @param userId
 * @returns {any}
 */
SnapApp.UserDB.getUser = function (userId) {
    return Users.findOne(userId);
};

/**
 * Adds the query to the user.
 * @param userId
 * @param queryId
 */
SnapApp.UserDB.addQueryToUser = function (userId, queryId) {
    if (userId != null) {
        var pushDoc        = {};
        pushDoc[USER_QRYS] = queryId;
        Users.update(userId, {"$push": pushDoc});
        console.log("Added query " + queryId + " to user " + userId);
    }
};

/**
 * Removes the query from the user.
 * @param userId
 * @param queryId
 */
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

SnapApp.UserDB.getUserStarredQueryIds = function (userId) {
    if (userId != null) {
        var result = SnapApp.UserDB.getUser(userId)[USER_STARRED_QRYS];
        if (result == undefined) {
            return [];
        }
        return result;
    }
    return [];
};

SnapApp.UserDB.addStarredQueryToUser = function (userId, queryId) {
    if (userId != null) {
        var pushDoc                = {};
        pushDoc[USER_STARRED_QRYS] = queryId;
        Users.update(userId, {"$addToSet": pushDoc});
        console.log("Added starred query " + queryId + " to user " + userId);
    }
};

SnapApp.UserDB.removeStarredQueryFromUser = function (userId, queryId) {
    if (userId != null) {
        var pullDoc                = {};
        pullDoc[USER_STARRED_QRYS] = queryId;
        Users.update(userId, {"$pull": pullDoc});
        console.log("Removed starred query " + queryId + " from user " + userId);
    }
};