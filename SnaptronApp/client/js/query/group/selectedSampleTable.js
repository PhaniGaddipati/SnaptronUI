/**
 * Created by Phani on 3/22/2016.
 */

var SAMPLE_LIMIT  = 100;
var INCLUDED_KEYS = ["run_accession_s", "sample_accession_s", "experiment_accession_s", "study_accession_s", "submission_accession_s", "sra_ID_s", "run_ID_s"];

Template.selectedSampleTable.onCreated(function () {
    var self = this;
    self.autorun(function () {
        SnapApp.selectedJnctIDsDep.depend();
        self.subscribe("samplesForJunctions", SnapApp.selectedJnctIDs, SAMPLE_LIMIT);
    });
});

Template.selectedSampleTable.helpers({
    "sampleTableCollection": function () {
        return SnapApp.SampleDB.findSamplesForJunctions(SnapApp.selectedJnctIDs);
    },
    "tableSettings": function () {
        var samp   = Samples.findOne();
        var fields = _.map(_.keys(samp), function (key) {
            return {
                key: key,
                label: formatHeaderText(key),
                hidden: (INCLUDED_KEYS.indexOf(key) == -1)
            };
        });
        return {
            "showColumnToggles": true,
            "showFilter": false,
            "rowsPerPage": 5,
            "responsive": true,
            "autoWidth": false,
            "throttleRefresh": 1000,
            "fields": fields
        };
    }
});

function formatHeaderText(str) {
    return str.replace("_s", "").replace("_t", "").toUpperCase().replace(/_/g, " ").trim();
}