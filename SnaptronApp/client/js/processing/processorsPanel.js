/**
 * Created by Phani on 3/11/2016.
 */

var selectedType = new ReactiveVar(null);
var valid        = new ReactiveVar(false);

Template.processorsPanel.helpers({
    "processorTypes": function () {
        return _.keys(SnapApp.Processors.Index);
    },
    "selectedTypeDescription": function () {
        if (selectedType.get() == null) {
            return "";
        }
        return SnapApp.Processors.Index[selectedType.get()][SnapApp.Processors.DESCRIPTION];
    },
    "processorGroups": function () {
        if (selectedType.get() == null) {
            return [];
        }
        return SnapApp.Processors.Index[selectedType.get()][SnapApp.Processors.INPUT_GROUPS];
    },
    "queryGroups": function () {
        return SnapApp.QueryDB.getGroupsFromQuery(Queries.findOne()._id);
    },
    "valid": function () {
        return valid.get();
    },
    "groupOptionText": function (group) {
        var len = group[QRY_GROUP_JNCTS].length;
        if (len > 1) {
            return group[QRY_GROUP_NAME] + " (" + len + " junctions)";
        }
        return group[QRY_GROUP_NAME] + " (1 junction)";
    },
    "limitResultsOpt": function () {
        if (selectedType.get() == null) {
            return false;
        }
        return SnapApp.Processors.Index[selectedType.get()][SnapApp.Processors.LIMIT];
    }
});

Template.processorsPanel.events({
    "change #processorType": function (evt, template) {
        selectedType.set(template.find("#processorType").value);
        validate(evt, template);
    },
    "click .groupSelect": validate,
    "click #analyzeBtn": onAnalyze
});

Template.processorsPanel.onRendered(function () {
    selectedType.set(Template.instance().find("#processorType").value);
});

function onAnalyze(evt, template) {
    var queryId     = Queries.findOne({})._id;
    var k           = template.find("#topKResults").value;
    var type        = template.find("#processorType").value;
    var fn          = SnapApp.Processors.Index[type][SnapApp.Processors.FUNCTION];
    var inputGroups = {};
    var inputs      = SnapApp.Processors.Index[selectedType.get()][SnapApp.Processors.INPUT_GROUPS];
    for (var i = 0; i < inputs.length; i++) {
        inputGroups[inputs[i]] = template.find("#" + inputs[i]).value;
    }
    Meteor.call(fn, queryId, inputGroups, k);
}

function validate(evt, template) {
    var inputs         = SnapApp.Processors.Index[selectedType.get()][SnapApp.Processors.INPUT_GROUPS];
    var selectedGroups = [];
    for (var i = 0; i < inputs.length; i++) {
        var val = template.find("#" + inputs[i]).value;
        if (val == null || val == undefined) {
            valid.set(false);
            return;
        }
        if (selectedGroups.indexOf(val) > -1) {
            valid.set(false);
            return;
        }
        selectedGroups.push(val);
    }
    valid.set(true);
}