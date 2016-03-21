/**
 * Created by Phani on 2/9/2016.
 *
 * This file proves querying functions to get information from the snaptron server
 */

const SNAPTRON_URL = "http://stingray.cs.jhu.edu:8443/snaptron";
const SAMPLE_URL   = "http://stingray.cs.jhu.edu:8443/samples";

SnapApp.Snaptron = {};

/**
 * Updates all of the regions in the query if they have
 * not been loaded, or if they expired.
 * @param queryId
 * @returns {*}
 */
SnapApp.Snaptron.updateQuery = function (queryId) {
    var query = SnapApp.QueryDB.getQuery(queryId);
    if (query) {
        var regionIds = query[QRY_REGIONS];
        for (var i = 0; i < regionIds.length; i++) {
            if (!SnapApp.RegionDB.hasRegion(regionIds[i])) {
                SnapApp.RegionDB.newRegion(regionIds[i]);
            }
            var region = SnapApp.RegionDB.getRegion(regionIds[i]);
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
 * Loads the missing samples for the given junctions and adds them to the db.
 * @param junctionIds
 * @returns {*}
 */
SnapApp.Snaptron.loadMissingJunctionSamples = function (junctionIds) {
    var junctions = SnapApp.JunctionDB.getJunctions(junctionIds);
    var sampleIds = _.uniq(_.flatten(_.pluck(junctions, JNCT_SAMPLES_KEY)));
    return SnapApp.Snaptron.loadMissingSamples(sampleIds);
};

/**
 * Loads the given samples, if they have not already been loaded.
 * @param sampleIds
 */
SnapApp.Snaptron.loadMissingSamples = function (sampleIds) {
    var samplesToLoad = _.filter(sampleIds, function (sampleId) {
        return !SnapApp.SampleDB.hasSample(sampleId);
    });
    if (samplesToLoad.length > 0) {
        console.log("Loading " + samplesToLoad.length + " samples");
        try {
            var sampleQuery = "\"[{\"ids\":[\"" + samplesToLoad.join("\",\"") + "\"]}]\"";
            var params      = {"fields": sampleQuery};
            var responseTSV = Meteor.http.post(SAMPLE_URL, {params: params}).content.trim();
            var samples     = SnapApp.Parser.parseSampleResponse(responseTSV);
            SnapApp.SampleDB.addSamples(samples);
        } catch (err) {
            console.error("Error in loadMissingSamples");
            console.error(err);
            return null;
        }
    }
    return sampleIds;
};


/**
 * Loads the metadata and junctions list for a given region.
 * If the region document doesn't exist, it will be created.
 * @param regionId
 * @returns {*}
 */
function updateRegion(regionId) {
    var snaptronQuery = SNAPTRON_URL + "?regions=" + regionId + "&contains=1&fields=snaptron_id";
    if (!SnapApp.RegionDB.hasRegion(regionId)) {
        console.log("Region with id " + regionId + " doesn't exist, creating it.");
        if (SnapApp.RegionDB.newRegion(regionId) == null) {
            console.log("Failed to create a region document for " + regionId + "! Aborting update");
            return null;
        }
    }
    try {
        console.log("Loading region " + regionId + "...");
        var responseTSV = Meteor.http.get(SNAPTRON_URL + snaptronQuery).content.trim();
        var regionDoc   = SnapApp.Parser.parseRegionResponse(regionId, responseTSV);
        SnapApp.RegionDB.upsertRegion(regionDoc);
        return regionId;
    } catch (err) {
        SnapApp.RegionDB.setRegionLoadedDate(regionId, null);
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
    var region = SnapApp.RegionDB.getRegion(regionId);
    if (region == null) {
        console.error("loadMissingRegionJunctions called with an ID not found (\"" + regionId + "\")!");
        return;
    }
    var regionJunctionIDs = region[REGION_JUNCTIONS];
    var toLoadJunctionIDs = [];
    for (var i = 0; i < regionJunctionIDs.length; i++) {
        if (!SnapApp.JunctionDB.hasJunction(regionJunctionIDs[i])) {
            toLoadJunctionIDs.push(regionJunctionIDs[i]);
        }
    }
    if (toLoadJunctionIDs.length > 0) {
        console.log("Loading " + toLoadJunctionIDs.length + " junctions for region (\"" + regionId + "\")");
        try {
            var snaptronQuery = "\"[{\"ids\":[\"" + toLoadJunctionIDs.join("\",\"") + "\"]}]\"";
            var params        = {"fields": snaptronQuery};
            var responseTSV   = Meteor.http.post(SNAPTRON_URL, {params: params}).content.trim();
            var junctions     = SnapApp.Parser.parseJunctionsResponse(responseTSV);
            SnapApp.JunctionDB.addJunctions(junctions);
            return regionId;
        } catch (err) {
            console.error("Error in loadMissingRegionJunctions with region " + regionId);
            console.error(err);
            return null;
        }
    }
    return regionId;
}