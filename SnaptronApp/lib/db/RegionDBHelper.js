/**
 * Created by Phani on 2/26/2016.
 */

SnapApp.RegionDB = {};
REGION_REFRESH_TIME = 2 * 7 * 24 * 60 * 60 * 1000; // 2 weeks

/**
 * Returns all regions found with an ID in the given array.
 * @param regionIds The IDs to look for
 * @returns {any} Matched documents
 */
SnapApp.RegionDB.getRegions = function (regionIds) {
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
SnapApp.RegionDB.getRegion = function (regionId) {
    check(regionId, String);
    return Regions.findOne({"_id": regionId});
};

SnapApp.RegionDB.getRegionNoJunctions = function (regionId) {
    var fields               = {};
    fields[REGION_JUNCTIONS] = 0;
    return Regions.findOne({"_id": regionId}, {"fields": fields});
};

SnapApp.RegionDB.hasRegion = function (regionId) {
    check(regionId, String);
    return Regions.find({"_id": regionId}, {"limit": 1}).count() > 0;
};

SnapApp.RegionDB.findRegionsForQuery = function (queryId) {
    check(queryId, String);
    var query = SnapApp.QueryDB.getQuery(queryId);
    if (query == null) {
        return null;
    }
    var regionIds = query[QRY_REGIONS];
    return Regions.find({
        "_id": {
            "$in": regionIds
        }
    });
};

SnapApp.RegionDB.findRegionsForQueryNoJunctions = function (queryId) {
    check(queryId, String);
    var query = SnapApp.QueryDB.getQuery(queryId);
    if (query == null) {
        return null;
    }
    var regionIds            = query[QRY_REGIONS];
    var fields               = {};
    fields[REGION_JUNCTIONS] = 0;
    return Regions.find({
        "_id": {
            "$in": regionIds
        }
    }, {
        fields: fields
    });
};

/**
 * Inserts a new region to the DB with the given id.
 * @param regionId
 * @returns {820|1027|*|any}
 */
SnapApp.RegionDB.newRegion = function (regionId) {
    var regionDoc    = SnapApp.RegionDB.newRegionDoc();
    regionDoc["_id"] = regionId;
    console.log("Inserting new region " + regionId);
    return Regions.insert(regionDoc);
};

SnapApp.RegionDB.newRegionDoc = function () {
    var regionDoc                 = {};
    regionDoc["_id"]              = "";
    regionDoc[REGION_JUNCTIONS]   = [];
    regionDoc[REGION_METADATA]    = [];
    regionDoc[REGION_MODELS]      = [];
    regionDoc[REGION_LOADED_DATE] = null;
    return regionDoc;
};

/**
 * Inserts or updates the given region document.
 * @param regionDoc
 * @returns {820|1027|*|any} The newly inserted region id
 */
SnapApp.RegionDB.upsertRegion = function (regionDoc) {
    if (SnapApp.RegionDB.hasRegion(regionDoc["_id"])) {
        console.log("Updating region " + regionDoc["_id"]);
        var setFields = {};
        _.each(_.keys(regionDoc), function (key) {
            if (key !== "_id") {
                setFields[key] = regionDoc[key];
            }
        });
        return Regions.update({"_id": regionDoc["_id"]}, {$set: setFields});
    } else {
        console.log("Inserting region " + regionDoc["_id"]);
        return Regions.insert(regionDoc);
    }
};

/**
 * Set the junctionIDs for the given region.
 * @param regionId
 * @param junctionIds
 * @returns {*}
 */
SnapApp.RegionDB.setRegionJunctions = function (regionId, junctionIds) {
    check(regionId, String);
    check(junctionIds, [String]);

    var newInfo               = {};
    newInfo[REGION_JUNCTIONS] = junctionIds;
    var changed               = Regions.update({"_id": regionId}, {$set: newInfo});
    if (changed > 0) {
        console.log("Updated region " + regionId + " junctions");
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
SnapApp.RegionDB.setRegionLoadedDate = function (regionId, date) {
    check(regionId, String);
    check(date, Match.OneOf(Date, null));

    var newInfo                 = {};
    newInfo[REGION_LOADED_DATE] = date;
    var changed                 = Regions.update({"_id": regionId}, {$set: newInfo});
    if (changed > 0) {
        console.log("Updated region " + regionId + " loaded date to " + date);
        return regionId;
    }
    return null; //Nothing changed
};

/**
 * Sets the region's models to the given array
 * @param regionId
 * @param models
 */
SnapApp.RegionDB.setRegionModels = function (regionId, models) {
    check(regionId, String);
    check(models, [Object]);
    var newInfo            = {};
    newInfo[REGION_MODELS] = models;
    var changed            = Regions.update({"_id": regionId}, {$set: newInfo});
    if (changed > 0) {
        console.log("Updated region " + regionId + " models");
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
SnapApp.RegionDB.addRegionMetadata = function (regionId, key, val) {
    check(regionId, String);
    check(key, String);

    if (Regions.findOne({"_id": regionId}) == null) {
        return null;
    }
    var metadata                  = {};
    metadata[REGION_METADATA_KEY] = key;
    metadata[REGION_METADATA_VAL] = val;
    var pushCmd                   = {};
    pushCmd[REGION_METADATA]      = metadata;

    var changed = Regions.update({"_id": regionId}, {$push: pushCmd});
    if (changed > 0) {
        console.log("Added region " + regionId + " metadata " + key + ":" + val);
        return regionId;
    }
    return null; //Nothing changed
};