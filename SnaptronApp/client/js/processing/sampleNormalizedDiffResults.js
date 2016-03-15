/**
 * Created by Phani on 3/13/2016.
 */

const HIST_WIDTH  = 320;
const HIST_HEIGHT = 280;
const PADDING     = 25;

Template.sampleNormalizedDiffResults.created = function () {
    this.selectedBin = new ReactiveVar(null);
};

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
        if (Template.instance().selectedBin.get() == null) {
            return "<i>Hover over a bar for information</i><br>";
        } else {
            var selectedBin = Template.instance().selectedBin.get();
            return "<strong>Range: </strong>[" + selectedBin[SnapApp.Processors.SND.RESULT_HIST_START].toFixed(2)
                + ", " + selectedBin[SnapApp.Processors.SND.RESULT_HIST_END].toFixed(2) + ")<br>"
                + "<strong>Count: </strong>" + selectedBin[SnapApp.Processors.SND.RESULT_HIST_COUNT];
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
        .range([PADDING, HIST_WIDTH - PADDING * 2]);
    var y        = d3.scale.linear()
        .domain([0, _.max(_.pluck(data, SnapApp.Processors.SND.RESULT_HIST_COUNT))])
        .range([HIST_HEIGHT - PADDING, PADDING]);

    var svg = d3.select("#hist" + template.data._id)
        .attr("preserveAspectRatio", "xMinYMin meet")
        .attr("viewBox", "0 0 " + HIST_WIDTH + " " + HIST_HEIGHT)
        .classed("svg-content-responsive", true);

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
                HIST_HEIGHT - PADDING - y(obj[SnapApp.Processors.SND.RESULT_HIST_COUNT]));
        })
        .attr("fill", "steelblue")
        .attr("stroke", "black")
        .attr("stroke-width", 1)
        .on("mouseover", function (obj) {
            template.selectedBin.set(obj);
        })
        .on("mouseout", function () {
            template.selectedBin.set(null);
        });

    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom");
    var yAxis = d3.svg.axis()
        .scale(y)
        .orient("left");
    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(" + PADDING + ", " + (HIST_HEIGHT - PADDING) + ")")
        .call(xAxis);
    svg.append("g")
        .attr("class", "y axis")
        .attr("transform", "translate(" + PADDING * 2 + ", 0)")
        .call(yAxis);
}