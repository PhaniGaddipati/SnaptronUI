/**
 * Created by Phani on 3/13/2016.
 */

var changePwdErrorMsg = new ReactiveVar("");

Template.accountPage.onRendered(function () {
    $('#changePasswordModal').on('shown.bs.modal', function () {
        $('#oldPasswordInput').focus();
    })
});

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
    "hasQueries": function () {
        return SnapApp.UserDB.getUserQueryIds(Meteor.userId()).length > 0;
    },
    "starredQueries": function () {
        return SnapApp.QueryDB.getQueries(
            SnapApp.UserDB.getUserStarredQueryIds(Meteor.userId()));
    },
    "hasStarredQueries": function () {
        var starred = SnapApp.UserDB.getUserStarredQueryIds(Meteor.userId());
        return starred != undefined && starred.length > 0;
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
    },
    changePasswordError: function () {
        return changePwdErrorMsg.get();
    }
});

Template.accountPage.events({
    "click .removeQryBtn": function (evt) {
        evt.preventDefault();
        onRemoveQuery(this);
    },
    "click .unstarQryBtn": function (evt) {
        evt.preventDefault();
        onUnstarQuery(this);
    },
    "click #changePasswordButton": function (evt, template) {
        evt.preventDefault();
        onChangePassword(template);
    },
    "keypress #oldPasswordInput": function (event) {
        if (event.which === SnapApp.ENTER_KEY_CODE) {
            event.preventDefault();
            $("#newPasswordInput").focus();
        }
    },
    "keypress #newPasswordInput": function (event) {
        if (event.which === SnapApp.ENTER_KEY_CODE) {
            event.preventDefault();
            $("newPasswordInputConfirm").focus();
        }
    },
    "keypress #newPasswordInputConfirm": function (event, template) {
        if (event.which === SnapApp.ENTER_KEY_CODE) {
            event.preventDefault();
            onChangePassword(template);
        }
    }
});

function onChangePassword(template) {
    var currentPwd    = template.find("#oldPasswordInput").value;
    var newPwd        = template.find("#newPasswordInput").value;
    var newPwdConfirm = template.find("#newPasswordInputConfirm").value;
    if (newPwd != newPwdConfirm) {
        changePwdErrorMsg.set("New passwords don't match");
    } else {
        Accounts.changePassword(currentPwd, newPwd, function (err) {
            if (err) {
                changePwdErrorMsg.set("Failed to change your password");
            } else {
                $("#changePasswordModal").modal("hide");
            }
        })
    }
}

function onRemoveQuery(query) {
    Meteor.call("removeQueryFromUser", query["_id"]);
}

function onUnstarQuery(query) {
    Meteor.call("removeStarredQueryFromUser", query["_id"]);
}