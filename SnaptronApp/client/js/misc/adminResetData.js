/**
 * Created by Phani on 3/31/2016.
 */
Template.adminResetData.events({
    "click #resetDataBtn": function (evt) {
        evt.preventDefault();
        Meteor.call("resetSamplesAndJunctions", function (err, result) {
            Router.go("/admin");
        });
    }
});