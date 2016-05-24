/**
 * Created by Phani on 3/12/2016.
 */

Template.accountNavMenu.onRendered(function () {
    $("#accountNavModal").on("shown.bs.modal", function () {
        $("#emailInput").focus();
    })
});

Template.accountNavMenu.helpers({
    "isSignedIn": function () {
        return Meteor.userId() != null;
    }
});

Template.accountNavMenu.events({
    "click #accountNavMenuItem": function (evt) {
        evt.preventDefault();
        Modal.show("accountModal");
    },
    "click #signOutBtn": function (evt) {
        evt.preventDefault();
        Meteor.logout();
    }
});