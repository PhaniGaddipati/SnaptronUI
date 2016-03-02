/**
 * Created by Phani on 2/14/2016.
 */
var linearMapXScale;
var linearMapXAxis;
var zoom = null;
var highlightedJnctID = new ReactiveVar(null, jnctsEqual);
var selectedJnctIDs = Session.get("selectedJnctIDs");
var selectedJnctsDep = new Tracker.Dependency;

var colorByScale = new ReactiveVar();
var colorByKey = null;

var markerX = new ReactiveVar(-1);
var visibleJunctions = new ReactiveVar([]);

Template.linearMap.events({
    "click .resetView": function () {
        if (zoom != null) {
            zoom.scale(1);
            zoom.translate([0, 0]);
            updateFrame();
        }
    },
    "click #colorBySelect": function (event, template) {
        var selected = template.find("#colorBySelect").value;
        var colorLog;
        if (selected === "None") {
            colorByKey = null;
        } else if (selected.startsWith("log(")) {
            colorLog = true;
            colorByKey = selected.replace("log(", "").replace(")", "");
        }
        else {
            colorLog = false;
            colorByKey = selected;
        }
        colorByScale.set(updateColorScale(colorByKey, colorLog, visibleJunctions.get()));
        //Force redraw
        d3.select(".junctionmap").selectAll(".jnct").remove();
        updateJunctions();
    }
});

Template.linearMap.helpers({
    "currentlyVisible": function () {
        return visibleJunctions.get().length + " Junctions Currently Visible";
    }
});

Template.linearMap.onRendered(function () {
    colorByKey = null;
    initControls();
    initMap();
    updateFrame();
    Tracker.autorun(updateMarker);
    Tracker.autorun(updateVisibleJunctions);
    Tracker.autorun(updateJunctions);
});

function initControls() {
    // Update color-by option
    var numKeys = getJunctionNumberKeys();
    var options = ["None"].concat(getJunctionBoolKeys().concat(numKeys));
    //Add log options
    var logKeys = [];
    for (var i = 0; i < numKeys.length; i++) {
        logKeys.push("log(" + numKeys[i] + ")");
    }
    options = options.concat(logKeys);

    var selection = d3.select("#colorBySelect")
        .selectAll("option")
        .data(options, function (opt) {
            return opt;
        });
    selection.exit().remove();
    selection.enter()
        .append("option")
        .text(function (d) {
            return d;
        });
}

function initMap() {
    var junctions = Junctions.find().fetch();
    var _limits = getLimits(junctions);
    var start = _limits.start;
    var stop = _limits.stop;
    linearMapXScale = d3.scale.linear().range([0, SnapApp.Map.VIEWBOX_W])
        .domain([start, stop]);

    zoom = d3.behavior.zoom()
        .x(linearMapXScale)
        .scaleExtent([1, Infinity])
        .on("zoom", updateFrame);

    var svg = d3.select(".svg-container").classed("svg-container", true)
        .selectAll('svg').data([0])
        .enter().append("svg")
        .attr("class", "junctionmap")
        .attr("preserveAspectRatio", "xMinYMin meet")
        .attr("viewBox", "0 0 " + SnapApp.Map.VIEWBOX_W + " " + SnapApp.Map.VIEWBOX_H)
        .classed("svg-content-responsive", true)
        .on("mouseout", function () {
            markerX.set(-1)
        })
        .on("mousemove", function () {
            markerX.set(d3.mouse(this)[0]);
        })
        .call(zoom);
}

function updateVisibleJunctions() {
    var leftLim = linearMapXScale.invert(0);
    var rightLim = linearMapXScale.invert(SnapApp.Map.VIEWBOX_W);
    var minLength = linearMapXScale.invert(SnapApp.Map.MIN_DISPLAY_LENGTH_PX) - leftLim;
    visibleJunctions.set(Junctions.find({
        start: {"$gte": leftLim},
        end: {"$lte": rightLim},
        length: {"$gte": minLength}
    }).fetch());
}

