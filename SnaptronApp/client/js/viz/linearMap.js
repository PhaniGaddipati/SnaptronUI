/**
 * Created by Phani on 2/14/2016.
 */

const HEIGHT_MULTIPLIER = .4;
const BACKGROUND_COLOR = "#FFFFFF";
const MARKER_LABEL_STYLE = "fill:#EEEEEE;stroke:black;stroke-width:1";
const MARKER_LINE_STYLE = "stroke:#DDDDDD;stroke-width:1";

const PADDING = 25;
const AXIS_K_CUTOFF = 10000;
const MARKER_LABEL_HEIGHT = 25;

var xScale;

Template.linearMap.onRendered(function () {
    d3.select(window).on('resize', updateMap);
    initMap();
    updateMap();
});

function initMap() {
    var svg = d3.select("#linearMapSVG");
    initFrame(svg);
}

function updateMap() {
    var svg = d3.select("#linearMapSVG");
    // Set viewbox and have the svg fill the container (width)
    svg.attr("width", "100%");
    var width = svg.node().getBoundingClientRect().width;
    var height = width * HEIGHT_MULTIPLIER;
    svg.attr("viewBox 0 0 " + width + " " + height);
    svg.attr("height", height);

    var junctions = Junctions.find().fetch();
    var numJncts = junctions.length;

    var _limits = getLimits(junctions);
    var start = _limits.start;
    var stop = _limits.stop;

    updateFrame(svg, width, height, start, stop);
}

function initFrame(svg) {
    svg.append("rect").attr("class", "background");
    svg.append("g").attr("class", "xaxis")
        .attr("transform", "translate(0,0)");
    svg.on("mouseout", removeMouseMarker)
        .on("mousemove", updateMouseMarker);
}

function updateFrame(svg, width, height, start, stop) {
    svg.select("background").attr("x", 0).attr("y", 0).attr("width", width)
        .attr("height", height).attr("fill", BACKGROUND_COLOR);

    //Draw axis
    xScale = d3.scale.linear().range([PADDING, width - PADDING])
        .domain([start, stop]);
    var numTicks = parseInt(width / 120);
    var step = (stop - start) / (numTicks - 1);
    var tickValues = [start];
    for (var i = 0; i < numTicks - 1; i++) {
        tickValues.push(start + i * step);
    }
    tickValues.push(stop);
    var xAxis = d3.svg.axis()
        .orient("bottom")
        .scale(xScale)
        .tickValues(tickValues)
        .tickFormat(function (d) {
            if (d > AXIS_K_CUTOFF) {
                return parseInt(d / 1000) + "k";
            }
            return d;
        });
    svg.transition()
        .select("g.xaxis")
        .attr("transform", "translate(0," + (height - PADDING) + ")")
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
    return {start: start, stop: stop};
}

function addMouseMarker() {
    var svg = d3.select("#linearMapSVG");
    var marker = svg.select("g.mousemarker");
    if (marker.empty()) {
        marker = svg.append("g").attr("class", "mousemarker");
        // Marker line
        marker.append("line")
            .attr("class", "markerline")
            .attr("x1", 0)
            .attr("y1", PADDING)
            .attr("x2", 0)
            .attr("y2", svg.node().getBoundingClientRect().height - PADDING)
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
            .attr("y", MARKER_LABEL_HEIGHT / 2 + 5)
            .attr("text", "TEST");
    }
}

function removeMouseMarker() {
    var svg = d3.select("#linearMapSVG");
    svg.selectAll("g.mousemarker").remove();
}

function updateMouseMarker() {
    addMouseMarker();
    var svg = d3.select("#linearMapSVG");
    var coords = d3.mouse(this);
    coords[0] = Math.max(coords[0], PADDING);
    coords[0] = Math.min(coords[0], svg.node().getBoundingClientRect().width - PADDING);
    var marker = svg.select("g.mousemarker");
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
    } else if (coords[0] + w + 50 >= svg.node().getBBox().width) {
        xOffset -= w / 2 + 10;
    }
    markerLabel.transition().attr("transform", "translate (" + xOffset + ",0)");
    label.attr("width", w + 10);
}