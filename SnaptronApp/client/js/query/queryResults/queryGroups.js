/**
 * Created by Phani on 3/3/2016.
 */

Template.queryGroups.helpers({
    isUsersQuery: function () {
        return isQueryCurrentUsers(Queries.findOne()["_id"]);
    },
    selectionTitle: function () {
        SnapApp.selectedJnctIDsDep.depend();
        var len = SnapApp.selectedJnctIDs.length;
        if (len == 0)
            return "No junctions selected"
        if (len == 1)
            return SnapApp.selectedJnctIDs.length + " junction selected";
        return SnapApp.selectedJnctIDs.length + " junctions selected";
    },
    isNoGroups: function () {
        return getGroupsFromQuery(Queries.findOne()["_id"]).length == 0
    },
    anyJunctionsSelected: function () {
        SnapApp.selectedJnctIDsDep.depend();
        return SnapApp.selectedJnctIDs.length > 0;
    },
    groups: function () {
        return getGroupsFromQuery(Queries.findOne()["_id"]);
    },
    groupText: function (id) {
        var group = getGroupFromQuery(Queries.findOne()["_id"], id);
        if (group == null) {
            return "";
        }
        var name = group[QRY_GROUP_NAME];
        if (name == null || name.trim() == "") {
            name = "untitled";
        }
        if (group[QRY_GROUP_JNCTS].length == 1) {
            return name + " (1 junction)";
        }
        return name + " (" + group[QRY_GROUP_JNCTS].length + " junctions)";
    }
});

Template.queryGroups.events({
    "click #clearSelectionBtn": function (evt) {
        evt.preventDefault();
        onClearSelection();
    },
    "click #addQryGroupBtn": function (evt, template) {
        evt.preventDefault();
        onAddGroup(template);
    },
    "click .groupSel": function (evt, template) {
        evt.preventDefault();
        var group = getGroupFromQuery(Queries.findOne()["_id"], this._id);
        SnapApp.selectedJnctIDs = group[QRY_GROUP_JNCTS];
        SnapApp.selectedJnctIDsDep.changed();
    },
    "click .groupDel": function (evt, template) {
        evt.preventDefault();
        Meteor.call("deleteGroupFromQuery", Queries.findOne()["_id"], this._id)
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