function updateJunctions() {
    var selection = d3.select(".junctionmap").selectAll(".jnct")
        .data(visibleJunctions.get(), getKeyForJunction);
    // Update
    selection.attr("d", junctionPath);
    // Add newly visisble
    selection.enter()
        .append("path")
        .attr("class", "jnct")
        .attr("fill", "none")
        .attr("pointer-events", "visiblePainted")
        .attr("d", junctionPath)
        .on("click", onJunctionMouseClick)
        .on("mouseover", onJunctionMouseOver)
        .on("mouseout", onJunctionMouseOut);
    selection.attr("stroke", getJunctionColor)
        .attr("stroke-width", getJunctionWidth);
    // Remove no longer visible
    selection.exit().remove();
}

function junctionPath(jnct) {
    var endpointY = (SnapApp.Map.VIEWBOX_H) / 2;
    var startX = parseInt(linearMapXScale(jnct.start));
    var endX = parseInt(linearMapXScale(jnct.end));
    var range = endX - startX;
    var cPoint1X = parseInt(startX + 2 * range / 6);
    var cPoint2X = parseInt(startX + 4 * range / 6);
    var annotatedMod = jnct[JNCT_ANNOTATED_KEY] ? -1 : 1;
    var cPointY = (SnapApp.Map.VIEWBOX_H ) / 2 -
        annotatedMod * parseInt((SnapApp.Map.VIEWBOX_H / 2)
            * (parseFloat(range) / (SnapApp.Map.VIEWBOX_W / 3)));
    endpointY -= annotatedMod * SnapApp.Map.MID_AXIS_Y_OFF / 2;
    cPointY = Math.max(0, cPointY);
    cPointY = Math.min(SnapApp.Map.VIEWBOX_H, cPointY);
    return "M" + startX + " " + endpointY + " C " + cPoint1X + " "
        + cPointY + " " + cPoint2X + " " + cPointY + " " + endX + " " + endpointY;
}

function updateFrame() {
    var svg = d3.select(".junctionmap");
    //Draw axis
    var numTicks = parseInt(SnapApp.Map.VIEWBOX_W / 120);
    var leftLim = linearMapXScale.invert(35);
    var rightLim = linearMapXScale.invert(SnapApp.Map.VIEWBOX_W - 35);
    var step = (rightLim - leftLim) / (numTicks);
    var tickValues = [];
    for (var i = 0; i <= numTicks; i++) {
        tickValues.push(parseInt(leftLim + i * step));
    }
    linearMapXAxis = d3.svg.axis()
        .orient("bottom")
        .scale(linearMapXScale)
        .tickValues(tickValues)
        .tickFormat(function (d) {
            if (Math.abs(d) > SnapApp.Map.AXIS_K_CUTOFF) {
                return parseInt(d / 1000) + "k";
            }
            return d;
        });
    svg.selectAll("g.xaxis").data([0])
        .enter().append("g")
        .attr("class", "xaxis")
        .attr("transform", "translate(0," + (SnapApp.Map.VIEWBOX_H - 25) + ")")
        .call(linearMapXAxis);
    svg.selectAll("#midAxisLine").data([0])
        .enter().append("rect")
        .attr("id", "midAxisLine")
        .attr("transform", "translate(0,0)")
        .attr("x", 0).attr("y", SnapApp.Map.VIEWBOX_H / 2
            - SnapApp.Map.MID_AXIS_Y_OFF / 2)
        .attr("width", SnapApp.Map.VIEWBOX_W)
        .attr("height", SnapApp.Map.MID_AXIS_Y_OFF).attr("fill", "#000000");
    updateVisibleJunctions();
}

function getLimits(junctions) {
    var start = 9007199254740990;
    var stop = -1;
    for (var i = 0; i < junctions.length; i++) {
        if (junctions[i].start < start) {
            start = junctions[i].start;
        }
        if (junctions[i].end > stop) {
            stop = junctions[i].end;
        }
    }
    if (stop == -1) {
        start = 0;
        stop = 1;
    }
    return {start: start, stop: stop};
}

function getKeyForJunction(jnct) {
    if (jnct == null) {
        return "";
    }
    return jnct._id;
}

function onJunctionMouseOver(jnct) {
    highlightedJnctID.set(jnct["_id"]);
}
function onJunctionMouseOut() {
    highlightedJnctID.set(null);
}

