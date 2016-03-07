/**
 * Created by Phani on 3/7/2016.
 */


/**
 * Parses the TSV response of a single region snaptron query
 * @param regionId
 * @param responseTSV
 * @returns {*} A document representing the parsed region
 */
parseRegionResponse = function (regionId, responseTSV) {
    check(responseTSV, String);

    var regionDoc = {};
    regionDoc["_id"] = regionId;
    regionDoc[REGION_METADATA] = [];

    var lines = responseTSV.split("\n");
    var lineNum = 0;
    //Parse metadata
    for (var i = 0; i < lines.length; i++) {
        if (lines[i].startsWith("##")) {
            var str = lines[i].replace(/[#]+/g, "");
            if (str.includes("=")) {
                var elems = str.split("=");
                var info = {};
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
    var idCol = -1;
    for (i = 0; i < headerElems.length; i++) {
        if (headerElems[i] === JNCT_ID_FIELD) {
            idCol = i;
            break;
        }
    }
    if (idCol == -1) {
        console.warn("ID column now found when trying to update region " + regionId + "!");
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
    regionDoc[REGION_LOADED_DATE] = new Date();

    return regionDoc;
};

/**
 * Parses the response for a junction request
 * @param responseTSV
 * @returns {Array} An array of the parsed junctions
 */
parseJunctionsResponse = function (responseTSV) {
    check(responseTSV, String);
    // Get rid of commented lines
    responseTSV.replace(/[#].+/g, "");

    var lines = responseTSV.split("\n");
    var headers = lines[0].split("\t");
    var junctions = [];

    for (var i = 1; i < lines.length; i++) {
        if (lines[i] && 0 != lines[i].length) {
            var elems = lines[i].split("\t");
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