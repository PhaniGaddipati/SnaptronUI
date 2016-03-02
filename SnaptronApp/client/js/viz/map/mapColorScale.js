/**
 * Created by Phani on 3/1/2016.
 */


updateColorScale = function (colorByKey, colorLog, junctions) {
    var colorScale;
    if (colorByKey != null && colorByKey !== "bool") {

        //TODO use mongo query to find max/min

        var colorByMin = 9007199254740990;
        var colorByMax = -9007199254740990;
        for (var i = 0; i < junctions.length; i++) {
            if (junctions[i][colorByKey] > colorByMax) {
                colorByMax = junctions[i][colorByKey];
            }
            if (junctions[i][colorByKey] < colorByMin) {
                colorByMin = junctions[i][colorByKey];
            }
        }
        if (colorLog) {
            colorScale = d3.scale.log();
        } else {
            colorScale = d3.scale.linear();
        }
        colorScale = colorScale.domain([colorByMin, colorByMax])
            .interpolate(d3.interpolateLab)
            .range([SnaptronApp.LinearMap.JUNCTION_NORMAL_COLOR, SnaptronApp.LinearMap.JUNCTION_MAX_VAL_COLOR]);

        updateBar(colorScale);
        return colorScale;
    }
    return null;
};

function updateBar(colorScale) {
    d3.select(".scale-container").selectAll("svg").remove();
    var lowEnd = 1;
    var highEnd = 100;
    var arr = [];
    while (lowEnd <= highEnd) {
        arr.push(lowEnd++);
    }

    var svg = d3.select(".scale-container").selectAll("svg")
        .data([0]).enter()
        .append("svg")
        .classed("svg-content-responsive", true)
        .attr("viewBox", "0 0 " + 100 + " " + 15);
    svg.selectAll("rect").data(arr)
        .enter()
        .append("rect")
        .attr("fill", function (d) {
            var domain = colorScale.domain();
            return colorScale(d * ((domain[1] - domain[0]) / 100) + domain[0]);
        })
        .attr("width", 1)
        .attr("height", 2)
        .attr("x", function (d) {
            return d - 1;
        })
        .attr("y", 5)
        .on("mouseover", function (d) {
            svg.selectAll("text")
                .text(function () {
                    var domain = colorScale.domain();
                    return parseInt(d * ((domain[1] - domain[0]) / 100) + domain[0]);
                });
        });
    svg.append("text")
        .attr("font-size", 3)
        .attr("x", "1")
        .attr("y", "11")
        .text("");
}
