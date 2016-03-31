/**
 * Created by Phani on 3/31/2016.
 */
AdminConfig = {
    adminEmails: ['phanigaddipati@gmail.com'],
    collections: {
        Queries: {},
        Regions: {
            omitFields: ['junctions']
        }
    },
    skin: 'red-light'
};

Meteor.startup(function () {
    AdminDashboard.addSidebarItem('Clear Snaptron Data', AdminDashboard.path('/resetData'), {icon: 'trash'});
});