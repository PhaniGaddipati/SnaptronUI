/**
 * Created by Phani on 3/3/2016.
 */

Template.selectionBar.helpers({
    isUsersQuery: function () {
        return isQueryCurrentUsers(Queries.findOne()["_id"]);
    },
    selectionTitle: function () {
        SnapApp.selectedJnctIDsDep.depend();
        var len = SnapApp.selectedJnctIDs.length;
        if (len <= 1)
            return SnapApp.selectedJnctIDs.length + " junction selected";
        return SnapApp.selectedJnctIDs.length + " junctions selected";
    }
});

Template.selectionBar.events({
    "click #clearSelectionBtn": function (evt) {
        evt.preventDefault();
        onClearSelection();
    },
    "click #addQryGroupBtn": function (evt, template) {
        evt.preventDefault();
        onAddGroup(template);
    }
});

function onAddGroup(template) {
    var name = template.find("#addGroupInputName").value;
    Meteor.call("addGroupToQuery", Queries.findOne()["_id"], name, SnapApp.selectedJnctIDs);
    onClearSelection();
}

function onClearSelection() {
    SnapApp.selectedJnctIDs = [];
    SnapApp.selectedJnctIDsDep.changed();
}