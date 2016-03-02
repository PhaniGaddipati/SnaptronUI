/**
 * Created by Phani on 2/14/2016.
 */

Template.queryResults.onRendered(function () {
    Tracker.autorun(updateFilterDialog);
    updateSelects();
});

function updateSelects() {
    var options = getJunctionNumberKeys();
    var selection = d3.select("#addFieldSelect")
        .selectAll("option")
        .data(options, function (opt) {
            return opt;
        });
    selection.exit().remove();
    selection.enter()
        .append("option")
        .text(function (d) {
            return d;
        });
}

function updateFilterDialog() {
    var qry = Queries.findOne();
    if (qry != null) {
        var filters = qry[QRY_FILTERS];
        var elems = d3.select("#currentFiltersList").selectAll("li").data(filters, filterKey);
        var nElems = elems.enter().append("li")
            .append("form")
            .attr("class", "form-inline")
            .append("div")
            .attr("class", "form-group");
        nElems.append("label").html(function (filter) {
            return filter[QRY_FILTER_FIELD] + " "
                + filterOpToStr(filter[QRY_FILTER_OP]) + " "
                + filter[QRY_FILTER_VAL] + "&nbsp;&nbsp;";
        });
        nElems.append("a")
            .attr("href", "#")
            .text("(delete)")
            .on("click", function (filter) {
                Meteor.call("deleteFilterFromQuery", Queries.findOne()["_id"], filter)
            });
        elems.exit().remove();

        d3.select("#noFilterDiv").select("#noFilterText").remove();
        if (filters.length == 0) {
            d3.select("#noFilterDiv").append("p")
                .attr("id", "noFilterText")
                .text("No filters currently applied");
        }
    }
}

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
    },
    "click #modalDoneBtn": function () {
        console.log("fd");
        document.location.reload(true);
    },
    "click #addFilterBtn": function (evt, template) {
        var field = template.find("#addFieldSelect").value;
        var op = template.find("#addOpSelect").value;
        var val = parseInt(template.find("#addValInput").value);
        Meteor.call("addFilterToQuery", Queries.findOne()["_id"], field, op, val);
    }
});

Template.queryResults.helpers({
    regions: function () {
        var regions = Queries.findOne()[QRY_REGIONS];
        return regions.join(", ").toUpperCase();
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
        if (badRegions.length > 1) {
            return "Failed to load the regions \"" + badRegions.join("\", \"") + "\". Check that the entry is correct.";
        }
        return "Failed to load the region \"" + badRegions[0] + "\". Check that the entry is correct.";
    },
    isCurrentUsers: function () {
        return isQueryCurrentUsers(Queries.findOne()["_id"]);
    },
    isLoggedIn: function () {
        return Meteor.userId() != null;
    }
});

function filterKey(filter) {
    if (filter == null || filter == undefined) {
        return "";
    }
    return filter[QRY_FILTER_FIELD] + " "
        + filterOpToStr(filter[QRY_FILTER_OP]) + " "
        + filter[QRY_FILTER_VAL];

}