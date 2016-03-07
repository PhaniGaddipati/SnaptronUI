/**
 * Created by Phani on 3/1/2016.
 */

SnapApp = {};

SnapApp.ENTER_KEY_CODE = 13;

if (Meteor.isClient) {
    SnapApp.selectedJnctIDs = [];
    //This is the recommended way from Meteor docs
    //noinspection JSClosureCompilerSyntax
    SnapApp.selectedJnctIDsDep = new Tracker.Dependency;
}