/**
 * Created by Phani on 3/12/2016.
 */

var signinErr = new ReactiveVar(false);

Template.accountNavMenu.onRendered(function () {
    $("#accountNavModal").on("shown.bs.modal", function () {
        $("#emailInput").focus();
    })
});

Template.accountNavMenu.helpers({
    "isSignedIn": function () {
        return Meteor.userId() != null;
    },
    "userEmail": function () {
        if (Meteor.user()) {
            return Meteor.user()["emails"][0]["address"];
        }
        return "ds";
    },
    "isError": function () {
        return signinErr.get();
    }
});

Template.accountNavMenu.events({
    "click #signInBtn": function (event, template) {
        event.preventDefault();
        onSignIn(template);
    },
    "keypress #passwordInput": function (event, template) {
        if (event.which === SnapApp.ENTER_KEY_CODE) {
            event.preventDefault();
            onSignIn(template);
        }
    },
    "click #registerBtn": function (event, template) {
        event.preventDefault();
    },
    "click #accountNavMenuItem": function () {
        signinErr.set(false);
    },
    "click #signOutBtn": function () {
        event.preventDefault();
        Meteor.logout();
        signinErr.set(false);
    }
});

function onSignIn(template) {
    var email    = template.find("#emailInput").value;
    var password = template.find("#passwordInput").value;
    Meteor.loginWithPassword(email, password, function (err) {
        if (err) {
            signinErr.set(true);
        }
    });
}