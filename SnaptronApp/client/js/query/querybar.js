/**
 * Created by Phani on 2/14/2016.
 */
const ENTER_KEY_CODE = 13;

Template.querybar.events({
    "click .submit": function (event, template) {
        event.preventDefault();
        handleSubmitQuery(template);
    },
    'keypress .search_input': function (event, template) {
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
    var region = template.find("#regionInput").value;
    var length = parseInt(template.find("#lengthInput").value);
    var samples = parseInt(template.find("#samplesCountInput").value);
    var covSum = parseInt(template.find("#coverageSumInput").value);
    var covAvg = parseInt(template.find("#coverageAvgInput").value);
    var covMed = parseInt(template.find("#coverageMedInput").value);

    var lengthOp = template.find("#lengthInputOp").value;
    var samplesOp = template.find("#samplesCountInputOp").value;
    var covSumOp = template.find("#coverageSumInputOp").value;
    var covAvgOp = template.find("#coverageAvgInputOp").value;
    var covMedOp = template.find("#coverageMedInputOp").value;

    Session.set("regionInput", region);
    Session.set("length", length);
    Session.set("samples", samples);
    Session.set("covSum", covSum);
    Session.set("covAvg", covAvg);
    Session.set("covMed", covMed);
    Session.set("lengthOp", lengthOp);
    Session.set("samplesOp", samplesOp);
    Session.set("covSumOp", covSumOp);
    Session.set("covAvgOp", covAvgOp);
    Session.set("covMedOp", covMedOp);

    var query = newQuery(region);
    setQueryLength(query, lengthOp, length);
    setQuerySamplesCount(query, samplesOp, samples);
    setQueryCoverageAvg(query, covAvgOp, covAvg);
    setQueryCoverageMedian(query, covMedOp, covMed);
    setQueryCoverageSum(query, covSumOp, covSum);

    if (region != undefined && region != null && region.trim() !== "") {
        Router.go('/query/' + getQueryString(query));
    }
}