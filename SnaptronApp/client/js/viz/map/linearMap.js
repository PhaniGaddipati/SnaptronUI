/**
 * Created by Phani on 2/14/2016.
 */
var linearMapXScale;
var linearMapXAxis;
var zoom = null;
var linearMapSelectedJunction = null;

var colorByScale;
var colorByKey = null;

Session.setDefault("numCurrentlyVisible", 0);

Template.linearMap.events({
    "click .resetView": function (event, template) {
        if (zoom != null) {
            zoom.scale(1);
            zoom.translate([0, 0]);
            onZoom();
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
        colorByScale = updateColorScale(colorByKey, colorLog, getVisibleJunctions());
        d3.select(".junctionmap").selectAll(".jnct").remove();
        updateJunctions();
    }
});

Template.linearMap.helpers({
    "currentlyVisible": function () {
        return Session.get("numCurrentlyVisible") + " Junctions Currently Visible";
    }
});

Template.linearMap.onRendered(function () {
    colorByKey = null;
    updateMap();
    updateControls();
});

function updateControls() {
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

function updateMap() {
    var junctions = Junctions.find().fetch();
    var _limits = getLimits(junctions);
    var start = _limits.start;
    var stop = _limits.stop;
    linearMapXScale = d3.scale.linear().range([0, SnapApp.Map.VIEWBOX_W])
        .domain([start, stop]);

    zoom = d3.behavior.zoom()
        .x(linearMapXScale)
        .scaleExtent([1, Infinity])
        .on("zoom", onZoom);

    var svg = d3.select(".svg-container").classed("svg-container", true)
        .selectAll('svg').data([0])
        .enter().append("svg")
        .attr("class", "junctionmap")
        .attr("preserveAspectRatio", "xMinYMin meet")
        .attr("viewBox", "0 0 " + SnapApp.Map.VIEWBOX_W + " " + SnapApp.Map.VIEWBOX_H)
        .classed("svg-content-responsive", true)
        .on("mouseout", removeMouseMarker)
        .on("mousemove", updateMouseMarker)
        .call(zoom);

    updateFrame();
    updateJunctions();
}

function getVisibleJunctions() {
    var leftLim = linearMapXScale.invert(0);
    var rightLim = linearMapXScale.invert(SnapApp.Map.VIEWBOX_W);
    var minLength = linearMapXScale.invert(SnapApp.Map.MIN_DISPLAY_LENGTH_PX) - leftLim;
    var visibleJunctions = Junctions.find({
        start: {"$gte": leftLim},
        end: {"$lte": rightLim},
        length: {"$gte": minLength}
    }).fetch();
    return visibleJunctions;
}

function updateJunctions() {
    var visibleJunctions = getVisibleJunctions();
    var selection = d3.select(".junctionmap").selectAll(".jnct")
        .data(visibleJunctions, getKeyForJunction);
    // Update
    selection.attr("d", junctionPath);
    // Add newly visisble
    selection.enter()
        .append("path")
        .attr("class", "jnct")
        .attr("stroke", getJunctionColor)
        .attr("fill", "none")
        .attr("stroke-width", SnapApp.Map.JNCT_NORMAL_WIDTH)
        .attr("pointer-events", "visiblePainted")
        .attr("d", junctionPath)
        .on("click", onJunctionMouseClick)
        .on("mouseover", onJunctionMouseOver);
    // Remove no longer visible
    selection.exit().remove();
    Session.set("numCurrentlyVisible", visibleJunctions.length);
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
function onZoom() {
    d3.select(".xaxis").call(linearMapXAxis);
    updateJunctions();
    updateFrame();
}


function getKeyForJunction(jnct) {
    if (jnct == null) {
        return "";
    }
    return jnct._id;
}

function onJunctionMouseOver(jnct) {
    d3.selectAll(".jnct")
        .attr("stroke-width", SnapApp.Map.JNCT_NORMAL_WIDTH)
        .attr("stroke", getJunctionColor)
        .data([jnct], getKeyForJunction)
        .attr("stroke-width", SnapApp.Map.JNCT_HIGHLIGHTED_WIDTH)
        .attr("stroke", SnapApp.Map.JNCT_HIGHLIGHT_COLOR);
    d3.selectAll(".jnct")
        .data([linearMapSelectedJunction], getKeyForJunction)
        .attr("stroke", SnapApp.Map.JNCT_SELECTED_COLOR)
        .attr("stroke-width", SnapApp.Map.JNCT_SELECTED_WIDTH);
}
function onJunctionMouseClick(jnct) {
    linearMapSelectedJunction = jnct;
    onJunctionMouseOver(jnct);
}

function getJunctionColor(jnct) {
    if (colorByKey == null) {
        return SnapApp.Map.JNCT_NORMAL_COLOR;
    }
    if (JNCT_COL_TYPES[colorByKey] === "bool") {
        return jnct[colorByKey] ? SnapApp.Map.JNCT_BOOL_TRUE_COLOR
            : SnapApp.Map.JNCT_NORMAL_COLOR;
    }
    return colorByScale(jnct[colorByKey]);
}

addMouseMarker = function () {
    var marker = d3.select("g.mousemarker");
    if (marker.empty()) {
        marker = d3.select(".junctionmap").append("g").attr("class", "mousemarker");
        // Marker line
        marker.append("line")
            .attr("class", "markerline")
            .attr("x1", 0)
            .attr("y1", 0)
            .attr("x2", 0)
            .attr("y2", SnapApp.Map.VIEWBOX_H)
            .attr("style", SnapApp.Map.MARKER_LINE_STYLE)
            .attr("pointer-events", "none");
        var label = marker.append("g").attr("class", "markerlabel").attr("transform", "translate(0,0)");
        //Label box and text
        label.append("rect")
            .attr("class", "markerlabelbox")
            .attr("x", 5)
            .attr("y", 0)
            .attr("rx", 5)
            .attr("ry", 5)
            .attr("width", 10)
            .attr("height", SnapApp.Map.MARKER_LABEL_HEIGHT)
            .attr("pointer-events", "none")
            .attr("style", SnapApp.Map.MARKER_LABEL_STYLE);
        label.append("text")
            .attr("class", "markerlabeltext")
            .attr("pointer-events", "none")
            .attr("x", 10)
            .attr("y", SnapApp.Map.MARKER_LABEL_HEIGHT / 2 + 5);
    }
};

removeMouseMarker = function () {
    d3.selectAll("g.mousemarker").remove();
};

updateMouseMarker = function () {
    addMouseMarker();
    var coords = d3.mouse(this);
    coords[0] = Math.max(coords[0], 0);
    coords[0] = Math.min(coords[0], SnapApp.Map.VIEWBOX_W);
    var marker = d3.select("g.mousemarker");
    marker.attr("transform", "translate(" + coords[0] + ",0)");
    var markerLabel = marker.select(".markerlabel");
    var label = markerLabel.select(".markerlabelbox");
    var text = markerLabel.select(".markerlabeltext");
    text.text(function () {
        return numberWithCommas(parseInt(linearMapXScale.invert(coords[0])));
    });

    var w = text.node().getBBox().width;
    var xOffset = -10 - w / 2;
    if (coords[0] - w - 50 <= 0) {
        //Goes offscreen, go to other side of line
        xOffset = 0;
    } else if (coords[0] + w + 50 >= SnapApp.Map.VIEWBOX_W) {
        xOffset -= w / 2 + 10;
    }
    markerLabel.transition().attr("transform", "translate (" + xOffset + ",0)");
    label.attr("width", w + 10);
};