function onJunctionMouseClick(jnct) {
    var index = selectedJnctIDs.indexOf(jnct["_id"]);
    if (index > -1) {
        selectedJnctIDs.splice(index, 1);
    } else {
        selectedJnctIDs.push(jnct["_id"]);
    }
    Session.set("selectedJnctIDs", selectedJnctIDs);
    selectedJnctsDep.changed();
}

function getJunctionColor(jnct) {
    selectedJnctsDep.depend();
    if (selectedJnctIDs.indexOf(jnct["_id"]) > -1) {
        return SnapApp.Map.JNCT_SELECTED_COLOR;
    }
    if (highlightedJnctID.get() == jnct["_id"]) {
        return SnapApp.Map.JNCT_HIGHLIGHT_COLOR;
    }
    if (colorByKey == null) {
        return SnapApp.Map.JNCT_NORMAL_COLOR;
    }
    if (JNCT_COL_TYPES[colorByKey] === "bool") {
        return jnct[colorByKey] ? SnapApp.Map.JNCT_BOOL_TRUE_COLOR
            : SnapApp.Map.JNCT_NORMAL_COLOR;
    }
    return colorByScale.get()(jnct[colorByKey]);
}

function getJunctionWidth(jnct) {
    selectedJnctsDep.depend();
    if (selectedJnctIDs.indexOf(jnct["_id"]) > -1) {
        return SnapApp.Map.JNCT_SELECTED_WIDTH;
    }
    if (highlightedJnctID.get() == jnct["_id"]) {
        return SnapApp.Map.JNCT_HIGHLIGHTED_WIDTH;
    }
    return SnapApp.Map.JNCT_NORMAL_WIDTH;
}

function updateMarker() {
    var markerG = d3.select(".junctionmap")
        .selectAll("#mousemarker").data([0]);
    markerG.enter().append("g")
        .attr("id", "mousemarker");
    markerG.attr("visibility", function () {
        if (markerX.get() == -1) {
            return "hidden";
        }
        return "visible";
    });
    // Marker line
    var markerLine = markerG.selectAll("#markerline")
        .data([0]).enter()
        .append("line")
        .attr("id", "markerline")
        .attr("x1", 0)
        .attr("y1", 0)
        .attr("x2", 0)
        .attr("y2", SnapApp.Map.VIEWBOX_H)
        .attr("style", SnapApp.Map.MARKER_LINE_STYLE)
        .attr("pointer-events", "none");
    var label = markerG.selectAll("#markerlabel").data([0]);
    label.enter()
        .append("g").attr("id", "markerlabel").attr("transform", "translate(0,0)");
    //Label box and text
    var labelbox = label.selectAll("#markerlabelbox").data([0])
    labelbox.enter()
        .append("rect")
        .attr("id", "markerlabelbox")
        .attr("x", 5)
        .attr("y", 0)
        .attr("rx", 5)
        .attr("ry", 5)
        .attr("width", 10)
        .attr("height", SnapApp.Map.MARKER_LABEL_HEIGHT)
        .attr("pointer-events", "none")
        .attr("style", SnapApp.Map.MARKER_LABEL_STYLE);
    var text = label.selectAll("#markerlabeltext").data([0]);
    text.enter().append("text")
        .attr("id", "markerlabeltext")
        .attr("pointer-events", "none")
        .attr("x", 10)
        .attr("y", SnapApp.Map.MARKER_LABEL_HEIGHT / 2 + 5);

    markerG.attr("transform", "translate(" + markerX.get() + ",0)");
    text.text(function () {
        return numberWithCommas(parseInt(linearMapXScale.invert(markerX.get())));
    });
    var w = d3.select("#markerlabeltext").node().getBBox().width;
    var xOffset = -10 - w / 2;
    if (markerX.get() - w - 50 <= 0) {
        //Goes offscreen, go to other side of line
        xOffset = 0;
    } else if (markerX.get() + w + 50 >= SnapApp.Map.VIEWBOX_W) {
        xOffset -= w / 2 + 10;
    }
    label.attr("transform", "translate (" + xOffset + ",0)");
    labelbox.attr("width", w + 10);
}

function jnctsEqual(v1, v2) {
    if ((v1 == null && v2 != null) || (v2 == null && v1 != null)) {
        return false;
    }
    if (v1 == null && v2 == null) {
        return true;
    }
    return v1["_id"] == v2["_id"];
}