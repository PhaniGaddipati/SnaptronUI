/**
 * Created by Phani on 3/1/2016.
 */


updateColorScale = function (colorByKey, colorLog, junctions) {
    var colorScale;
    d3.select(".scale-container").selectAll("svg").remove();
    if (colorByKey != null && JNCT_COL_TYPES[colorByKey] !== "bool") {
        var vals       = _.pluck(junctions, colorByKey);
        //var colorByMin = colorLog ? 1 : 0;
        var colorByMin = _.min(vals);
        var colorByMax = _.max(vals);

        if (colorLog) {
            colorScale = d3.scale.log();
        } else {
            colorScale = d3.scale.linear();
        }
        colorScale = colorScale.domain([colorByMin, colorByMax])
            .interpolate(d3.interpolateLab)
            .range([SnapApp.Map.JNCT_NORMAL_COLOR, SnapApp.Map.JNCT_MAX_VAL_COLOR]);

        updateBar(colorScale);
        return colorScale;
    }
    return null;
};

function updateBar(colorScale) {
    var indicies = _.range(0, SnapApp.Map.SCALE_VIEWBOX_W);

    var svg   = d3.select(".scale-container").selectAll("svg")
        .data([0]).enter()
        .append("svg")
        .classed("svg-content-responsive", true)
        .attr("viewBox", "0 0 "
            + SnapApp.Map.SCALE_VIEWBOX_W + " " + SnapApp.Map.SCALE_VIEWBOX_H);
    var rects = svg.selectAll("rect").data(indicies);
    rects.enter()
        .append("rect")
        .attr("fill", function (d) {
            return colorScale(getValueFromScaleIndex(d, colorScale));
        })
        .attr("width", 1)
        .attr("height", SnapApp.Map.SCALE_BAR_H)
        .attr("x", function (d) {
            return d;
        })
        .attr("y", SnapApp.Map.SCALE_BAR_Y_OFF)
        .attr("id", function (d) {
            return "d" + d;
        })
        .on("mouseover", function (d) {
            svg.selectAll("#scaleText")
                .text(function () {
                    return parseInt(getValueFromScaleIndex(d, colorScale));
                })
                .attr("x", function () {
                    return SnapApp.Map.SCALE_VIEWBOX_W / 2
                        - this.getBBox().width / 2;
                });
            rects.attr("height", SnapApp.Map.SCALE_BAR_H);
            svg.selectAll("#d" + d).data([d]).attr("height", SnapApp.Map.SCALE_SEL_BAR_H);
        });
    svg.append("text")
        .attr("id", "scaleText")
        .attr("font-size", SnapApp.Map.SCALE_TEXT_FONT_SIZE)
        .attr("y", SnapApp.Map.SCALE_TEXT_Y_OFF)
        .text("");
    svg.append("text")
        .attr("font-size", SnapApp.Map.SCALE_TEXT_FONT_SIZE)
        .attr("x", 0)
        .attr("y", SnapApp.Map.SCALE_TEXT_Y_OFF)
        .text(parseInt(getValueFromScaleIndex(0, colorScale)));
    svg.append("text")
        .attr("font-size", SnapApp.Map.SCALE_TEXT_FONT_SIZE)
        .attr("y", SnapApp.Map.SCALE_TEXT_Y_OFF)
        .text(parseInt(getValueFromScaleIndex(SnapApp.Map.SCALE_VIEWBOX_W - 1, colorScale)))
        .attr("x", function () {
            return SnapApp.Map.SCALE_VIEWBOX_W - this.getBBox().width;
        });
}

function getValueFromScaleIndex(d, colorScale) {
    var domain = colorScale.domain();
    return d * ((domain[1] - domain[0]) / SnapApp.Map.SCALE_VIEWBOX_W) + domain[0];
}
