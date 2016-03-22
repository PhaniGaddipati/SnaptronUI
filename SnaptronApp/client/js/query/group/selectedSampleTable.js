/**
 * Created by Phani on 3/22/2016.
 */

var sampleLimit = 100;

Template.selectedSampleTable.onCreated(function () {
    var self = this;
    self.autorun(function () {
        SnapApp.selectedJnctIDsDep.depend();
        self.subscribe("samplesForJunctions", SnapApp.selectedJnctIDs, sampleLimit);
    });
});

Template.selectedSampleTable.helpers({
    "sampleTableCollection": function () {
        return SnapApp.SampleDB.findSamplesForJunctions(SnapApp.selectedJnctIDs);
    },
    "tableSettings": function () {
        return {
            "showColumnToggles": true,
            "showFilter": false,
            "rowsPerPage": 5,
            "responsive": true,
            "autoWidth": false,
            "throttleRefresh": 1000
        };
    }
});

function formatHeaderText(str) {
    return str.toUpperCase().replace(/_/g, " ").trim();
}