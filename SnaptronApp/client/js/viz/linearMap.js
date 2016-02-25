/**
 * Created by Phani on 2/14/2016.
 */

const VIEWBOX_WIDTH = 1000;
const VIEWBOX_HEIGHT = 250;

const BACKGROUND_COLOR = "#FFFFFF";
const MARKER_LABEL_STYLE = "fill:#EEEEEE;stroke:black;stroke-width:1";
const MARKER_LINE_STYLE = "stroke:#DDDDDD;stroke-width:1";

const JUNCTION_NORMAL_COLOR = "black";
const JUNCTION_HIGHLIGHT_COLOR = "orange";
const JUNCTION_SELECTED_COLOR = "red";
const JUNCTION_NORMAL_WIDTH = 2;
const JUNCTION_HIGHLIGHTED_WIDTH = 3;
const JUNCTION_SELECTED_WIDTH = 4;

const PADDING = 25;
const AXIS_K_CUTOFF = 10000;
const MARKER_LABEL_HEIGHT = 25;

var xScale;
var xAxis;
var zoom = null;
var selectedJunction = null;

Template.linearMap.events({
    "click .resetView": function (event, template) {
        if (zoom != null) {
            zoom.scale(1);
            zoom.translate([0, 0]);
            onZoom();
        }
    }
});

Template.linearMap.onRendered(function () {
    //d3.select(window).on('resize', updateMap);
    updateMap();
});

function updateMap() {
    var junctions = Junctions.find().fetch();
    var _limits = getLimits(junctions);
    var start = _limits.start;
    var stop = _limits.stop;
    xScale = d3.scale.linear().range([0, VIEWBOX_WIDTH])
        .domain([start, stop]);

    zoom = d3.behavior.zoom()
        .x(xScale)
        .scaleExtent([1, 100])
        .on("zoom", onZoom);

    var svg = d3.select(".svg-container").classed("svg-container", true)
        .selectAll('svg').data([0])
        .enter().append("svg")
        .attr("class", "junctionmap")
        .attr("preserveAspectRatio", "xMinYMin meet")
        .attr("viewBox", "0 0 " + VIEWBOX_WIDTH + " " + VIEWBOX_HEIGHT)
        .classed("svg-content-responsive", true)
        .on("mouseout", removeMouseMarker)
        .on("mousemove", updateMouseMarker)
        .call(zoom);

    updateFrame();
    updateJunctions();
}

function updateJunctions() {
    var leftLim = xScale.invert(PADDING);
    var rightLim = xScale.invert(VIEWBOX_WIDTH - PADDING);
    var junctions = Junctions.find({
        start: {"$gte": leftLim},
        end: {"$lte": rightLim}
    }).fetch();
    var selection = d3.select(".junctionmap").selectAll(".jnct")
        .data(junctions, getKeyForJunction);
    // Update
    selection.attr("d", junctionPath);
    // Add newly visisble
    selection.enter()
        .append("path")
        .attr("class", "jnct")
        .attr("stroke", JUNCTION_NORMAL_COLOR)
        .attr("fill", "none")
        .attr("stroke-width", JUNCTION_NORMAL_WIDTH)
        .attr("pointer-events", "visiblePainted")
        .attr("d", junctionPath)
        .on("click", onJunctionMouseClick)
        .on("mouseover", onJunctionMouseOver);
    // Remove no longer visible
    selection.exit().remove();

    //# jncts counter
    d3.select(".junctionmap").selectAll(".jnctCounter").data([0])
        .enter().append("text")
        .attr("class", "jnctCounter")
        .attr("x", 0)
        .attr("y", PADDING);
    d3.select(".junctionmap").select(".jnctCounter").text(function () {
        return junctions.length + " Currently Visible";
    });
}

function junctionPath(jnct) {
    var endpointY = VIEWBOX_HEIGHT - PADDING;
    var startX = parseInt(xScale(jnct.start));
    var endX = parseInt(xScale(jnct.end));
    var range = endX - startX;
    var cPoint1X = parseInt(startX + 2 * range / 6);
    var cPoint2X = parseInt(startX + 4 * range / 6);
    var cPointY = VIEWBOX_HEIGHT - PADDING - parseInt((VIEWBOX_HEIGHT - PADDING * 2) * (parseFloat(range) / (VIEWBOX_WIDTH / 3)));
    cPointY = Math.max(PADDING, cPointY);
    cPointY = Math.min(VIEWBOX_HEIGHT - PADDING - 15, cPointY);
    return "M" + startX + " " + endpointY + " C " + cPoint1X + " " + cPointY + " " + cPoint2X + " " + cPointY + " " + endX + " " + endpointY;
}

