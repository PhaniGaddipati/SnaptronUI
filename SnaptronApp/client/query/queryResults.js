/**
 * Created by Phani on 2/14/2016.
 */

Template.queryResults.helpers({
    queryStr: function () {
        return Queries.findOne().query;
    },
    numJunctions: function () {
        return Queries.findOne().numJunctions;
    },
    queryDate: function () {
        var date = Queries.findOne().date;
        return moment(date).format("MMMM Do YYYY");
    }
});