/**
 * Created by Phani on 2/14/2016.
 */
Router.route('/', function () {
    this.render('home');
});
Router.route('/about');
Router.route('/usage');
Router.route('/query/:queryStr', {
    loadingTemplate: 'loadingQuery',
    waitOn: function () {
        return Meteor.subscribe('junctions', this.params.queryStr);
    },
    action: function () {
        //this.render('template');
    }
});