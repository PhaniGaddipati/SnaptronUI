/**
 * Created by Phani on 2/14/2016.
 */
Router.plugin('dataNotFound', {notFoundTemplate: 'error'});
Router.route('/', function () {
    this.render('home');
});
Router.route('/about');
Router.route('/usage');
Router.route('/query/:queryStr', {
    loadingTemplate: 'loadingQuery',
    waitOn: function () {
        return [Meteor.subscribe('queries', this.params.queryStr),
            Meteor.subscribe('junctions', this.params.queryStr)];
    },
    data: function () {
        return Queries.findOne();
    },
    action: function () {
        this.render('queryResults');
    }
});