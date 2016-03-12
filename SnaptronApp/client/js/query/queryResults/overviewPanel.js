/**
 * Created by Phani on 3/12/2016.
 */
Template.overviewPanel.events({
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


Template.overviewPanel.helpers({
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
    isCurrentUsers: function () {
        return SnapApp.QueryDB.isQueryCurrentUsers(Queries.findOne()["_id"]);
    },
    isLoggedIn: function () {
        return Meteor.userId() != null;
    }
});