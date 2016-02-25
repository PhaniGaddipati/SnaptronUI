/**
 * Created by Phani on 2/25/2016.
 */

const MAX_DATA_LEN = 16;

Template.junctionTable.onRendered(function () {
    updateTable();
});

function updateTable() {
    var junctions = Junctions.find().fetch();
    if (junctions.length == 0) {
        return;
    }
    var columns = Object.keys(junctions[0]);
    // Header row
    d3.select("#junctionTableHeaderRow")
        .selectAll("th")
        .data(columns)
        .enter()
        .append("th")
        .attr("class", "text-center")
        .text(function (d) {
            return formatHeaderText(d);
        });

    // Content
    var rows = d3.select("#junctionTableBody")
        .selectAll("tr")
        .data(junctions)
        .enter()
        .append("tr");
    var cells = rows.selectAll("td")
        .data(function (row) {
            return columns.map(function (column) {
                return row[column];
            })
        })
        .enter()
        .append("td")
        .text(function (d) {
            var str = d;
            if (str.length > 16) {
                str = str.substring(0, 13) + "...";
            }
            return str;
        });
}

function formatHeaderText(str) {
    return str.toUpperCase().replace(/_/g, " ").trim();
}