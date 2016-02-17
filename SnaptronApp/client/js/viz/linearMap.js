/**
 * Created by Phani on 2/14/2016.
 */

const HEIGHT_MULTIPLIER = .4;
const BACKGROUND_COLOR = "#FFFFFF";

const PADDING = 25;
const AXIS_K_CUTOFF = 10000;

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
    svg.append("g").attr("class", "xaxis");
}

function updateFrame(svg, width, height, start, stop) {
    /*svg.select("background").attr("x", 0).attr("y", 0).attr("width", width)
     .attr("height", height).attr("fill", BACKGROUND_COLOR);*/

    //Draw axis
    var x = d3.scale.linear().range([PADDING, width - PADDING])
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
        .scale(x)
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

function bboxText(svgDocument, string) {
    var data = svgDocument.createTextNode(string);

    var svgElement = svgDocument.createElementNS(svgns, "text");
    svgElement.appendChild(data);

    svgDocument.documentElement.appendChild(svgElement);

    var bbox = svgElement.getBBox();

    svgElement.parentNode.removeChild(svgElement);

    return bbox;
}