/**
 * Created by Phani on 5/28/2016.
 */
Template.scatterplotPanel.onRendered(function () {
    var svg = d3.select("#scatterplotSVG")
        .attr("viewBox", "0 0 " + SnapApp.Scatter.VIEWBOX_W + " " + SnapApp.Scatter.VIEWBOX_H)
        .append("g")
        .attr("transform", "translate(" + SnapApp.Scatter.PADDING + "," + SnapApp.Scatter.PADDING + ")");

    var xScale = getXScale();
    var yScale = getYScale();
    var xAxis  = d3.svg.axis().scale(xScale).orient("bottom").tickFormat(formatNumber);
    var yAxis  = d3.svg.axis().scale(yScale).orient("left").tickFormat(formatNumber);

    setupAxis(svg, xAxis, yAxis);
    drawDots(svg, xScale, yScale);
});

function drawDots(svg, xScale, yScale) {
    svg.selectAll(".dot")
        .data(Junctions.find().fetch())
        .enter()
        .append("circle")
        .attr("class", "dot")
        .attr("r", SnapApp.Scatter.DOT_R)
        .attr("cx", function (jnct) {
            return xScale(jnct.start);
        })
        .attr("cy", function (jnct) {
            return yScale(jnct.length);
        })
        .style("fill", SnapApp.Scatter.DOT_FILL);
}

function setupAxis(svg, xAxis, yAxis) {
    // x-axis
    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + SnapApp.Scatter.DRAW_H + ")")
        .call(xAxis)
        .append("text")
        .attr("class", "label")
        .attr("x", 50)
        .attr("y", 40)
        .style("text-anchor", "end")
        .text("Intron Start");

    // y-axis
    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis)
        .append("text")
        .attr("class", "label")
        .attr("transform", "rotate(-90)")
        .attr("y", -50)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text("Intron Length");
}

function getXScale() {
    var minStart = Junctions.find({}, {
        sort: {
            start: 1
        },
        limit: 1
    }).fetch()[0].start;
    var maxEnd   = Junctions.find({}, {
        sort: {
            end: -1
        },
        limit: 1
    }).fetch()[0].end;

    return d3.scale.linear().range([0, SnapApp.Scatter.DRAW_W])
        .domain([minStart, maxEnd]);
}

function getYScale() {
    var minLen = Junctions.find({}, {
        sort: {
            length: 1
        },
        limit: 1
    }).fetch()[0].length;
    var maxLen = Junctions.find({}, {
        sort: {
            length: -1
        },
        limit: 1
    }).fetch()[0].length;

    return d3.scale.linear().range([SnapApp.Scatter.DRAW_H, 0])
        .domain([minLen, maxLen]);
}

function formatNumber(d) {
    if (Math.abs(d) > 1000) {
        return numberWithCommas(parseInt(d / 1000)) + "k";
    }
    return numberWithCommas(d);
}