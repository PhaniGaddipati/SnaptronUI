/**
 * Created by Phani on 5/23/2016.
 */

var loadingURLs = new ReactiveVar(true);
var ucscURLs    = new ReactiveVar([]);

Template.ucscModal.onRendered(function () {
    loadingURLs.set(true);
    var region = this.data.region;
    var urls   = Meteor.call("getUCSCBrowserURLs", region, function (err, urls) {
        loadingURLs.set(false);
        ucscURLs.set(urls);
    });
});

Template.ucscModal.helpers({
    "loadingURLs": function () {
        return loadingURLs.get();
    },
    "urls": function () {
        return ucscURLs.get();
    }
});