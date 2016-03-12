/**
 * Created by Phani on 2/19/2016.
 */

SnapApp.QueryDB = {};

Meteor.methods({
    /**
     * Creates a query document and returns the ID after being inserted to the DB.
     * @param regionsStr User inputted regions query
     * @param filterFields Array of the included fields for filters
     * @param filterOpStrs Array of the chosen operators
     * @param filterVals Array of the user entered values
     * @returns {*} The ID of the inserted query, or null if it failed
     */
    "submitQuery": function (regionsStr, filterFields, filterOpStrs, filterVals) {
        check(regionsStr, String);
        check(filterFields, [String]);
        check(filterOpStrs, [String]);

        //Pre-process region string
        regionsStr = regionsStr.toLowerCase();
        regionsStr = regionsStr.replace(/\s+and\s+/g, ","); //"and" to comma
        regionsStr = regionsStr.replace(/\s+/g, ""); //Strip whitespace
        var regions = regionsStr.split(",");

        if (regions.length == 0) {
            return null;
        }

        //Assemble filters
        var filters = [];
        for (var i = 0; i < filterFields.length; i++) {
            var filter = getFilterFromFields(filterFields[i], filterOpStrs[i], filterVals[i]);
            if (filter != null) {
                filters.push(filter);
            }
        }

        //Attempt insert
        return SnapApp.QueryDB.newQuery(regions, filters);
    },

    /**
     * Copes the given query, such that the owner will
     * reflect the current user (or null).
     * @param queryId
     * @returns The id of the newly created query
     */
    "copyQuery": function (queryId) {
        var newQuery = SnapApp.QueryDB.getQuery(queryId);
        delete newQuery["_id"];
        delete newQuery[QRY_OWNER];
        var id = SnapApp.QueryDB.insertQuery(newQuery);
        return id;
    },

    /**
     * If the owner is logged in, remove the given
     * filter from the query
     * @param queryId
     * @param filter
     * @returns queryId on success, null on failure
     */
    "deleteFilterFromQuery": function (queryId, filter) {
        if (SnapApp.QueryDB.isQueryCurrentUsers(queryId)) {
            return SnapApp.QueryDB.removeQueryFilter(queryId, filter);
        }
        return null;
    },

    /**
     * If the owner is logged in, add a filter with the given
     * fields to the query.
     *
     * @param queryId
     * @param field
     * @param opStr
     * @param filter
     * @returns queryId on success, null on failure
     */
    "addFilterToQuery": function (queryId, field, opStr, filter) {
        if (SnapApp.QueryDB.isQueryCurrentUsers(queryId)) {
            return SnapApp.QueryDB.addQueryFilter(queryId, field, opStr, filter);
        }
        return null;
    },

    /**
     * If the owner is logged in, add a region to the query.
     * @param queryId
     * @param regionId
     * @returns queryId on success, null on failure
     */
    "addRegionToQuery": function (queryId, regionId) {
        if (SnapApp.QueryDB.isQueryCurrentUsers(queryId)) {
            return SnapApp.QueryDB.addQueryRegion(queryId, regionId);
        }
        return null;
    },

    /**
     * If the owner is logged in, remove a region by ID from the query.
     * @param queryId
     * @param regionId
     * @returns queryId on success, null on failure
     */
    "deleteRegionFromQuery": function (queryId, regionId) {
        if (SnapApp.QueryDB.isQueryCurrentUsers(queryId)) {
            return SnapApp.QueryDB.removeQueryRegion(queryId, regionId);
        }
        return null;
    },
    /**
     * If the current user owns the query, add the group.
     * @param queryId
     * @param groupName
     * @param jncts
     * @returns {*}
     */
    "addGroupToQuery": function (queryId, groupName, jncts) {
        if (SnapApp.QueryDB.isQueryCurrentUsers(queryId)) {
            return SnapApp.QueryDB.addGroupToQuery(queryId, groupName, jncts);
        }
        return null;
    },

    /**
     * If the user has permission, remove the group from the query.
     * @param queryId
     * @param groupId
     * @returns {*}
     */
    "deleteGroupFromQuery": function (queryId, groupId) {
        if (SnapApp.QueryDB.isQueryCurrentUsers(queryId)) {
            return SnapApp.QueryDB.removeGroupFromQuery(queryId, groupId);
        }
        return null;
    }
});

/**
 * Returns the query with the given ID, or null.
 * @param queryId
 * @returns {any}
 */
SnapApp.QueryDB.getQuery = function (queryId) {
    check(queryId, String);
    return Queries.findOne({"_id": queryId});
};

/**
 * Checks whether the queryId exists.
 * @param queryId
 * @returns {boolean} whether the queryId was found
 */
SnapApp.QueryDB.hasQuery = function (queryId) {
    check(queryId, String);
    return Queries.find({"_id": queryId}, {"limit": 1}).count() > 0;
};

