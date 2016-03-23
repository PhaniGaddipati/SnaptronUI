/**
 * Created by Phani on 3/12/2016.
 */

Template.overviewPanel.onRendered(function () {
    $('#editQueryNameModal').on('shown.bs.modal', function () {
        $('#editQueryNameInput').focus();
    })
});

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
    },
    "click #editQueryNameBtn": function (evt, template) {
        evt.preventDefault();
        onChangeQueryName(template);
    },
    "keypress #editQueryNameInput": function (event, template) {
        if (event.which === SnapApp.ENTER_KEY_CODE) {
            event.preventDefault();
            onChangeQueryName(template);
        }
    },
    "click #starQuery": function (evt) {
        evt.preventDefault();
        Meteor.call("addStarredQueryToUser", Queries.findOne()._id);
    },
    "click #unstarQuery": function (evt) {
        evt.preventDefault();
        Meteor.call("removeStarredQueryFromUser", Queries.findOne()._id);
    },
    "click #editRegionsBtn": function (evt) {
        evt.preventDefault();
        Modal.show("editRegionsModal");
    },
    "click #editFiltersBtn": function (evt) {
        evt.preventDefault();
        Modal.show("editFiltersModal");
    }
});


Template.overviewPanel.helpers({
    queryName: function () {
        var name = Queries.findOne()[QRY_NAME];
        if (name == undefined || name == null) {
            return "<i>Unnamed</i>";
        }
        return name;
    },
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
    },
    isQueryStarred: function () {
        return SnapApp.UserDB.getUserStarredQueryIds(Meteor.userId()).indexOf(Queries.findOne()["_id"]) > -1;
    }
});

function onChangeQueryName(template) {
    var name = template.find("#editQueryNameInput").value;
    if (name != null && name != undefined) {
        name = name.trim();
        if (name === "") {
            name = null;
        }
    }
    Meteor.call("changeQueryName", Queries.findOne()._id, name);
    $("#editQueryNameModal").modal("hide");
}