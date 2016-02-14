/**
 * Created by Phani on 2/14/2016.
 */
const ENTER_KEY_CODE = 13;

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

function handleSubmitQuery(queryStr) {
    Router.go('/query/' + queryStr);
}