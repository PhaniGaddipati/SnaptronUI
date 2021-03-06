/**
 * Created by Phani on 2/24/2016.
 */
Template.home.events({
    "click #cd99btn": function (event) {
        event.preventDefault();
        submitPlainQuery("cd99");
    },
    "click #drd4btn": function (event) {
        event.preventDefault();
        submitPlainQuery("drd4");
    },
    "click #httbtn": function (event) {
        event.preventDefault();
        submitPlainQuery("htt");
    },
    "click #alkbtn": function (event) {
        event.preventDefault();
        submitPlainQuery("alk");
    }
});

function submitPlainQuery(region) {
    if (!Session.get("loadingQuery")) {
        Session.set("loadingQuery", true);
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
}