/**
 * Created by Phani on 2/25/2016.
 */

const MAX_DATA_LEN = 16;

var numDisplayedJunctions = 10;
var tableColumns;
var selectedTableColumns;

Template.junctionTable.onRendered(function () {
    tableColumns = Object.keys(Junctions.findOne());
    selectedTableColumns = tableColumns;
    updateColumnSelectionDropdown();
    updateTable();
});

Template.junctionTable.events({
    "click #showSelect": function (event, template) {
        numDisplayedJunctions = parseInt(template.find("#showSelect").value);
        updateTable();
    },
    "click #rawTSVBtn": function (event, template) {
        Router.go(Router.current().url + "/dataTSV");
    }
});

function updateColumnSelectionDropdown() {
    d3.select("#selectColumnDropdown")
        .selectAll(".columnItem")
        .data(tableColumns)
        .enter()
        .append("div")
        .attr("class", "columnItem")
        .html(function (col) {
            var checked = selectedTableColumns.indexOf(col);
            if (checked != -1) {
                return "<input type=\"checkbox\" id=\"" + col + "\" checked/>&nbsp;&nbsp;" + formatHeaderText(col);
            }
            return "<input type=\"checkbox\" id=\"" + col + "\"/>&nbsp;&nbsp;" + formatHeaderText(col);
        });
    d3.select("#selectColumnDropdown")
        .selectAll("input")
        .on("click", function (evt) {
            var col = this.id;
            var selectedIndex = selectedTableColumns.indexOf(col);
            if (this.checked && -1 == selectedIndex) {
                selectedTableColumns.push(col);
            }
            if (!this.checked && selectedIndex > -1) {
                selectedTableColumns.splice(selectedIndex, 1);
            }
            updateTable();
        })
}

function updateTable() {
    var junctions = Junctions.find({}, {limit: numDisplayedJunctions}).fetch();
    if (junctions.length == 0) {
        return;
    }
    // Header row
    var header = d3.select("#junctionTableHeaderRow")
        .selectAll("th")
        .data(selectedTableColumns, function (d) {
            return d;
        });
    header.enter()
        .append("th")
        .attr("class", "text-center")
        .text(function (d) {
            return formatHeaderText(d);
        });
    header.exit().remove();

    // Content
    var rows = d3.select("#junctionTableBody")
        .selectAll("tr")
        .data(junctions, function (j) {
            return j["_id"];
        });
    rows.enter()
        .append("tr");
    rows.exit().remove();
    var cells = rows.selectAll("td")
        .data(function (row) {
            return selectedTableColumns.map(function (column) {
                return {col: column, val: row[column]};
            })
        }, function (cell) {
            return cell.col;
        });
    cells.enter()
        .append("td")
        .text(function (cell) {
            var str = cell.val;
            if (str.length > 16) {
                str = str.substring(0, 13) + "...";
            }
            return str;
        });
    cells.exit().remove();
}

function formatHeaderText(str) {
    return str.toUpperCase().replace(/_/g, " ").trim();
}