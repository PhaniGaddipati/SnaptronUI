/**
 * Created by Phani on 2/24/2016.
 */
Template.home.events({
    "click #cd99btn": function (event, template) {
        event.preventDefault();
        var query = newQuery();
        addQueryRegion(query, "cd99");
        submitQuery(query);
    },
    "click #drd4btn": function (event, template) {
        event.preventDefault();
        var query = newQuery();
        addQueryRegion(query, "drd3");
        submitQuery(query);
    },
    "click #chrbtn": function (event, template) {
        event.preventDefault();
        var query = newQuery();
        addQueryRegion(query, "chr6:1-10000000");
        submitQuery(query);
    }
});
