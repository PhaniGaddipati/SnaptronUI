/**
 * Created by Phani on 3/3/2016.
 */

var anyFiltersChanged = false;

Template.editFiltersModal.onRendered(function () {
    updateSelects();
});

Template.editFiltersModal.helpers({
    "anyFilters": function () {
        return Queries.findOne()[QRY_FILTERS].length > 0;
    },

    "filters": function () {
        return Queries.findOne()[QRY_FILTERS];
    },

    "filterText": function () {
        return this[QRY_FILTER_FIELD] + " "
            + filterOpToStr(this[QRY_FILTER_OP]) + " "
            + this[QRY_FILTER_VAL]
    },
    isCurrentUsers: function () {
        return SnapApp.QueryDB.isQueryCurrentUsers(Queries.findOne()["_id"]);
    }
});

Template.editFiltersModal.events({
    "click #editFiltersDoneBtn": function (evt, template) {
        Modal.hide(template);
        if (anyFiltersChanged) {
            document.location.reload(true);
        }
    },
    "click #addFilterBtn": function (evt, template) {
        handleAddFilter(template);
    },
    "keypress #addValInput": function (event, template) {
        if (event.which === SnapApp.ENTER_KEY_CODE) {
            event.preventDefault();
            handleAddFilter(template);
        }
    },
    "click .filterDel": function () {
        handleRemoveFilter(this);
    }
});

function handleAddFilter(template) {
    var field      = template.find("#addFieldSelect").value;
    var op         = template.find("#addOpSelect").value;
    var valStr     = template.find("#addValInput").value.toLowerCase();
    var multiplier = 1;
    if (valStr.endsWith("k")) {
        multiplier = 1000;
        valStr     = valStr.replace("k", "");
    }
    var val           = parseInt(valStr) * multiplier;
    anyFiltersChanged = true;
    Meteor.call("addFilterToQuery", Queries.findOne()["_id"], field, op, val);
}

function handleRemoveFilter(filter) {
    anyFiltersChanged = true;
    Meteor.call("deleteFilterFromQuery", Queries.findOne()["_id"], filter)
}

function updateSelects() {
    var options   = SnapApp.JunctionDB.getJunctionNumberKeys();
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