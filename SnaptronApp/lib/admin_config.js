/**
 * Created by Phani on 3/31/2016.
 */
AdminConfig = {
    adminEmails: ['phanigaddipati@gmail.com'],
    collections: {
        Queries: {
            tableColumns: [
                {
                    name: "_id",
                    label: "ID"
                },
                {
                    name: "name",
                    label: "Name"
                },
                {
                    name: "regions",
                    label: "Regions"
                },
                {
                    name: "createdDate",
                    label: "Created Date"
                }
            ]
        },
        Regions: {
            omitFields: ['junctions'],
            tableColumns: [
                {
                    name: "_id",
                    label: "ID"
                },
                {
                    name: "loadedDate",
                    label: "Loaded Date"
                }
            ]
        }
    },
    skin: 'red'
};

Meteor.startup(function () {
    AdminDashboard.addSidebarItem('Clear Snaptron Data', AdminDashboard.path('/resetData'), {icon: 'trash'});
});