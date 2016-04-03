/**
 * Created by Phani on 3/7/2016.
 */

SnapApp.Parser = {};

/**
 * Parses the TSV response of a single region snaptron query
 * @param regionId
 * @param responseTSV
 * @returns {*} A document representing the parsed region
 */
SnapApp.Parser.parseRegionResponse = function (regionId, responseTSV) {
    check(responseTSV, String);

    var regionDoc    = SnapApp.RegionDB.newRegionDoc();
    regionDoc["_id"] = regionId;

    var lines   = responseTSV.split("\n");
    var lineNum = 0;
    //Parse metadata
    for (var i = 0; i < lines.length; i++) {
        if (lines[i].startsWith("##")) {
            var str = lines[i].replace(/[#]+/g, "");
            if (str.includes("=")) {
                var elems      = str.split("=");
                var info       = {};
                info[elems[0]] = elems[1];
                regionDoc[REGION_METADATA].push(info);
            } else {
                console.log("Unrecognized metadata line: " + str + ". Ignoring it.");
            }
            lineNum++;
        } else {
            break;
        }
    }

    // Find the column where the id is
    // Next line should be header
    var headerElems = lines[lineNum].replace("#", "").split("\t");
    var idCol       = -1;
    for (i = 0; i < headerElems.length; i++) {
        if (headerElems[i] === JNCT_ID_FIELD) {
            idCol = i;
            break;
        }
    }
    if (idCol == -1) {
        console.warn("ID column not found when trying to update region " + regionId + "!");
        return null;
    }
    lineNum++;

    // Ignore type line if it exists, hardcoded for now
    if (lineNum < lines.length && lines[lineNum].startsWith("#")) {
        lineNum++;
    }

    // Get the junction IDs
    var junctionIds = [];
    for (var line = lineNum; line < lines.length; line++) {
        junctionIds.push(lines[line].split("\t")[idCol]);
    }

    regionDoc[REGION_JUNCTIONS] = junctionIds;
    return regionDoc;
};

/**
 * Parses the response for a junction request
 * @param responseTSV
 * @returns {Array} An array of the parsed junctions
 */
SnapApp.Parser.parseJunctionsResponse = function (responseTSV) {
    check(responseTSV, String);
    // Get rid of commented lines
    responseTSV.replace(/[#].+/g, "");

    var lines   = responseTSV.split("\n");
    var headers = lines[0].split("\t");
    _.each(headers, function (val, index) {
        //'.' and '$' not supported as keys in Mongo, replace with '_'
        headers[index] = val.replace(".", "_").replace("$", "_");
    });
    var junctions = [];

    // Line 1 is data types, ignoring it for now, it's hardcoded

    for (var i = 2; i < lines.length; i++) {
        if (lines[i] && 0 != lines[i].length) {
            var elems       = lines[i].split("\t");
            var junctionDoc = {};

            for (var col = 0; col < elems.length; col++) {
                if (headers[col] == JNCT_ID_FIELD) {
                    junctionDoc["_id"] = elems[col];
                } else {
                    junctionDoc[headers[col]] = castMember(elems[col], JNCT_COL_TYPES[headers[col]])
                }
            }

            junctions.push(junctionDoc);
        }
    }

    return junctions;
};

/**
 * Parses the response for a samples request
 * @param responseTSV
 * @returns {Array} An array of the parsed samples
 */
SnapApp.Parser.parseSampleResponse = function (responseTSV) {
    check(responseTSV, String);
    // Get rid of commented lines
    responseTSV.replace(/[#].+/g, "");

    var lines   = responseTSV.split("\n");
    var headers = lines[0].split("\t");
    _.each(headers, function (val, index) {
        //'.' and '$' not supported as keys in Mongo, replace with '_'
        headers[index] = val.replace(".", "_").replace("$", "_");
    });
    var samples = [];

    for (var i = 1; i < lines.length; i++) {
        if (lines[i] && 0 != lines[i].length) {
            var elems     = lines[i].split("\t");
            var sampleDoc = {};

            for (var col = 0; col < elems.length; col++) {
                if (headers[col] == SAMPLE_ID_FIELD) {
                    sampleDoc["_id"] = elems[col];
                } else {
                    sampleDoc[headers[col]] = elems[col];
                }
            }

            samples.push(sampleDoc);
        }
    }

    return samples;
};

/**
 * Parses the response for gene models, returning an array of the gene models
 * @param responseTSV
 */
SnapApp.Parser.parseModelResponse = function (responseTSV) {
    check(responseTSV, String);
    // Get rid of commented lines
    responseTSV.replace(/[#].+/g, "");

    var lines   = responseTSV.split("\n");
    var headers = lines[0].split("\t");
    _.each(headers, function (val, index) {
        //'.' and '$' not supported as keys in Mongo, replace with '_'
        headers[index] = val.replace(".", "_").replace("$", "_");
    });
    // Generate column mapping
    var mapping = {};
    _.each(headers, function (key, idx) {
        mapping[key] = idx;
    });

    var models = [];
    for (var i = 1; i < lines.length; i++) {
        if (lines[i] && lines[i].trim() != "") {
            models.push(parseGeneModel(mapping, lines[i].trim()));
        }
    }

    return models;
};

/**
 * Parses a single gene model line, with the given header:col mapping.
 * @param colMapping
 * @param line
 * @returns {{}}
 */
function parseGeneModel(colMapping, line) {
    var model  = {};
    var tokens = line.split("\t");

    model[REGION_MODEL_SRC_TYPE]  = tokens[colMapping["DataSource:Type"]];
    model[REGION_MODEL_REF]       = tokens[colMapping["reference"]];
    model[REGION_MODEL_SRC]       = tokens[colMapping["annotation_source"]];
    model[REGION_MODEL_FEAT_TYPE] = tokens[colMapping["feature_type"]];
    model[REGION_MODEL_START]     = tokens[colMapping["start"]];
    model[REGION_MODEL_END]       = tokens[colMapping["end"]];
    model[REGION_MODEL_STRAND]    = tokens[colMapping["strand"]];

    var attrs     = tokens[colMapping["attributes"]];
    var attrLines = attrs.split(";");
    _.each(attrLines, function (attrLine) {
        if (attrLine && attrLine.trim() != "") {
            var attrTokens = attrLine.replace(/"/g, "").split(" ");
            if (attrTokens.length != 2) {
                console.log("Invalid attribute line: " + attrLine);
                return;
            }
            if (attrTokens[0] == "transcript_id") {
                model[REGION_MODEL_TRANSCRIPT] = attrTokens[1];
            } else if (attrTokens[0] == "cds_span") {
                var range                     = parseRange(attrTokens[1]);
                model[REGION_MODEL_CDS_START] = range.start;
                model[REGION_MODEL_CDS_END]   = range.end;
            } else if (attrTokens[0] == "exons") {
                model[REGION_MODEL_EXONS] = parseExons(attrTokens[1]);
            } else {
                console.log("Unrecognized model attr " + attrTokens[0]);
            }
        }
    });

    return model;
}

function parseExons(str) {
    var ranges = str.split(",");
    var exons  = [];
    _.each(ranges, function (range) {
        exons.push(parseRange(range));
    });
    return exons;
}
function parseRange(str) {
    if (/[0-9]+-[0-9]+/.test(str)) {
        var tokens = str.split("-");
        return {
            start: parseInt(tokens[0]),
            end: parseInt(tokens[1])
        };
    } else {
        return {
            start: -1,
            end: -1
        };
    }
}

function castMember(toCast, type) {
    check(type, String);
    switch (type) {
        case "str[]":
            return String(toCast).split(",");
        case "float[]":
            var elems  = String(toCast).split(",");
            var floats = [];
            for (var i = 0; i < elems.length; i++) {
                floats.push(parseFloat(elems[i]));
            }
            return floats;
        case "str":
            return String(toCast);
        case "int":
            return parseInt(toCast);
        case "bool":
            return parseInt(toCast) != 0;
        case "float":
            return parseFloat(toCast);
    }
}