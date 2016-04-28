/**
 * Created by Phani on 3/12/2016.
 */

var currentlyAddingGroup = new ReactiveVar(false);

Template.selectionPanel.helpers({
    isUsersQuery: function () {
        return SnapApp.QueryDB.isQueryCurrentUsers(Queries.findOne()["_id"]);
    },
    selectionTitle: function () {
        SnapApp.selectedJnctIDsDep.depend();
        var len = SnapApp.selectedJnctIDs.length;
        if (len == 0)
            return "No junctions selected";
        if (len == 1)
            return SnapApp.selectedJnctIDs.length + " junction selected";
        return SnapApp.selectedJnctIDs.length + " junctions selected";
    },
    anyJunctionsSelected: function () {
        SnapApp.selectedJnctIDsDep.depend();
        return SnapApp.selectedJnctIDs.length > 0;
    },
    currentlyAddingGroup: function () {
        return currentlyAddingGroup.get();
    }
});

Template.selectionPanel.events({
    "click #addQryGroupBtn": function (evt, template) {
        evt.preventDefault();
        onAddGroup(template);
    },
    "click #clearSelectionBtn": function (evt) {
        evt.preventDefault();
        onClearSelection();
    },
    "keypress #addGroupInputName": function (event, template) {
        if (event.which === SnapApp.ENTER_KEY_CODE) {
            event.preventDefault();
            onAddGroup(template);
        }
    }
});

function onClearSelection() {
    SnapApp.selectedJnctIDs = [];
    SnapApp.selectedJnctIDsDep.changed();
}

function onAddGroup(template) {
    var name = template.find("#addGroupInputName").value;
    currentlyAddingGroup.set(true);
    Meteor.call("addGroupToQuery", Queries.findOne()["_id"], name,
        SnapApp.selectedJnctIDs, function (err) {
            if (!err) {
                onClearSelection();
            }
            currentlyAddingGroup.set(false);
        });
}