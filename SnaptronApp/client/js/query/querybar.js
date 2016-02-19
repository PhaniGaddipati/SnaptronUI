/**
 * Created by Phani on 2/14/2016.
 */
const ENTER_KEY_CODE = 13;

Template.querybar.events({
    "click .submit": function (event, template) {
        event.preventDefault();
        var region = template.find(".search_input").value;
        Session.set("regionInput", region);
        var query = newQuery(region);
        handleSubmitQuery(getQueryString(query));
    },
    'keypress .search_input': function (event, template) {
        if (event.which === ENTER_KEY_CODE) {
            event.preventDefault();
            var region = template.find(".search_input").value;
            Session.set("regionInput", region);
            var query = newQuery(region);
            handleSubmitQuery(getQueryString(query));
        }
    }
});

Template.querybar.onRendered(function () {
    Session.setDefault("regionInput", "");
    this.find(".search_input").value = Session.get("regionInput");
});
function handleSubmitQuery(queryStr) {
    Router.go('/query/' + queryStr);
}