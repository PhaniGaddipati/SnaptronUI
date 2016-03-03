/**
 * Created by Phani on 3/3/2016.
 */

Template.editFiltersModal.onRendered(function () {
    Tracker.autorun(updateFilterDialog);
    updateSelects();
});

Template.editFiltersModal.events({
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