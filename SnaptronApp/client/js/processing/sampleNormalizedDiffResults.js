/**
 * Created by Phani on 3/13/2016.
 */

const HIST_WIDTH  = 300;
const HIST_HEIGHT = 300;
const PADDING     = 15;

var selectedBin = new ReactiveVar(null);

Template.sampleNormalizedDiffResults.onRendered(function () {
    updateHistogram(this);
});

Template.sampleNormalizedDiffResults.helpers({
    "paramsList": function () {
        return _.map(this[QRY_PROCESSOR_PARAMS], function (val, key) {
            return {
                "key": key,
                "val": val
            }
        });
    },
    "groupsList": function () {
        return _.map(this[QRY_PROCESSOR_INPUT_GROUPS], function (val, key) {
            var grp = SnapApp.QueryDB.getGroupFromQuery(Queries.findOne()._id, val);
            if (grp == null) {
                var name = "Not Found";
            } else {
                name = grp[QRY_GROUP_NAME];
            }
            return {
                "key": key,
                "val": name
            }
        });
    },
    "tableSettings": function () {
        return {
            "showColumnToggles": false,
            "showFilter": false,
            "rowsPerPage": 5,
            "fields": ["sample", "A", "B", "D"]
        };
    },
    "resultsArr": function () {
        return this[QRY_PROCESSOR_RESULTS][SnapApp.Processors.SND.RESULTS_TOP_K];
    },
    "isCurrentUsers": function () {
        return SnapApp.QueryDB.isQueryCurrentUsers(Queries.findOne()["_id"]);
    },
    "selectionText": function () {
        if (selectedBin.get() == null) {
            return "<i>Hover over a bar for information</i>";
        } else {
            return "<strong>Range: </strong>[" + selectedBin.get()[SnapApp.Processors.SND.RESULT_HIST_START].toFixed(2)
                + ", " + selectedBin.get()[SnapApp.Processors.SND.RESULT_HIST_END].toFixed(2) + ")<br>"
                + "<strong>Count: </strong>" + selectedBin.get()[SnapApp.Processors.SND.RESULT_HIST_COUNT];
        }
    }
});

Template.sampleNormalizedDiffResults.events({
    "click #removeProcessor": function (evt) {
        evt.preventDefault();
        Meteor.call("removeProcessorFromQuery", Queries.findOne()._id, this._id);
    }
});

function updateHistogram(template) {
    var data     = template.data[QRY_PROCESSOR_RESULTS][SnapApp.Processors.SND.RESULTS_HIST];
    var numElems = data.length;
    var min      = data[0][SnapApp.Processors.SND.RESULT_HIST_START];
    var max      = data[numElems - 1][SnapApp.Processors.SND.RESULT_HIST_END];
    var x        = d3.scale.linear()
        .domain([min, max])
        .range([PADDING, HIST_WIDTH - PADDING]);
    var y        = d3.scale.linear()
        .domain([0, _.max(_.pluck(data, SnapApp.Processors.SND.RESULT_HIST_COUNT))])
        .range([HIST_HEIGHT - PADDING * 2, PADDING]);

    var svg = d3.select("#hist" + template.data._id)
        .attr("width", HIST_WIDTH + PADDING)
        .attr("height", HIST_HEIGHT);

    var bars = svg.selectAll(".bar").data(data);
    bars.enter()
        .append("g")
        .attr("class", "bar")
        .append("rect")
        .attr("x", function (obj) {
            return x(obj[SnapApp.Processors.SND.RESULT_HIST_START]) + PADDING;
        })
        .attr("y", function (obj) {
            return y(obj[SnapApp.Processors.SND.RESULT_HIST_COUNT]);
        })
        .attr("width", function (obj) {
            return x(obj[SnapApp.Processors.SND.RESULT_HIST_END])
                - x(obj[SnapApp.Processors.SND.RESULT_HIST_START]);
        })
        .attr("height", function (obj) {
            return Math.max(0,
                HIST_HEIGHT - PADDING * 2 - y(obj[SnapApp.Processors.SND.RESULT_HIST_COUNT]));
        })
        .attr("fill", "steelblue")
        .attr("stroke", "black")
        .attr("stroke-width", 1)
        .on("mouseover", onMouseOver);

    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom");
    var yAxis = d3.svg.axis()
        .scale(y)
        .orient("left");
    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(" + PADDING + ", " + (HIST_HEIGHT - PADDING * 2) + ")")
        .call(xAxis);
    svg.append("g")
        .attr("class", "y axis")
        .attr("transform", "translate(" + PADDING * 2 + ", 0)")
        .call(yAxis);
}

function onMouseOver(obj) {
    selectedBin.set(obj);
}