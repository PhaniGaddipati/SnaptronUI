/**
 * Created by Phani on 3/11/2016.
 */

var selectedType        = new ReactiveVar(null);
var valid               = new ReactiveVar(false);
var currentlyProcessing = new ReactiveVar(false);

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
    "processorSelects": function () {
        if (selectedType.get() == null) {
            return false;
        }
        return SnapApp.Processors.Index[selectedType.get()][SnapApp.Processors.SELECTS];
    },
    "processorInputs": function () {
        if (selectedType.get() == null) {
            return false;
        }
        return SnapApp.Processors.Index[selectedType.get()][SnapApp.Processors.INPUTS];
    },
    "currentlyProcessing": function () {
        return currentlyProcessing.get();
    }
});

Template.processorsPanel.events({
    "change #processorType": function (evt, template) {
        selectedType.set(template.find("#processorType").value);
        validate(evt, template);
    },
    "change .groupSelect": validate,
    "click #analyzeBtn": onAnalyze,
    "keypress .paramInputField": function (evt, template) {
        if (evt.which === SnapApp.ENTER_KEY_CODE) {
            evt.preventDefault();
        }
        validate(evt, template);
    }
});

Template.processorsPanel.onRendered(function () {
    selectedType.set(Template.instance().find("#processorType").value);
});

function onAnalyze(evt, template) {
    currentlyProcessing.set(true);
    var queryId     = Queries.findOne({})._id;
    var type        = template.find("#processorType").value;
    var fn          = SnapApp.Processors.Index[type][SnapApp.Processors.FUNCTION];
    var inputGroups = getInputGroups(template);
    var params      = getParams(template);

    Meteor.call("startProcessor", type, queryId, inputGroups, params, function () {
        currentlyProcessing.set(false);
    });
}

function validate(evt, template) {
    var validateFn = SnapApp.Processors.Index[selectedType.get()][SnapApp.Processors.VALIDATE_FUNCTION];
    Meteor.call(validateFn, Queries.findOne()["_id"],
        getInputGroups(template), getParams(template), function (err, result) {
            valid.set(result);
        });
}

function getInputGroups(template) {
    var inputGroups = {};
    var inputs      = SnapApp.Processors.Index[selectedType.get()][SnapApp.Processors.INPUT_GROUPS];
    for (var i = 0; i < inputs.length; i++) {
        inputGroups[inputs[i]] = template.find("#" + inputs[i]).value;
    }
    return inputGroups;
}
function getParams(template) {
    var params       = {};
    var selectFields = SnapApp.Processors.Index[selectedType.get()][SnapApp.Processors.SELECTS];
    for (var i = 0; i < selectFields.length; i++) {
        var param     = selectFields[i][SnapApp.Processors.PARAM];
        params[param] = template.find("#pSelect" + param).value;
    }

    var inputFields = SnapApp.Processors.Index[selectedType.get()][SnapApp.Processors.INPUTS];
    for (var i = 0; i < inputFields.length; i++) {
        var param     = inputFields[i][SnapApp.Processors.PARAM];
        params[param] = template.find("#pInput" + param).value;
    }
    return params;
}