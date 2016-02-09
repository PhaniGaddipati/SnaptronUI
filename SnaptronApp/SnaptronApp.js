Meteor.queriesDB = new Mongo.Collection("queries");

if (Meteor.isClient) {
    Template.test.events({
        'click button': function () {
            Meteor.call("getIdForQuery", "chr6:1-1000000|samples_count=5|");
        }
    });
}

if (Meteor.isServer) {
    Meteor.startup(function () {
    });
}
