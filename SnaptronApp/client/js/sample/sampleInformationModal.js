/**
 * Created by Phani on 3/23/2016.
 *
 * Shows a modal of sample information. The data context should contain a field "sampleId"
 * for the id of the sample to load and display.
 */

var URL_KEYS       = ["URL_R_s", "URL_s"];
var EXCLUDE_KEYS   = ["md5_s", "md5_R_s"];
var ACCESSION_KEYS = {
    run_accession_s: "run",
    sample_accession_s: "sample",
    experiment_accession_s: "experiment",
    study_accession_s: "study",
    submission_accession_s: "submission"
};

Template.sampleInformationModal.onCreated(function () {
    var self           = this;
    self.loadingSample = new ReactiveVar(true);
    self.sample        = {_id: self.data.sampleId};
    Meteor.call("getSample", self.data.sampleId, true, function (err, result) {
        self.sample = result;
        self.loadingSample.set(false);
    });
});

Template.sampleInformationModal.helpers({
    "loadingSample": function () {
        return Template.instance().loadingSample.get();
    },
    "keys": function () {
        var sample = Template.instance().sample;
        return _.filter(_.keys(sample), function (key) {
            return sample[key] !== "" && sample[key] != "NA" && EXCLUDE_KEYS.indexOf(key) == -1;
        });
    },
    "keyName": function (key) {
        return formatHeaderText(key);
    },
    "keyVal": function (key) {
        if (URL_KEYS.indexOf(key) > -1) {
            var url = Template.instance().sample[key];
            return "<a target=\"_blank\" href=\"" + url + "\">" + url + "</a>";
        }
        if (_.keys(ACCESSION_KEYS).indexOf(key) > -1) {
            var id  = Template.instance().sample[key];
            var url = "https://trace.ddbj.nig.ac.jp/DRASearch/" + ACCESSION_KEYS[key] + "?acc=" + id;
            return "<a target=\"_blank\" href=\"" + url + "\">" + id + "</a>";
        }
        return Template.instance().sample[key];
    }
});


function formatHeaderText(str) {
    if (str.endsWith("_s") || str.endsWith("_t")) {
        str = str.substring(0, str.length - 2);
    }
    return str.toUpperCase().replace(/_/g, " ").trim();
}