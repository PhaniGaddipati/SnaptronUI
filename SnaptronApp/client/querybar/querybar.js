/**
 * Created by Phani on 2/14/2016.
 */
const ENTER_KEY_CODE = 13;
var junctionSubscriptionHandler = false;

Template.querybar.events({
    "click .submit": function (event, template) {
        event.preventDefault();
        var queryStr = template.find(".search_input").value;
        handleSubmitQuery(queryStr);
    },
    'keypress .search_input': function (event, template) {
        if (event.which === ENTER_KEY_CODE) {
            event.preventDefault();
            var queryStr = template.find(".search_input").value;
            handleSubmitQuery(queryStr);
        }
    }
});
Template.querybar.helpers({
    loading: function () {
        return Session.get("loading");
    }
});

function handleSubmitQuery(queryStr) {
    if (!Session.get("loading")) {
        Session.set("loading", true);
        console.log("Query submit: " + queryStr);

        var newHandler = Meteor.subscribe("junctions", queryStr);
        if (junctionSubscriptionHandler) {
            junctionSubscriptionHandler.stop();
        }
        junctionSubscriptionHandler = newHandler;
    }
}