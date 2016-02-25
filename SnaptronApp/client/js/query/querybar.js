/**
 * Created by Phani on 2/14/2016.
 */
const ENTER_KEY_CODE = 13;

Session.setDefault("loadingQuery", false);

Template.querybar.helpers({
    loadingQuery: function () {
        return Session.get("loadingQuery");
    }
});

Template.querybar.events({
    "click .submit": function (event, template) {
        event.preventDefault();
        handleSubmitQuery(template);
    },
    "keypress #regionInput": function (event, template) {
        if (event.which === ENTER_KEY_CODE) {
            event.preventDefault();
            handleSubmitQuery(template);
        }
    }
});

Template.querybar.onRendered(function () {
    Session.setDefault("regionInput", "");
    Session.setDefault("length", "");
    Session.setDefault("samples", "");
    Session.setDefault("covSum", "");
    Session.setDefault("covAvg", "");
    Session.setDefault("covMed", "");
    Session.setDefault("lengthOp", ">");
    Session.setDefault("samplesOp", ">");
    Session.setDefault("covSumOp", ">");
    Session.setDefault("covAvgOp", ">");
    Session.setDefault("covMedOp", ">");

    this.find("#regionInput").value = Session.get("regionInput");
    this.find("#lengthInput").value = Session.get("length");
    this.find("#samplesCountInput").value = Session.get("samples");
    this.find("#coverageSumInput").value = Session.get("covSum");
    this.find("#coverageAvgInput").value = Session.get("covAvg");
    this.find("#coverageMedInput").value = Session.get("covMed");

    this.find("#lengthInputOp").value = Session.get("lengthOp");
    this.find("#samplesCountInputOp").value = Session.get("samplesOp");
    this.find("#coverageSumInputOp").value = Session.get("covSumOp");
    this.find("#coverageAvgInputOp").value = Session.get("covAvgOp");
    this.find("#coverageMedInputOp").value = Session.get("covMedOp");
});

function handleSubmitQuery(template) {
    if (!Session.get("loadingQuery")) {
        var region = template.find("#regionInput").value.toLowerCase();
        region.replace(/\s+/, ""); //Strip whitespace
        var length = parseInt(template.find("#lengthInput").value);
        var samples = parseInt(template.find("#samplesCountInput").value);
        var covSum = parseFloat(template.find("#coverageSumInput").value);
        var covAvg = parseFloat(template.find("#coverageAvgInput").value);
        var covMed = parseFloat(template.find("#coverageMedInput").value);

        var lengthOp = template.find("#lengthInputOp").value;
        var samplesOp = template.find("#samplesCountInputOp").value;
        var covSumOp = template.find("#coverageSumInputOp").value;
        var covAvgOp = template.find("#coverageAvgInputOp").value;
        var covMedOp = template.find("#coverageMedInputOp").value;

        Session.set("regionInput", region);
        Session.set("lengthOp", lengthOp);
        Session.set("samplesOp", samplesOp);
        Session.set("covSumOp", covSumOp);
        Session.set("covAvgOp", covAvgOp);
        Session.set("covMedOp", covMedOp);

        var query = newQuery();
        addQueryRegion(query, region);
        if (!isNaN(length)) {
            addQueryFilter(query, QUERY_FILTER_LENGTH, lengthOp, length);
            Session.set("length", length);
        }
        if (!isNaN(samples)) {
            addQueryFilter(query, QUERY_FILTER_SAMPLE_COUNT, samplesOp, samples);
            Session.set("samples", samples);
        }
        if (!isNaN(covSum)) {
            addQueryFilter(query, QUERY_FILTER_COV_SUM, covSumOp, covSum);
            Session.set("covSum", covSum);
        }
        if (!isNaN(covAvg)) {
            addQueryFilter(query, QUERY_FILTER_COV_AVG, covAvgOp, covAvg);
            Session.set("covAvg", covAvg);
        }
        if (!isNaN(covMed)) {
            addQueryFilter(query, QUERY_FILTER_COV_MED, covMedOp, covMed);
            Session.set("covMed", covMed);
        }
        submitQuery(query);
    }
}

submitQuery = function (query) {
    Session.set("loadingQuery", true);
    Meteor.call("addQuery", query, function (err, id) {
        Session.set("loadingQuery", false);
        if (err) {
            console.log(err);
            //TODO ui message of error
        } else {
            Router.go('/query/' + id);
        }
    });
};