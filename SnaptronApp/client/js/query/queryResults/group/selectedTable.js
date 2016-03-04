/**
 * Created by Phani on 3/4/2016.
 */

Template.selectedTable.helpers({
    "junctionTableCollection": function () {
        SnapApp.selectedJnctIDsDep.depend();
        return getJunctions(SnapApp.selectedJnctIDs);
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
            "rowsPerPage": 3
        };
    }
});

function formatHeaderText(str) {
    return str.toUpperCase().replace(/_/g, " ").trim();
}