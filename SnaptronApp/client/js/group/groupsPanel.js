/**
 * Created by Phani on 3/3/2016.
 */

Template.groupsPanel.helpers({
    isUsersQuery: function () {
        return SnapApp.QueryDB.isQueryCurrentUsers(Queries.findOne()["_id"]);
    },

    isNoGroups: function () {
        return SnapApp.QueryDB.getGroupsFromQuery(Queries.findOne()["_id"]).length == 0
    },
    groups: function () {
        return SnapApp.QueryDB.getGroupsFromQuery(Queries.findOne()["_id"]);
    },
    groupText: function (id) {
        var group = SnapApp.QueryDB.getGroupFromQuery(Queries.findOne()["_id"], id);
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

Template.groupsPanel.events({
    "click .groupSel": function (evt, template) {
        evt.preventDefault();
        onSelectGroup(this._id);
    },
    "click .groupDel": function (evt, template) {
        evt.preventDefault();
        Meteor.call("deleteGroupFromQuery", Queries.findOne()["_id"], this._id)
    }
});

function onSelectGroup(groupId) {
    var group = SnapApp.QueryDB.getGroupFromQuery(Queries.findOne()["_id"], groupId);
    var jncts = group[QRY_GROUP_JNCTS];
    for (var i = 0; i < jncts.length; i++) {
        if (SnapApp.selectedJnctIDs.indexOf(jncts[i]) == -1) {
            SnapApp.selectedJnctIDs.push(jncts[i]);
        }
    }
    SnapApp.selectedJnctIDsDep.changed();
}