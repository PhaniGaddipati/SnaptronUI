/**
 * Created by Phani on 2/14/2016.
 */

Template.queryResults.helpers({
    regions: function () {
        var regions = Queries.findOne()[QUERY_REGIONS];
        return regions.join(",");
    },
    numJunctions: function () {
        return Queries.findOne().junctions.length;
    },
    queryDate: function () {
        var date = Queries.findOne().lastLoadedDate;
        return moment(date).format("MMMM Do YYYY");
    }
});