/**
 * Created by Phani on 2/24/2016.
 */
Template.home.events({
    "click #cd99btn": function (event, template) {
        event.preventDefault();
        submitPlainQuery("cd99");
    },
    "click #drd4btn": function (event, template) {
        event.preventDefault();
        submitPlainQuery("drd4");
    },
    "click #httbtn": function (event, template) {
        event.preventDefault();
        submitPlainQuery("htt");
    }
});

function submitPlainQuery(region) {
    Meteor.call("submitQuery", region, [], [], [], function (err, id) {
        Session.set("loadingQuery", false);
        if (err) {
            console.log(err);
            //TODO ui message of error
        } else {
            Router.go('/query/' + id);
        }
    });
}