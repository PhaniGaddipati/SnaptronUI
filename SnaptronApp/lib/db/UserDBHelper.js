/**
 * Created by Phani on 3/2/2016.
 */

SnapApp.UserDB = {};

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
    }
};