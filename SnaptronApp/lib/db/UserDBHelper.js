/**
 * Created by Phani on 3/2/2016.
 */

if (Meteor.isServer) {
    Accounts.onCreateUser(function (options, user) {
        user[USER_QRYS] = [];
        return user;
    });
}

getUser = function (userId) {
    return Users.findOne(userId);
};

addQueryToUser = function (userId, queryId) {
    if (userId != null) {
        var pushDoc = {};
        pushDoc[USER_QRYS] = queryId;
        Users.update(userId, {"$push": pushDoc});
    }
};