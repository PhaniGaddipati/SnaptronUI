/**
 * Created by Phani on 3/13/2016.
 */

Template.sampleNormalizedDiffResults.helpers({
    "paramsList": function () {
        return _.map(this[QRY_PROCESSOR_PARAMS], function (val, key) {
            return {
                "key": key,
                "val": val
            }
        });
    },
    "groupsList": function () {
        return _.map(this[QRY_PROCESSOR_INPUT_GROUPS], function (val, key) {
            var grp = SnapApp.QueryDB.getGroupFromQuery(Queries.findOne()._id, val);
            if (grp == null) {
                var name = "Not Found";
            } else {
                name = grp[QRY_GROUP_NAME];
            }
            return {
                "key": key,
                "val": name
            }
        });
    },
    "tableSettings": function () {
        return {
            "showColumnToggles": false,
            "showFilter": false,
            "rowsPerPage": 5,
            "fields": ["sample", "A", "B", "D"]
        };
    },
    "resultsArr": function () {
        return this[QRY_PROCESSOR_RESULTS][SnapApp.Processors.SND.RESULTS_TOP_K];
    },
    isCurrentUsers: function () {
        return SnapApp.QueryDB.isQueryCurrentUsers(Queries.findOne()["_id"]);
    }
});

Template.sampleNormalizedDiffResults.events({
    "click #removeProcessor": function (evt) {
        evt.preventDefault();
        Meteor.call("removeProcessorFromQuery", Queries.findOne()._id, this._id);
    }
});