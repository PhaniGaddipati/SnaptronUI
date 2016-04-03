/**
 * Created by Phani on 3/31/2016.
 */
Template.adminResetData.events({
    "click #resetDataBtn": function (evt) {
        evt.preventDefault();
        Meteor.call("resetSnaptronData", function (err, result) {
            if (err) {
                console.log(err);
            }
            Router.go("/admin");
        });
    }
});