Meteor.queriesDB = new Mongo.Collection("queries");

if (Meteor.isClient) {
    Meteor.startup(function () {

    });
}

if (Meteor.isServer) {
    Meteor.startup(function () {
    });
}
