/**
 * Created by Phani on 3/31/2016.
 */
if (Meteor.isServer) {
    Meteor.methods({
        /**
         * If the current user is an admin, clears all loaded
         * samples, junctions, and regions
         */
        "resetSnaptronData": function () {
            if (Roles.userIsInRole(Meteor.user(), ['admin'])) {
                Samples.remove({});
                Junctions.remove({});
                Regions.remove({});
            }
        }
    })
}


Template.adminResetData.events({
    "click #resetDataBtn": function (evt) {
        evt.preventDefault();
        Meteor.call("resetSnaptronData", function (err, result) {
            Router.go("/admin");
        });
    }
});