/**
 * Created by Phani on 3/3/2016.
 */


var anyRegionChange = false;

Template.editRegionsModal.events({
    "click #modalDoneBtn": function () {
        if (anyRegionChange) {
            document.location.reload(true);
        }
    },
    "click #addRegionBtn": function (evt, template) {
        handleAddRegion(template);
    },
    "keypress #addRegionInput": function (event, template) {
        if (event.which === SnapApp.ENTER_KEY_CODE) {
            event.preventDefault();
            handleAddRegion(template);
        }
    },
    "click .regionDel": function () {
        handleRemoveRegion(this.toString());
    }
});

Template.editRegionsModal.helpers({
    "anyRegions": function () {
        return Queries.findOne()[QRY_REGIONS].length > 0;
    },

    "regions": function () {
        return Queries.findOne()[QRY_REGIONS];
    },

    "regionText": function () {
        return this.toUpperCase();
    },
    isCurrentUsers: function () {
        return SnapApp.QueryDB.isQueryCurrentUsers(Queries.findOne()["_id"]);
    }
});

function handleAddRegion(template) {
    var region      = template.find("#addRegionInput").value;
    anyRegionChange = true;
    Meteor.call("addRegionToQuery", Queries.findOne()["_id"], region);
}

function handleRemoveRegion(regionId) {
    anyRegionChange = true;
    Meteor.call("deleteRegionFromQuery", Queries.findOne()["_id"], regionId)
}