/**
 * Finds a query by ID, and returns the cursor.
 * @param queryId
 * @returns {*|DOMElement|{}|5625|any|Mongo.Cursor}
 */
SnapApp.QueryDB.findQuery = function (queryId) {
    return Queries.find({"_id": queryId});
};

/**
 * Inserts a new query with the given regions and filters, returns the generated ID.
 * The currently logged in user is assigned as the owner.
 *
 * @param regionIds
 * @param filters
 * @returns {820|1027|*|any}
 */
SnapApp.QueryDB.newQuery = function (regionIds, filters) {
    check(regionIds, [String]);

    var queryDoc = {};
    if (regionIds == null) {
        queryDoc[QRY_REGIONS] = [];
    } else {
        queryDoc[QRY_REGIONS] = regionIds;
    }
    if (filters == null) {
        queryDoc[QRY_FILTERS] = [];
    }
    else {
        queryDoc[QRY_FILTERS] = filters;
    }
    queryDoc[QRY_GROUPS] = [];
    return SnapApp.QueryDB.insertQuery(queryDoc);
};

/**
 * Inserts a query into the collection. Before inserting,
 * the created date is set as now, and the owner is set as the
 * currently logged in user.
 *
 * Additionally, the queryId is added to the current user.
 *
 * @param queryDoc
 * @returns {820|1027|*} The newly inserted query ID
 */
SnapApp.QueryDB.insertQuery = function (queryDoc) {
    queryDoc[QRY_CREATED_DATE] = new Date();
    queryDoc[QRY_OWNER]        = Meteor.userId();
    var id                     = Queries.insert(queryDoc);
    SnapApp.UserDB.addQueryToUser(Meteor.userId(), id);
    console.log("Inserted new query " + id + " with owner " + queryDoc[QRY_OWNER]);
    return id;
};

/**
 * Add a region to the given query (by ID). Returns queryId on success,
 * and null on failure.
 *
 * @param queryId ID of query to add to
 * @param regionId Region id to add to the query
 * @returns {*} queryId or null
 */
SnapApp.QueryDB.addQueryRegion = function (queryId, regionId) {
    check(queryId, String);
    check(regionId, String);

    var pushCmd          = {};
    pushCmd[QRY_REGIONS] = regionId;

    var changed = Queries.update({"_id": queryId}, {$addToSet: pushCmd});
    if (changed > 0) {
        console.log("Inserted region " + regionId + " into " + queryId);
        return queryId;
    }
    return null; //Nothing changed
};

/**
 * Removes a region by ID from the given query.
 * @param queryId
 * @param regionId
 * @returns {*} queryId on success, null on failure
 */
SnapApp.QueryDB.removeQueryRegion = function (queryId, regionId) {
    check(regionId, String);
    var pullCmd          = {};
    pullCmd[QRY_REGIONS] = regionId;
    var changed          = Queries.update(queryId, {$pull: pullCmd});
    if (changed > 0) {
        console.log("Removed region " + regionId + " from " + queryId);
        return queryId;
    }
    return null;
};

/**
 * Adds a filter to the given query (by ID), and returns queryId on success,
 * and null on failure.
 *
 * @param queryId ID of query to add to
 * @param field The field to filter
 * @param opStr The operator string (<,>,=,...)
 * @param val The value of the filter
 * @returns {*} queryId or null
 */
SnapApp.QueryDB.addQueryFilter = function (queryId, field, opStr, val) {
    check(queryId, String);
    check(field, String);
    check(opStr, String);
    check(val, Number);

    var filterDoc = getFilterFromFields(field, opStr, val);
    if (filterDoc != null) {
        var pushCmd          = {};
        pushCmd[QRY_FILTERS] = filterDoc;

        var changed = Queries.update({"_id": queryId}, {$addToSet: pushCmd});
        if (changed > 0) {
            console.log("Inserted filter into " + queryId);
            return queryId;
        }
    }
    return null;
};

/**
 * Removes a filter from the given query.
 * @param queryId
 * @param filter
 * @returns {*} queryId on success, null on failure
 */
SnapApp.QueryDB.removeQueryFilter = function (queryId, filter) {
    check(queryId, String);
    var pullCmd          = {};
    pullCmd[QRY_FILTERS] = filter;
    var changed          = Queries.update(queryId, {$pull: pullCmd});
    if (changed > 0) {
        console.log("Removed filter from " + queryId);
        return queryId;
    }
    return null;
};

/**
 * Adds a new group of junctions to the query.
 *
 * @param queryId
 * @param groupName
 * @param junctions
 * @returns {*} The new groupId
 */
