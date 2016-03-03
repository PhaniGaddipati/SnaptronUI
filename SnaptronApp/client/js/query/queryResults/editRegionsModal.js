/**
 * Created by Phani on 3/3/2016.
 */


var anyRegionChange = false;

Template.editRegionsModal.onRendered(function () {
    Tracker.autorun(updateRegionDialog);
});

Template.editRegionsModal.events({
    "click #modalDoneBtn": function () {
        if (anyRegionChange) {
            document.location.reload(true);
        }
    },
    "click #addRegionBtn": function (evt, template) {
        var region = template.find("#addRegionInput").value;
        anyRegionChange = true;
        Meteor.call("addRegionToQuery", Queries.findOne()["_id"], region);
    }
});

function updateRegionDialog() {
    var qry = Queries.findOne();
    if (qry != null) {
        var regionIds = qry[QRY_REGIONS];
        var elems = d3.select("#currentRegionsList").selectAll("li").data(regionIds, function (d) {
            return d;
        });
        var nElems = elems.enter().append("li")
            .append("form")
            .attr("class", "form-inline")
            .append("div")
            .attr("class", "form-group");
        nElems.append("label").html(function (regionId) {
            return regionId.toUpperCase() + "&nbsp;&nbsp;";
        });
        nElems.append("a")
            .attr("href", "#")
            .text("(delete)")
            .on("click", function (regionId) {
                anyRegionChange = true;
                Meteor.call("deleteRegionFromQuery", Queries.findOne()["_id"], regionId)
            });
        elems.exit().remove();

        d3.select("#noRegionDiv").select("#noRegionText").remove();
        if (regionIds.length == 0) {
            d3.select("#noRegionDiv").append("p")
                .attr("id", "noRegionText")
                .text("No Regions");
        }
    }
}