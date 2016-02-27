/**
 * Created by Phani on 2/14/2016.
 */

Template.queryResults.helpers({
    regions: function () {
        var regions = Queries.findOne()[QUERY_REGIONS];
        return regions.join(", ").toUpperCase();
    },
    numJunctions: function () {
        return Junctions.find({}).count();
    },
    queryDate: function () {
        var date = Queries.findOne()[QUERY_CREATED_DATE];
        return moment(date).format("MMMM Do, YYYY");
    },
    filterSummary: function () {
        var filters = Queries.findOne()[QUERY_FILTERS];
        if (filters.length == 0) {
            return "<p class=\"text-muted\">None</p>";
        }
        var summary = "";
        for (var i = 0; i < filters.length; i++) {
            summary += " " + filters[i][QUERY_FILTER_FIELD] + " "
                + filterOpToStr(filters[i][QUERY_FILTER_OP]) + " "
                + filters[i][QUERY_FILTER_VAL] + "<br>";
        }
        return summary;
    },
    isError: function () {
        var regions = Regions.find().fetch();
        for (var i = 0; i < regions.length; i++) {
            if (regions[i][REGION_LOADED_DATE] == null) {
                return true;
            }
        }
        return false;
    },
    errorMessage: function () {
        var regions = Regions.find().fetch();
        var badRegions = [];
        for (var i = 0; i < regions.length; i++) {
            if (regions[i][REGION_LOADED_DATE] == null) {
                badRegions.push(regions[i]["_id"]);
            }
        }
        if (regions.length > 1) {
            return "Failed to load the regions \"" + badRegions.join("\",\"" + "\". Check that the entry is correct.");
        }
        return "Failed to load the region \"" + badRegions[0] + "\". Check that the entry is correct.";
    }
});

function filterOpToStr(str) {
    if (str == MONGO_OPERATOR_EQ) {
        return "==";
    }
    if (str == MONGO_OPERATOR_GT) {
        return ">";
    }
    if (str == MONGO_OPERATOR_LT) {
        return "<";
    }
    if (str == MONGO_OPERATOR_GTE) {
        return "≥";
    }
    if (str == MONGO_OPERATOR_LTE) {
        return "≤";
    }
}