SnapApp.QueryDB.addGroupToQuery = function (queryId, groupName, junctions) {
    check(queryId, String);
    check(groupName, String);
    check(junctions, [String]);

    if (groupName == null || groupName.trim() == "") {
        groupName = "Untitled"
    }
    groupName = groupName.trim();
    if (junctions.length == 0) {
        return null;
    }
    var groupDoc              = {};
    groupDoc["_id"]           = new Meteor.Collection.ObjectID().valueOf();
    groupDoc[QRY_GROUP_NAME]  = groupName;
    groupDoc[QRY_GROUP_JNCTS] = junctions;

    var pushCmd         = {};
    pushCmd[QRY_GROUPS] = groupDoc;

    var changed = Queries.update(queryId, {$push: pushCmd});
    if (changed > 0) {
        console.log("Inserted new group " + groupDoc["_id"] + " into " + queryId);
        return groupDoc["_id"];
    }
    return null;
};

/**
 * Removes the given group by ID from the query.
 * @param queryId
 * @param groupId
 * @returns {*}
 */
SnapApp.QueryDB.removeGroupFromQuery = function (queryId, groupId) {
    check(queryId, String);
    check(groupId, String);

    var pullCmd         = {};
    pullCmd[QRY_GROUPS] = {"_id": groupId};

    var changed = Queries.update(queryId, {$pull: pullCmd});
    if (changed > 0) {
        console.log("Removed group " + groupId + " from " + queryId);
        return queryId;
    }
    return null;
};

/**
 * Returns all groups in an array from the given query.
 * @param queryId
 * @returns {*}
 */
SnapApp.QueryDB.getGroupsFromQuery = function (queryId) {
    check(queryId, String);
    var query = SnapApp.QueryDB.getQuery(queryId);
    if (query == null) {
        return null;
    }

    return query[QRY_GROUPS];
};

/**
 * Get a group by ID from a query by ID
 * @param queryId
 * @param groupId
 * @returns {*}
 */
SnapApp.QueryDB.getGroupFromQuery = function (queryId, groupId) {
    check(queryId, String);
    check(groupId, String);

    var group;
    var groups = SnapApp.QueryDB.getGroupsFromQuery(queryId);
    for (var i = 0; i < groups.length; i++) {
        if (groups[i]["_id"] == groupId) {
            group = groups[i];
            break;
        }
    }
    return group;
};


/**
 * Adds a new processor to the query.
 *
 * @param queryId
 * @param type
 * @param inputGroups
 * @returns {*} The new processorId
 */
SnapApp.QueryDB.addProcessorToQuery = function (queryId, type, inputGroups, results) {
    check(queryId, String);
    check(type, String);

    var processorDoc                         = {};
    processorDoc["_id"]                      = new Meteor.Collection.ObjectID().valueOf();
    processorDoc[QRY_PROCESSOR_TYPE]         = type;
    processorDoc[QRY_PROCESSOR_INPUT_GROUPS] = inputGroups;
    processorDoc[QRY_PROCESSOR_RESULTS]      = results;

    var pushCmd             = {};
    pushCmd[QRY_PROCESSORS] = processorDoc;

    var changed = Queries.update(queryId, {$push: pushCmd});
    if (changed > 0) {
        console.log("Inserted new processor " + processorDoc["_id"] + " into " + queryId);
        return processorDoc["_id"];
    }
    return null;
};

/**
 * Removes the given processor by ID from the query.
 * @param queryId
 * @param processorId
 * @returns {*}
 */
SnapApp.QueryDB.removeProcessorFromQuery = function (queryId, processorId) {
    check(queryId, String);
    check(processorId, String);

    var pullCmd             = {};
    pullCmd[QRY_PROCESSORS] = {"_id": processorId};

    var changed = Queries.update(queryId, {$pull: pullCmd});
    if (changed > 0) {
        console.log("Removed processor " + processorId + " from " + queryId);
        return queryId;
    }
    return null;
};

/**
 * Returns all processors in an array from the given query.
 * @param queryId
 * @returns {*}
 */
SnapApp.QueryDB.getProcessorsFromQuery = function (queryId) {
    check(queryId, String);
    var query = SnapApp.QueryDB.getQuery(queryId);
    if (query == null) {
        return null;
    }

    return query[QRY_PROCESSORS];
};


/**
 * Get a processor by ID from a query by ID
 * @param queryId
 * @param processorId
 * @returns {*}
 */
SnapApp.QueryDB.getProcessorFromQuery = function (queryId, processorId) {
    check(queryId, String);
    check(processorId, String);

    var group;
    var processors = SnapApp.QueryDB.getProcessorsFromQuery(queryId);
    for (var i = 0; i < processors.length; i++) {
        if (processors[i]["_id"] == processorId) {
            group = processors[i];
            break;
        }
    }
    return group;
};

/**
 * Checks whether the logged in user is the owner for the given query.
 * If nobody is logged in, this will always return false.
 *
 * @param queryId
 * @returns {boolean} Whether the current user is the owner
 */
SnapApp.QueryDB.isQueryCurrentUsers = function (queryId) {
    if (Meteor.userId() == null) {
        return false;
    }
    return SnapApp.QueryDB.getQuery(queryId)[QRY_OWNER] == Meteor.userId();
};