function updateFrame() {
    var svg = d3.select(".junctionmap");
    svg.selectAll(".backgroundRect").data([0])
        .enter()
        .append("rect")
        .attr("class", "backgroundRect")
        .attr("transform", "translate(0,0)")
        .attr("x", 0).attr("y", 0).attr("width", VIEWBOX_WIDTH)
        .attr("height", VIEWBOX_HEIGHT).attr("fill", BACKGROUND_COLOR);

    //Draw axis
    var numTicks = parseInt(VIEWBOX_WIDTH / 120);
    var leftLim = xScale.invert(PADDING);
    var rightLim = xScale.invert(VIEWBOX_WIDTH - PADDING);
    var step = (rightLim - leftLim) / (numTicks);
    var tickValues = [];
    for (var i = 0; i <= numTicks; i++) {
        tickValues.push(parseInt(leftLim + i * step));
    }
    xAxis = d3.svg.axis()
        .orient("bottom")
        .scale(xScale)
        .tickValues(tickValues)
        .tickFormat(function (d) {
            if (Math.abs(d) > AXIS_K_CUTOFF) {
                return parseInt(d / 1000) + "k";
            }
            return d;
        });
    svg.selectAll("g.xaxis").data([0])
        .enter().append("g")
        .attr("class", "xaxis")
        .attr("transform", "translate(0,0)")
        .attr("transform", "translate(0," + (VIEWBOX_HEIGHT - PADDING) + ")")
        .call(xAxis);
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
    d3.select(".xaxis").call(xAxis);
    updateJunctions();
    updateFrame();
}

function addMouseMarker() {
    var marker = d3.select("g.mousemarker");
    if (marker.empty()) {
        marker = d3.select(".junctionmap").append("g").attr("class", "mousemarker");
        // Marker line
        marker.append("line")
            .attr("class", "markerline")
            .attr("x1", 0)
            .attr("y1", PADDING)
            .attr("x2", 0)
            .attr("y2", VIEWBOX_HEIGHT - PADDING)
            .attr("style", MARKER_LINE_STYLE)
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
            .attr("height", MARKER_LABEL_HEIGHT)
            .attr("pointer-events", "none")
            .attr("style", MARKER_LABEL_STYLE);
        label.append("text")
            .attr("class", "markerlabeltext")
            .attr("pointer-events", "none")
            .attr("x", 10)
            .attr("y", MARKER_LABEL_HEIGHT / 2 + 5);
    }
}

function removeMouseMarker() {
    d3.selectAll("g.mousemarker").remove();
}

function updateMouseMarker() {
    addMouseMarker();
    var coords = d3.mouse(this);
    coords[0] = Math.max(coords[0], PADDING);
    coords[0] = Math.min(coords[0], VIEWBOX_WIDTH - PADDING);
    var marker = d3.select("g.mousemarker");
    marker.attr("transform", "translate(" + coords[0] + ",0)");
    var markerLabel = marker.select(".markerlabel");
    var label = markerLabel.select(".markerlabelbox");
    var text = markerLabel.select(".markerlabeltext");
    text.text(function () {
        return parseInt(xScale.invert(coords[0]));
    });

    var w = text.node().getBBox().width;
    var xOffset = -10 - w / 2;
    if (coords[0] - w - 50 <= 0) {
        //Goes offscreen, go to other side of line
        xOffset = 0;
    } else if (coords[0] + w + 50 >= VIEWBOX_WIDTH) {
        xOffset -= w / 2 + 10;
    }
    markerLabel.transition().attr("transform", "translate (" + xOffset + ",0)");
    label.attr("width", w + 10);
}

function getKeyForJunction(jnct) {
    if (jnct == null) {
        return "";
    }
    return jnct._id;
}

function onJunctionMouseOver(jnct) {
    d3.selectAll(".jnct")
        .attr("stroke-width", JUNCTION_NORMAL_WIDTH)
        .attr("stroke", JUNCTION_NORMAL_COLOR)
        .data([jnct], getKeyForJunction)
        .attr("stroke-width", JUNCTION_HIGHLIGHTED_WIDTH)
        .attr("stroke", JUNCTION_HIGHLIGHT_COLOR);
    d3.selectAll(".jnct")
        .data([selectedJunction], getKeyForJunction)
        .attr("stroke", JUNCTION_SELECTED_COLOR)
        .attr("stroke-width", JUNCTION_SELECTED_WIDTH);
}
function onJunctionMouseClick(jnct) {
    selectedJunction = jnct;
    onJunctionMouseOver(jnct);
}