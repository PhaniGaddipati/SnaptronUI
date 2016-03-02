/**
 * Created by Phani on 2/26/2016.
 */

REGION_REFRESH_TIME = 2 * 7 * 24 * 60 * 60 * 1000; // 2 weeks

/**
 * Returns all regions found with an ID in the given array.
 * @param regionIds The IDs to look for
 * @returns {any} Matched documents
 */
getRegions = function (regionIds) {
    check(regionIds, [String]);
    return Regions.find({
        "_id": {
            "$in": regionIds
        }
    }).fetch();
};

/**
 * Finds a region by ID.
 * @param regionId
 * @returns {any}
 */
getRegion = function (regionId) {
    check(regionId, String);
    return Regions.findOne({"_id": regionId});
};

getRegionNoJunctions = function (regionId) {
    var fields = {};
    fields[REGION_JUNCTIONS] = 0;
    return Regions.findOne({"_id": regionId}, {"fields": fields});
};

hasRegion = function (regionId) {
    check(regionId, String);
    return Regions.find({"_id": regionId}, {"limit": 1}).count() > 0;
};

findRegionsForQuery = function (queryId) {
    check(queryId, String);
    var regionIds = getQuery(queryId)[QRY_REGIONS];
    return Regions.find({
        "_id": {
            "$in": regionIds
        }
    })
};

/**
 * Inserts a new region to the DB with the given id.
 * @param regionId
 * @returns {820|1027|*|any}
 */
newRegion = function (regionId) {
    var regionDoc = {};
    regionDoc["_id"] = regionId;
    regionDoc[REGION_JUNCTIONS] = [];
    regionDoc[REGION_METADATA] = [];
    regionDoc[REGION_LOADED_DATE] = null;
    return Regions.insert(regionDoc);
};

/**
 * Set the junctionIDs for the given region.
 * @param regionId
 * @param junctionIds
 * @returns {*}
 */
setRegionJunctions = function (regionId, junctionIds) {
    check(regionId, String);
    check(junctionIds, [String]);

    var newInfo = {};
    newInfo[REGION_JUNCTIONS] = junctionIds;
    var changed = Regions.update({"_id": regionId}, {$set: newInfo});
    if (changed > 0) {
        return regionId;
    }
    return null; //Nothing changed
};

/**
 * Set the date of last loading.
 *
 * @param regionId
 * @param date
 * @returns {*}
 */
setRegionLoadedDate = function (regionId, date) {
    check(regionId, String);
    check(date, Match.OneOf(Date, null));

    var newInfo = {};
    newInfo[REGION_LOADED_DATE] = date;
    var changed = Regions.update({"_id": regionId}, {$set: newInfo});
    if (changed > 0) {
        return regionId;
    }
    return null; //Nothing changed
};

/**
 * Add a metadata pair to the given region.
 * @param regionId
 * @param key
 * @param val
 * @returns {*}
 */
addRegionMetadata = function (regionId, key, val) {
    check(regionId, String);
    check(key, String);

    if (Regions.findOne({"_id": regionId}) == null) {
        return null;
    }
    var metadata = {};
    metadata[REGION_METADATA_KEY] = key;
    metadata[REGION_METADATA_VAL] = val;
    var pushCmd = {};
    pushCmd[REGION_METADATA] = metadata;

    var changed = Regions.update({"_id": regionId}, {$push: pushCmd});
    if (changed > 0) {
        return regionId;
    }
    return null; //Nothing changed
};