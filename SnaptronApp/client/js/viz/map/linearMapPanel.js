/**
 * Created by Phani on 2/14/2016.
 */
var linearMapXScale;
var linearMapXAxis;
var zoomBehaviour     = null;
var highlightedJnctID = new ReactiveVar(null);

var colorByScale = new ReactiveVar();
var colorByKey   = null;

var markerX          = new ReactiveVar(-1);
var visibleJunctions = new ReactiveVar([]);
var initialDomain;

var selectedGeneModel = new ReactiveVar(null);

Template.linearMap.onRendered(function () {
    colorByKey = null;
    initMap();
    initFrame();
    Tracker.autorun(updateMarker);
    Tracker.autorun(updateVisibleJunctions);
    Tracker.autorun(updateJunctions);
    Tracker.autorun(updateGeneModel);
});
Template.linearMap.events({
    "click .resetView": function () {
        if (zoomBehaviour != null) {
            onReset();
        }
    },
    "change #colorBySelect": function (event, template) {
        var selected = template.find("#colorBySelect").value;
        var colorLog;
        if (selected === "None") {
            colorByKey = null;
        } else if (selected.startsWith("log(")) {
            colorLog   = true;
            colorByKey = selected.replace("log(", "").replace(")", "");
        }
        else {
            colorLog   = false;
            colorByKey = selected;
        }
        colorByScale.set(updateColorScale(colorByKey, colorLog, Junctions.find().fetch()));
        //Force redraw
        d3.select(".junctionmap").selectAll(".jnct").remove();
        updateJunctions();
    },
    "change #modelSelect": function (evt, template) {
        var selected = template.find("#modelSelect").value;
        if (selected == "None") {
            selectedGeneModel.set(null);
        } else {
            var idxs   = selected.split(":");
            var region = Regions.find(idxs[0]).fetch()[0];
            var model  = region[REGION_MODELS][idxs[1]];
            selectedGeneModel.set(model);
        }

    }
});
Template.linearMap.helpers({
    "currentlyVisible": function () {
        return visibleJunctions.get().length + " Junctions Currently Visible";
    },
    "colorOptions": function () {
        var numKeys = SnapApp.JunctionDB.getJunctionNumberKeys();
        var options = ["None"].concat(SnapApp.JunctionDB.getJunctionBoolKeys().concat(numKeys));
        //Add log options
        var logKeys = [];
        for (var i = 0; i < numKeys.length; i++) {
            logKeys.push("log(" + numKeys[i] + ")");
        }
        return options.concat(logKeys);
    },
    "regions": function () {
        return Regions.find().fetch();
    },
    "modelOptionText": function (region, model, index) {
        var hasCDS = model[REGION_MODEL_CDS_START] > -1;
        var text;
        if (Regions.find().count() > 1) {
            text = (index + 1) + " - " + region.toUpperCase() + ": " + model[REGION_MODEL_SRC];
        } else {
            text = (index + 1) + " - " + model[REGION_MODEL_SRC];
        }
        if (!hasCDS) {
            text += " (No CDS)";
        }
        return text;
    },
    "geneModelInfo": function () {
        var model   = selectedGeneModel.get();
        var spacing = "&nbsp;&nbsp;&nbsp;";
        var text    = "";
        if (model) {
            text += "<b>Source</b>: " + model[REGION_MODEL_SRC] + spacing;
            text += "<b>Type</b>: " + model[REGION_MODEL_FEAT_TYPE] + spacing;
            text += "<b>Transcript</b>: " + model[REGION_MODEL_TRANSCRIPT] + spacing;
            text += "<b>Strand</b>: " + model[REGION_MODEL_STRAND] + spacing;
            text += "<b>Reference</b>: " + model[REGION_MODEL_REF] + spacing;
            if (model[REGION_MODEL_CDS_START] > -1) {
                text += "<b>CDS</b>: " + model[REGION_MODEL_CDS_START] + "-" + model[REGION_MODEL_CDS_END] + spacing;
            }
            text += "<br><br>";
        }
        return text;
    },
    "geneModelDisplayed": function () {
        return selectedGeneModel.get() != null;
    }
});

function initMap() {
    var _limits     = getLimits();
    initialDomain   = [_limits.start, _limits.stop];
    linearMapXScale = d3.scale.linear().range([0, SnapApp.Map.DRAW_W])
        .domain([_limits.start, _limits.stop]);

    zoomBehaviour = d3.behavior.zoom()
        .x(linearMapXScale)
        .scaleExtent([1, 100])
        .on("zoom", function () {
            onZoom();
        });

    // Init SVG
    var svg = d3.select(".svg-container")
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
        .call(zoomBehaviour);
    svg.append("g")
        .attr("id", "svg-content")
        .attr("transform", "translate(" + SnapApp.Map.PADDING + ", " + SnapApp.Map.PADDING + ")")
}


