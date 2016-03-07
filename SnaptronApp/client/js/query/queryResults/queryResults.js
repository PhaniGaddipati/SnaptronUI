/**
 * Created by Phani on 2/14/2016.
 */

Template.queryResults.events({
    "click #copyQueryBtn": function () {
        Meteor.call("copyQuery", Queries.findOne()["_id"], function (err, newId) {
            if (err != null) {
                console.warn(err.message);
                //TODO UI error mesage
            } else {
                Router.go('/query/' + newId);
            }
        })
    }
});

Template.queryResults.helpers({
    regions: function () {
        var regionIds = Queries.findOne()[QRY_REGIONS];
        return regionIds.join(", ").toUpperCase();
    },
    numJunctions: function () {
        return Junctions.find({}).count();
    },
    queryDate: function () {
        var date = Queries.findOne()[QRY_CREATED_DATE];
        return moment(date).format("MMMM Do, YYYY");
    },
    filterSummary: function () {
        var filters = Queries.findOne()[QRY_FILTERS];
        if (filters.length == 0) {
            return "<p class=\"text-muted\">None</p>";
        }
        var summary = "";
        for (var i = 0; i < filters.length; i++) {
            summary += " " + filters[i][QRY_FILTER_FIELD] + " "
                + filterOpToStr(filters[i][QRY_FILTER_OP]) + " "
                + filters[i][QRY_FILTER_VAL] + "<br>";
        }
        return summary;
    },
    isError: function () {
        var regionIds = Queries.findOne()[QRY_REGIONS];
        for (var i = 0; i < regionIds.length; i++) {
            var reg = SnapApp.RegionDB.getRegion(regionIds[i]);
            if (reg == null || reg[REGION_LOADED_DATE] == null) {
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
        if (badRegions.length > 1) {
            return "Failed to load the regions \"" + badRegions.join("\", \"") + "\". Check that the entry is correct.";
        }
        return "Failed to load the region \"" + badRegions[0] + "\". Check that the entry is correct.";
    },
    isCurrentUsers: function () {
        return SnapApp.QueryDB.isQueryCurrentUsers(Queries.findOne()["_id"]);
    },
    isLoggedIn: function () {
        return Meteor.userId() != null;
    }
});