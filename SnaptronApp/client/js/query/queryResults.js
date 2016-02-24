/**
 * Created by Phani on 2/14/2016.
 */

Template.queryResults.helpers({
    queryStr: function () {
        return Queries.findOne()._id;
    },
    numJunctions: function () {
        return Queries.findOne().junctions.length;
    },
    queryDate: function () {
        var date = Queries.findOne().lastLoadedDate;
        return moment(date).format("MMMM Do YYYY");
    }
});