/**
 * Created by Phani on 2/9/2016.
 *
 * This file proves querying functions to get information from the snaptron server
 */

const URL = "http://stingray.cs.jhu.edu:8443/snaptron";

/**
 * Updates all of the regions in the query if they have
 * not been loaded, or if they expired.
 * @param queryId
 * @returns {*}
 */
updateQuery = function (queryId) {
    var query = getQuery(queryId);
    if (query) {
        var regionIds = query[QRY_REGIONS];
        for (var i = 0; i < regionIds.length; i++) {
            if (!hasRegion(regionIds[i])) {
                newRegion(regionIds[i]);
            }
            var region = getRegionNoJunctions(regionIds[i]);
            if (region[REGION_LOADED_DATE] == null ||
                (new Date().getTime() - region[REGION_LOADED_DATE]) > REGION_REFRESH_TIME) {
                updateRegion(region["_id"]);
            }
            loadMissingRegionJunctions(region["_id"]);
        }
        return queryId;
    }
    return null;
};

/**
 * Loads the metadata and junctions list for a given region.
 * If the region document doesn't exist, it will be created.
 * @param regionId
 * @returns {*}
 */
function updateRegion(regionId) {
    var snaptronQuery = URL + "?regions=" + regionId + "&contains=1&fields=snaptron_id";
    if (!hasRegion(regionId)) {
        console.log("Region with id " + regionId + " doesn't exist, creating it.");
        if (newRegion(regionId) == null) {
            console.log("Failed to create a region document for " + regionId + "! Aborting update");
            return null;
        }
    }
    try {
        console.log("Loading region " + regionId + "...");
        var responseTSV = Meteor.http.get(URL + snaptronQuery).content.trim();
        var lines = responseTSV.split("\n");
        var lineNum = 0;
        //Parse metadata
        for (var i = 0; i < lines.length; i++) {
            if (lines[i].startsWith("##")) {
                var str = lines[i].replace(/[#]+/g, "");
                if (str.includes("=")) {
                    var elems = str.split("=");
                    addRegionMetadata(regionId, elems[0], elems[1]);
                } else {
                    console.log("Unrecognized metadata line: " + str);
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

        // Ignore type line if it exists
        if (lineNum < lines.length && lines[lineNum].startsWith("#")) {
            lineNum++;
        }

        // Get the junction IDs
        var junctionIds = [];
        for (var line = lineNum; line < lines.length; line++) {
            junctionIds.push(lines[line].split("\t")[idCol]);
        }

        setRegionJunctions(regionId, junctionIds);
        setRegionLoadedDate(regionId, new Date());
        console.log("Done Loading region " + regionId);
        return regionId;
    } catch (err) {
        setRegionLoadedDate(regionId, null);
        console.error("Error in updateRegion (\"" + regionId + "\")!");
        console.error(err);
        return null;
    }
}

/**
 * Checks which junctions have already been loaded for the
 * given region (by ID), and attempts to load the rest
 * @param regionId
 * @returns {*} regionId on success, null on failure
 */
function loadMissingRegionJunctions(regionId) {
    var region = getRegion(regionId);
    if (region == null) {
        console.error("loadMissingRegionJunctions called with an ID not found (\"" + regionId + "\")!");
        return;
    }
    var regionJunctionIDs = region[REGION_JUNCTIONS];
    var toLoadJunctionIDs = [];
    for (var i = 0; i < regionJunctionIDs.length; i++) {
        if (!hasJunction(regionJunctionIDs[i])) {
            toLoadJunctionIDs.push(regionJunctionIDs[i]);
        }
    }
    if (toLoadJunctionIDs.length > 0) {
        console.log("Loading " + toLoadJunctionIDs.length + " junctions for region (\"" + regionId + "\")");
        try {
            var snaptronQuery = "\"[{\"snaptron_id\":[\"" + toLoadJunctionIDs.join("\",\"") + "\"]}]\"";
            var params = {"fields": snaptronQuery};
            var responseTSV = Meteor.http.post(URL, {params: params}).content.trim();
            addJunctionsFromTSV(responseTSV);
            return regionId;
        } catch (err) {
            console.error("Error in loadMissingRegionJunctions with region " + regionId);
            console.error(err);
            return null;
        }
    }
    return regionId;
}

