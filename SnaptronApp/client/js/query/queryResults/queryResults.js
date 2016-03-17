/**
 * Created by Phani on 2/14/2016.
 */

Template.queryResults.events({
    "shown.bs.collapse #junctionTableCollapse": function () {
        $("html, body").animate({scrollTop: $(document).height()}, "slow");
    },
    "click #addOwnedQryBtn": function () {
        Meteor.call("addQueryToUser", Queries.findOne()._id);
    }
});

Template.queryResults.helpers({
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
        var regions    = Regions.find().fetch();
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
    },
    processors: function () {
        return SnapApp.QueryDB.getProcessorsFromQuery(Queries.findOne()["_id"]);
    },
    processorTemplate: function () {
        var type = this[QRY_PROCESSOR_TYPE];
        return SnapApp.Processors.Index[type][SnapApp.Processors.TEMPLATE];
    },
    isAbandonedByUser: function () {
        return (SnapApp.QueryDB.isQueryCurrentUsers(Queries.findOne()["_id"])
        && SnapApp.UserDB.getUserQueryIds(Meteor.userId()).indexOf(Queries.findOne()["_id"]) == -1);
    }
});