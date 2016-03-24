/**
 * Created by Phani on 3/22/2016.
 */

var sampleSearchQuery = new ReactiveVar("");
var INCLUDED_KEYS     = ["_id", "run_accession_s", "study_title_t", "sra_ID_s"];

Template.selectedSampleTable.onCreated(function () {
    var self = this;

    self.autorun(function () {
        SnapApp.selectedJnctIDsDep.depend();
        self.subscribe("samplesForJunctions", SnapApp.selectedJnctIDs, sampleSearchQuery.get());
    });
});

Template.selectedSampleTable.helpers({
    "sampleTableCollection": function () {
        return SnapApp.SampleDB.findSamplesForJunctions(SnapApp.selectedJnctIDs);
    },
    "tableSettings": function () {
        var samp   = Samples.findOne();
        var fields = _.map(_.without(_.keys(samp), "score"), function (key) {
            return {
                key: key,
                label: formatHeaderText(key),
                hidden: (INCLUDED_KEYS.indexOf(key) == -1)
            };
        });
        fields.push({
            key: "score",
            hidden: true,
            sortDirection: "descending",
            sortOrder: 0
        });

        return {
            "showColumnToggles": false,
            "showFilter": false,
            "rowsPerPage": 5,
            "responsive": true,
            "autoWidth": false,
            "throttleRefresh": 1000,
            "fields": fields
        };
    }
});

Template.selectedSampleTable.events({
    "click .reactive-table tbody tr": onRowClicked,
    "click #searchSamplesBtn": onSearch,
    "keypress #searchSamplesInput": function (evt, template) {
        if (evt.which === SnapApp.ENTER_KEY_CODE) {
            onSearch(evt, template);
        }
    }
});

function onSearch(evt, template) {
    evt.preventDefault();
    sampleSearchQuery.set(template.find("#searchSamplesInput").value);
}

function onRowClicked(evt) {
    evt.preventDefault();
    Modal.show("sampleInformationModal", this);
}

function formatHeaderText(str) {
    if (str.endsWith("_s") || str.endsWith("_t")) {
        str = str.substring(0, str.length - 2);
    }
    return str.toUpperCase().replace(/_/g, " ").trim();
}