function initFrame() {
    var svg        = d3.select("#svg-content");
    //Draw axis
    linearMapXAxis = d3.svg.axis()
        .orient("bottom")
        .scale(linearMapXScale)
        .ticks(10)
        .tickFormat(function (d) {
            if (Math.abs(d) > SnapApp.Map.AXIS_K_CUTOFF) {
                return numberWithCommas(parseInt(d / 1000)) + "k";
            }
            return numberWithCommas(d);
        });
    svg.selectAll("#jnctG").data([0])
        .enter().append("g")
        .attr("id", "jnctG");
    svg.selectAll("g.xaxis").data([0])
        .enter().append("g")
        .attr("class", "xaxis")
        .attr("transform", "translate(0," + SnapApp.Map.DRAW_H + ")")
        .call(linearMapXAxis);
}

function updateGeneModel() {
    var svg   = d3.select("#svg-content");
    var model = selectedGeneModel.get();

    svg.selectAll(".exonRect").remove();
    svg.selectAll(".cdsRect").remove();

    // Default mid-axis line
    svg.selectAll("#midAxisLine").data([0])
        .enter().append("rect")
        .attr("id", "midAxisLine")
        .attr("x", -SnapApp.Map.PADDING).attr("y", SnapApp.Map.DRAW_H / 2
            - SnapApp.Map.DEFAULT_MID_AXIS_HEIGHT / 2)
        .attr("width", SnapApp.Map.DRAW_W + SnapApp.Map.PADDING * 2)
        .attr("height", SnapApp.Map.DEFAULT_MID_AXIS_HEIGHT).attr("fill", "#000000");
    if (model != null) {
        // Draw exons
        var exonRects = svg.selectAll(".exonRect").data(model[REGION_MODEL_EXONS]);
        exonRects.enter().append("rect")
            .attr("class", "exonRect")
            .attr("height", SnapApp.Map.EXON_HEIGHT)
            .attr("style", SnapApp.Map.EXON_STYLE)
            .attr("pointer-events", "none");
        exonRects.attr("y", SnapApp.Map.DRAW_H / 2 - SnapApp.Map.EXON_HEIGHT / 2)
            .attr("x", function (exon) {
                return linearMapXScale(exon[REGION_MODEL_START]);
            })
            .attr("width", function (exon) {
                return linearMapXScale(exon[REGION_MODEL_END])
                    - linearMapXScale(exon[REGION_MODEL_START]);
            });
        var cdsMarker = svg.selectAll(".cdsRect").data([0]);
        if (model[REGION_MODEL_CDS_START] > -1 && model[REGION_MODEL_CDS_END] > -1) {
            cdsMarker.enter().append("rect")
                .attr("class", "cdsRect")
                .attr("pointer-events", "none")
                .attr("height", SnapApp.Map.CDS_MARKER_HEIGHT)
                .attr("style", SnapApp.Map.CDS_MARKER_STYLE)
                .attr("y", SnapApp.Map.DRAW_H / 2 - SnapApp.Map.CDS_MARKER_HEIGHT / 2);
            cdsMarker.attr("x", linearMapXScale(model[REGION_MODEL_CDS_START]))
                .attr("width", linearMapXScale(model[REGION_MODEL_CDS_END]) -
                    linearMapXScale(model[REGION_MODEL_CDS_START]));
        }
    }
}

function updateVisibleJunctions() {
    var leftLim          = linearMapXScale.invert(0);
    var rightLim         = linearMapXScale.invert(SnapApp.Map.DRAW_W);
    var extendedLeftLim  = linearMapXScale.invert(-SnapApp.Map.DRAW_W / 4);
    var extendedRightLim = linearMapXScale.invert(SnapApp.Map.DRAW_W + SnapApp.Map.DRAW_W / 4);
    var minLength        = linearMapXScale.invert(SnapApp.Map.MIN_DISPLAY_LENGTH_PX) - leftLim;
    visibleJunctions.set(Junctions.find({
            $or: [{
                $and: [
                    {start: {"$gte": leftLim}},
                    {start: {"$lte": rightLim}},
                    {end: {"$gte": extendedLeftLim}},
                    {end: {"$lte": extendedRightLim}}
                ]
            }, {
                $and: [
                    {end: {"$gte": leftLim}},
                    {end: {"$lte": rightLim}},
                    {start: {"$gte": extendedLeftLim}},
                    {start: {"$lte": extendedRightLim}}
                ]
            }],
            length: {
                "$gte": minLength
            }
        }).fetch()
    )
    ;
}

