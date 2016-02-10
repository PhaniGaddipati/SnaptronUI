if (Meteor.isClient) {
    Template.querybar.events({
        "click .submit": function (event, template) {
            event.preventDefault();
            var queryStr = template.find(".search_input").value;
            handleSubmitQuery(queryStr);
        },
        'keypress .search_input': function (event, template) {
            if (event.which === 13) {
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
        console.log("Query submit: " + queryStr);
        Meteor.call("getIdForQuery", queryStr);
    }
}