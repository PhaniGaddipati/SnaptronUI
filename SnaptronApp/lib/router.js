/**
 * Created by Phani on 2/14/2016.
 */
Router.plugin('dataNotFound', {notFoundTemplate: 'error'});
Router.route('/', function () {
    this.render('home');
});
Router.route('/about');
Router.route('/usage');
Router.route('/account', {
    waitOn: function () {
        return [Meteor.subscribe('userQueriesAndRegions'),
            Meteor.subscribe('userData')];
    },
    action: function () {
        this.render('accountPage');
    }
});
Router.route('/query/:queryId', {
    loadingTemplate: 'loadingQuery',
    waitOn: function () {
        var queryId = this.params["queryId"];
        return [Meteor.subscribe('queries', queryId),
            Meteor.subscribe('queryRegionsNoJncts', queryId),
            Meteor.subscribe('queryJunctionsNoSamps', queryId),
            Meteor.subscribe('userData')];
    },
    data: function () {
        return Queries.findOne();
    },
    action: function () {
        this.render('queryResults');
    }
});

Router.route('/query/:queryId/dataTSV', {
    loadingTemplate: 'loadingQuery',
    waitOn: function () {
        return Meteor.subscribe('queryJunctions', this.params['queryId']);
    },
    data: function () {
        return Junctions.findOne();
    },
    action: function () {
        this.render('rawData');
    }
});