function updateJunctions() {
    var selection = d3.select(".junctionmap").select("#jnctG")
        .selectAll(".jnct")
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
        .attr("stroke-linecap", "round")
        .on("click", onJunctionMouseClick)
        .on("mouseover", onJunctionMouseOver)
        .on("mouseout", onJunctionMouseOut);
    selection.attr("stroke", getJunctionColor)
        .attr("stroke-width", getJunctionWidth);
    // Remove no longer visible
    selection.exit().remove();
}

function junctionPath(jnct) {
    var endpointY    = (SnapApp.Map.DRAW_H) / 2;
    var startX       = parseInt(linearMapXScale(jnct.start));
    var endX         = parseInt(linearMapXScale(jnct.end));
    var range        = endX - startX;
    var cPoint1X     = parseInt(startX + 2 * range / 6);
    var cPoint2X     = parseInt(startX + 4 * range / 6);
    var annotatedMod = jnct[JNCT_ANNOTATED_KEY] ? -1 : 1;
    var cPointY      = (SnapApp.Map.DRAW_H ) / 2 -
        annotatedMod * parseInt((SnapApp.Map.DRAW_H / 2)
            * (parseFloat(range) / (SnapApp.Map.DRAW_W / 3)));
    cPointY          = Math.max(0, cPointY);
    cPointY          = Math.min(SnapApp.Map.DRAW_H, cPointY);
    return "M" + startX + " " + endpointY + " C " + cPoint1X + " "
        + cPointY + " " + cPoint2X + " " + cPointY + " " + endX + " " + endpointY;
}

function getLimits() {
    var start = Junctions.find({}, {
        sort: {
            start: 1
        },
        limit: 1
    }).fetch()[0].start;
    var stop  = Junctions.find({}, {
        sort: {
            end: -1
        },
        limit: 1
    }).fetch()[0].end;

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
    var index = SnapApp.selectedJnctIDs.indexOf(jnct["_id"]);
    if (index > -1) {
        SnapApp.selectedJnctIDs.splice(index, 1);
    } else {
        SnapApp.selectedJnctIDs.push(jnct["_id"]);
    }
    Session.set("selectedJnctIDs", SnapApp.selectedJnctIDs);
    SnapApp.selectedJnctIDsDep.changed();
}

function getJunctionColor(jnct) {
    SnapApp.selectedJnctIDsDep.depend();
    if (SnapApp.selectedJnctIDs.indexOf(jnct["_id"]) > -1) {
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
    SnapApp.selectedJnctIDsDep.depend();
    if (SnapApp.selectedJnctIDs.indexOf(jnct["_id"]) > -1) {
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
        .attr("id", "mousemarker")
        .attr("transform", "translate(0," + SnapApp.Map.PADDING + ")");
    markerG.attr("visibility", function () {
        if (markerX.get() == -1) {
            return "hidden";
        }
        return "visible";
    });
    // Marker line
    markerG.selectAll("#markerline")
        .data([0]).enter()
        .append("line")
        .attr("id", "markerline")
        .attr("x1", 0)
        .attr("y1", 0)
        .attr("x2", 0)
        .attr("y2", SnapApp.Map.DRAW_H)
        .attr("style", SnapApp.Map.MARKER_LINE_STYLE)
        .attr("pointer-events", "none");
    var label = markerG.selectAll("#markerlabel").data([0]);
    label.enter()
        .append("g").attr("id", "markerlabel").attr("transform", "translate(0,0)");
    //Label box and text
    var labelbox = label.selectAll("#markerlabelbox").data([0]);
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

    markerG.attr("transform", "translate(" + markerX.get() + "," + SnapApp.Map.PADDING + ")");
    text.text(function () {
        return numberWithCommas(parseInt(linearMapXScale.invert(markerX.get())));
    });
    var w       = d3.select("#markerlabeltext").node().getBBox().width;
    var xOffset = -10 - w / 2;
    if (markerX.get() - w - 50 <= 0) {
        //Goes offscreen, go to other side of line
        xOffset = 0;
    } else if (markerX.get() + w + 50 >= SnapApp.Map.DRAW_W) {
        xOffset -= w / 2 + 10;
    }
    label.attr("transform", "translate (" + xOffset + ",0)");
    labelbox.attr("width", w + 10);
}

function onZoom() {
    d3.select(".xaxis").call(linearMapXAxis);
    updateVisibleJunctions();
    updateGeneModel();
}

function onReset() {
    d3.transition().duration(750).tween("zoomBehaviour", function () {
        var ix = d3.interpolate(linearMapXScale.domain(), initialDomain);
        return function (t) {
            zoomBehaviour.x(linearMapXScale.domain(ix(t)));
            onZoom();
        };
    });
}