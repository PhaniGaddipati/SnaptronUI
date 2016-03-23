/**
 * Created by Phani on 3/23/2016.
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

Template.sampleInformationModal.helpers({
    "keys": function () {
        var self = this;
        return _.filter(_.keys(this), function (key) {
            return self[key] !== "" && self[key] != "NA" && EXCLUDE_KEYS.indexOf(key) == -1;
        });
    },
    "keyName": function (key) {
        return formatHeaderText(key);
    },
    "keyVal": function (key) {
        if (URL_KEYS.indexOf(key) > -1) {
            var url = Template.instance().data[key];
            return "<a target=\"_blank\" href=\"" + url + "\">" + url + "</a>";
        }
        if (_.keys(ACCESSION_KEYS).indexOf(key) > -1) {
            var id  = Template.instance().data[key];
            var url = "https://trace.ddbj.nig.ac.jp/DRASearch/" + ACCESSION_KEYS[key] + "?acc=" + id;
            return "<a target=\"_blank\" href=\"" + url + "\">" + id + "</a>";
        }
        return Template.instance().data[key];
    }
});


function formatHeaderText(str) {
    if (str.endsWith("_s") || str.endsWith("_t")) {
        str = str.substring(0, str.length - 2);
    }
    return str.toUpperCase().replace(/_/g, " ").trim();
}