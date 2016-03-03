/**
 * Created by Phani on 2/25/2016.
 */

Template.junctionTable.helpers({
    "junctionTableCollection": function () {
        return Junctions;
    },
    "tableSettings": function () {
        //Generate neat headers
        var tableColumns = Object.keys(Junctions.findOne());
        var fields = [];
        for (var i = 0; i < tableColumns.length; i++) {
            fields.push({
                key: tableColumns[i],
                label: formatHeaderText(tableColumns[i]),
                hidden: (SnapApp.Table.DEFAULT_ENABLED_COLS.indexOf(tableColumns[i]) == -1)
            });
        }

        return {
            "showColumnToggles": true,
            "fields": fields,
            "showFilter": false,
            "rowsPerPage": 15,
            "rowClass": getRowClass
        };
    }
});

Template.junctionTable.events({
    "click #rawTSVBtn": function (event, template) {
        Router.go(Router.current().url + "/dataTSV");
    }
});

function getRowClass(jnct) {
    SnapApp.selectedJnctIDsDep.depend();
    if (SnapApp.selectedJnctIDs.indexOf(jnct["_id"]) > -1) {
        return SnapApp.Table.ROW_SELECTED_CLASS;
    }
    return SnapApp.Table.ROW_NORMAL_CLASS;
}

function formatHeaderText(str) {
    return str.toUpperCase().replace(/_/g, " ").trim();
}