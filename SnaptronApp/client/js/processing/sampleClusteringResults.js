/**
 * Created by Phani on 5/25/2016.
 */

const CLUSTER_SVG_WIDTH  = 320;
const CLUSTER_SVG_HEIGHT = 320;
const PADDING            = 25;

Template.sampleClusteringResults.onRendered(function () {
    var root           = {};
    var clusterResults = this.data[QRY_PROCESSOR_RESULTS];
    root["name"]       = "";
    root["children"]   = [];
    _.each(clusterResults, function (cluster) {
        var children = _.map(cluster, function (sampleId) {
            return {
                name: sampleId,
                size: 5
            }
        });
        root["children"].push({
            "name": "",
            "children": children
        })
    });

    var color = d3.scale.linear()
        .domain([-1, 6])
        .range(["hsl(152,80%,80%)", "hsl(228,30%,40%)"])
        .interpolate(d3.interpolateHcl);

    var pack = d3.layout.pack()
        .padding(2)
        .size([CLUSTER_SVG_WIDTH - PADDING, CLUSTER_SVG_HEIGHT - PADDING])
        .value(function (d) {
            return 1;
        });

    var svg = d3.select("#sampleClusterSVG" + this.data._id)
        .attr("preserveAspectRatio", "xMinYMin meet")
        .attr("viewBox", "0 0 " + CLUSTER_SVG_WIDTH + " " + CLUSTER_SVG_HEIGHT)
        .classed("svg-content-responsive", true)
        .append("g")
        .attr("transform", "translate(" + CLUSTER_SVG_WIDTH / 2 + "," + CLUSTER_SVG_HEIGHT / 2 + ")");

    var focus = root;
    var nodes = pack.nodes(root);
    var view;

    var circle = svg.selectAll("circle")
        .data(nodes)
        .enter()
        .append("circle")
        .attr("class", function (d) {
            return d.parent ? d.children ? "node" : "node node--leaf" : "node node--root";
        })
        .style("fill", function (d) {
            return d.children ? color(d.depth) : null;
        })
        .on("click", function (d) {
            if (d.children) {
                if (focus !== d) {
                    zoom(d);
                    d3.event.stopPropagation();
                }
            } else {
                d3.event.stopPropagation();
                Modal.show("sampleInformationModal", {sampleId: d.name});
            }
        });

    var text = svg.selectAll("text")
        .data(nodes)
        .enter().append("text")
        .attr("class", "label")
        .style("fill-opacity", function (d) {
            return d.parent === root ? 1 : 0;
        })
        .text(function (d) {
            return d.name;
        });

    var node = svg.selectAll("circle,text");
    svg
        .style("background", color(-1))
        .on("click", function () {
            zoom(root);
        });

    zoomTo([root.x, root.y, root.r * 2 + PADDING]);


    function zoom(d) {
        var focus0 = focus;
        focus      = d;

        var transition = d3.transition()
            .duration(d3.event.altKey ? 7500 : 750)
            .tween("zoom", function (d) {
                var i = d3.interpolateZoom(view, [focus.x, focus.y, focus.r * 2 + PADDING]);
                return function (t) {
                    zoomTo(i(t));
                };
            });

        transition.selectAll("text")
            .filter(function (d) {
                return d.parent === focus || this.style.display === "inline";
            })
            .style("fill-opacity", function (d) {
                return d.parent === focus ? 1 : 0;
            })
            .each("start", function (d) {
                if (d.parent === focus) this.style.display = "inline";
            })
            .each("end", function (d) {
                if (d.parent !== focus) this.style.display = "none";
            });
    }

    function zoomTo(v) {
        var k = CLUSTER_SVG_HEIGHT / v[2];
        view  = v;
        node.attr("transform", function (d) {
            return "translate(" + (d.x - v[0]) * k + "," + (d.y - v[1]) * k + ")";
        });
        circle.attr("r", function (d) {
            return d.r * k;
        });
    }

    d3.select(self.frameElement).style("height", CLUSTER_SVG_HEIGHT + "px");
});