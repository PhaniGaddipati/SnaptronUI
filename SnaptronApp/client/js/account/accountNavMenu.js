/**
 * Created by Phani on 3/12/2016.
 */

var errorSignInOrRegister = new ReactiveVar(false);

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
            return Meteor.user()[USER_EMAILS][0][USER_EMAIL_ADDRESS];
        }
        return "ds";
    },
    "isError": function () {
        return errorSignInOrRegister.get();
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
    "keypress #emailInput": function (event, template) {
        if (event.which === SnapApp.ENTER_KEY_CODE) {
            event.preventDefault();
            $("#passwordInput").focus();
        }
    },
    "click #registerBtn": function (event, template) {
        event.preventDefault();
        onRegister(template);
    },
    "click #accountNavMenuItem": function () {
        errorSignInOrRegister.set(false);
    },
    "click #signOutBtn": function () {
        event.preventDefault();
        Meteor.logout();
        errorSignInOrRegister.set(false);
    }
});

function onSignIn(template) {
    var email    = template.find("#emailInput").value;
    var password = template.find("#passwordInput").value;
    Meteor.loginWithPassword(email, password, function (err) {
        if (err) {
            errorSignInOrRegister.set(true);
        } else {
            $("#accountNavModal").modal("hide");
        }
    });
}

function onRegister(template) {
    var email    = template.find("#emailInput").value;
    var password = template.find("#passwordInput").value;
    Accounts.createUser({
        "email": email,
        "password": password
    }, function (err) {
        if (err) {
            errorSignInOrRegister.set(true);
        } else {
            console.log("Registered new user " + Meteor.userId());
        }
    });
}