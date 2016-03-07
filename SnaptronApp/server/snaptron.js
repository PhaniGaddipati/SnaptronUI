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
        var regionDoc = parseRegionResponse(regionId, responseTSV);
        upsertRegion(regionDoc);
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
            var junctions = parseJunctionsResponse(responseTSV);
            addJunctions(responseTSV);
            return regionId;
        } catch (err) {
            console.error("Error in loadMissingRegionJunctions with region " + regionId);
            console.error(err);
            return null;
        }
    }
    return regionId;
}

