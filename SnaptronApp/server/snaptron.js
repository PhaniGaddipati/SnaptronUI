/**
 * Created by Phani on 2/9/2016.
 *
 * This file proves querying functions to get information from the snaptron server
 */

const SNAPTRON_URL        = "http://stingray.cs.jhu.edu:8090/srav1/snaptron";
const SAMPLE_URL          = "http://stingray.cs.jhu.edu:8090/srav1/samples";
const ANNOTATION_URL      = "http://stingray.cs.jhu.edu:8090/srav1/annotations";
const URL_REGIONS         = "?regions=";
const ANNOTATION_LIMIT    = "&limit=50";
const UCSC_BROWSER_FORMAT = "&return_format=2";

const MAX_LOAD_BATCH = 1000;

SnapApp.Snaptron = {};

Meteor.methods({
    "getUCSCBrowserURLs": function (region) {
        check(region, String);
        return SnapApp.Snaptron.getUCSCBrowserURLs(region);
    }
});

/**
 * Updates all of the regions in the query if they have
 * not been loaded, or if they expired.
 * @param queryId
 * @returns {*}
 */
SnapApp.Snaptron.updateQuery = function (queryId) {
    check(queryId, String);

    var query = SnapApp.QueryDB.getQuery(queryId);
    if (query) {
        var regionIds = query[QRY_REGIONS];
        for (var i = 0; i < regionIds.length; i++) {
            var needToUpdate = false;
            if (SnapApp.RegionDB.hasRegion(regionIds[i])) {
                var regionDoc = SnapApp.RegionDB.getRegion(regionIds[i]);
                if (regionDoc[REGION_LOADED_DATE] == null ||
                    (new Date().getTime() - regionDoc[REGION_LOADED_DATE]) > REGION_REFRESH_TIME) {
                    // Region exists but is expired or was never loaded
                    needToUpdate = true;
                }
            } else {
                // Region doesn't exist
                needToUpdate = true;
            }
            if (needToUpdate) {
                updateRegion(regionIds[i]);
            }
            loadMissingRegionJunctions(regionIds[i]);
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
    check(junctionIds, [String]);

    var junctions = SnapApp.JunctionDB.getJunctions(junctionIds);
    var sampleIds = _.uniq(_.flatten(_.pluck(junctions, JNCT_SAMPLES_KEY)));
    return SnapApp.Snaptron.loadMissingSamples(sampleIds);
};

/**
 * Loads the given samples, if they have not already been loaded.
 * @param sampleIds
 */
SnapApp.Snaptron.loadMissingSamples = function (sampleIds) {
    check(sampleIds, [String]);

    var samplesToLoad = _.filter(sampleIds, function (sampleId) {
        return !SnapApp.SampleDB.hasSample(sampleId);
    });
    if (samplesToLoad.length > 0) {
        try {
            var startI = 0;
            var endI   = Math.min(samplesToLoad.length, MAX_LOAD_BATCH);
            while (startI < samplesToLoad.length) {
                console.log("Loading samples " + startI + "-" + endI + " of " + samplesToLoad.length);
                var sampleQuery = "\"[{\"ids\":[\"" + samplesToLoad.slice(startI, endI).join("\",\"") + "\"]}]\"";
                var params      = {"fields": sampleQuery};
                var responseTSV = Meteor.http.post(SAMPLE_URL, {params: params}).content.trim();
                var samples     = SnapApp.Parser.parseSampleResponse(responseTSV);
                SnapApp.SampleDB.addSamples(samples);

                startI = endI;
                endI   = Math.min(samplesToLoad.length, endI + MAX_LOAD_BATCH);
            }
        } catch (err) {
            console.error("Error in loadMissingSamples");
            console.error(err);
            return null;
        }
    }
    return sampleIds;
};

/**
 * Returns UCSC links for the given region.
 * An array of {position:pos, url:url} objs are returned
 * @param regionId
 * @returns {*}
 */
SnapApp.Snaptron.getUCSCBrowserURLs = function (regionId) {
    check(regionId, String);
    var snaptronQuery = SNAPTRON_URL + URL_REGIONS + regionId.toLowerCase()
        + "&contains=1&fields=snaptron_id" + UCSC_BROWSER_FORMAT;
    try {
        console.log("Retrieving UCSC URLs for region " + regionId + "...");
        var responseTSV = Meteor.http.get(snaptronQuery).content.trim();
        return SnapApp.Parser.parseUCSCResponse(responseTSV);
    } catch (err) {
        console.error("Error in retrieving UCSC URLs (\"" + regionId + "\")!");
        console.error(err);
        return null;
    }
};


/**
 * Updates region information, including
 * metadata, junctions, and models.
 * @param regionId
 */
function updateRegion(regionId) {
    check(regionId, String);

    if (updateRegionMetadataAndJunctions(regionId)
        && updateRegionModels(regionId)) {
        SnapApp.RegionDB.setRegionLoadedDate(regionId, new Date());
    } else {
        console.log("Failed to update region " + regionId);
    }
}

/**
 * Updates the gene models for a region.
 * @param regionId
 * @returns {null}
 */
function updateRegionModels(regionId) {
    check(regionId, String);

    var annotationQuery = ANNOTATION_URL + URL_REGIONS + regionId + ANNOTATION_LIMIT;
    if (!SnapApp.RegionDB.hasRegion(regionId)) {
        console.log("Region with id " + regionId + " doesn't exist, creating it to update models.");
        if (SnapApp.RegionDB.newRegion(regionId) == null) {
            console.log("Failed to create a region document for " + regionId + "! Aborting update");
            return null;
        }
    }
    try {
        console.log("Loading region " + regionId + " models...");
        var responseTSV = Meteor.http.get(annotationQuery).content.trim();
        var models      = SnapApp.Parser.parseModelResponse(responseTSV);
        SnapApp.RegionDB.setRegionModels(regionId, models);
        return regionId;
    }
    catch (err) {
        SnapApp.RegionDB.setRegionLoadedDate(regionId, null);
        console.error("Error in updateRegionModels (\"" + regionId + "\")!");
        console.error(err);
        return null;
    }
}

/**
 * Loads the metadata and junctions list for a given region.
 * If the region document doesn't exist, it will be created.
 * @param regionId
 * @returns {*}
 */
function updateRegionMetadataAndJunctions(regionId) {
    check(regionId, String);

    var snaptronQuery = SNAPTRON_URL + URL_REGIONS + regionId + "&contains=1&fields=snaptron_id";
    try {
        console.log("Loading region " + regionId + "...");
        var responseTSV = Meteor.http.get(snaptronQuery).content.trim();
        var regionDoc   = SnapApp.Parser.parseRegionResponse(regionId, responseTSV);
        SnapApp.RegionDB.upsertRegion(regionDoc);
        return regionId;
    } catch (err) {
        SnapApp.RegionDB.setRegionLoadedDate(regionId, null);
        console.error("Error in updateRegionMetadataAndJunctions (\"" + regionId + "\")!");
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
    check(regionId, String);

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
        try {
            var startI = 0;
            var endI   = Math.min(toLoadJunctionIDs.length, MAX_LOAD_BATCH);
            while (startI < toLoadJunctionIDs.length) {
                console.log("Loading junctions " + startI + "-" + endI + " of "
                    + toLoadJunctionIDs.length + " for region (\"" + regionId + "\")");

                var snaptronQuery = "\"[{\"ids\":[\"" + toLoadJunctionIDs.slice(startI, endI).join("\",\"") + "\"]}]\"";
                var params        = {"fields": snaptronQuery};
                var responseTSV   = Meteor.http.post(SNAPTRON_URL, {params: params}).content.trim();
                var junctions     = SnapApp.Parser.parseJunctionsResponse(responseTSV);
                SnapApp.JunctionDB.addJunctions(junctions);

                startI = endI;
                endI   = Math.min(toLoadJunctionIDs.length, endI + MAX_LOAD_BATCH);
            }
            return regionId;
        } catch (err) {
            console.error("Error in loadMissingRegionJunctions with region " + regionId);
            console.error(err);
            return null;
        }
    }
    return regionId;
}