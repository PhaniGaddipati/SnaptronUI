/**
 * Created by Phani on 3/23/2016.
 */

var errorSignInOrRegister = new ReactiveVar(false);


Template.accountModal.onRendered(function () {
    errorSignInOrRegister.set(false);
});

Template.accountModal.helpers({
    "isError": function () {
        return errorSignInOrRegister.get();
    }
});

Template.accountModal.events({
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
    "keypress #emailInput": function (event) {
        if (event.which === SnapApp.ENTER_KEY_CODE) {
            event.preventDefault();
            $("#passwordInput").focus();
        }
    },
    "click #registerBtn": function (event, template) {
        event.preventDefault();
        onRegister(template);
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
            $("#accountNavModal").modal("hide");
        }
    });
}