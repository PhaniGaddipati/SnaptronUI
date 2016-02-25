/**
 * Created by Phani on 2/13/2016.
 */
Meteor.publish("queries", function (queryId) {
    var queryID = Meteor.call("processQuery", queryId);
    if (!queryID) {
        // Failed
        return [];
    }

    var query = Queries.findOne({_id: queryID});
    var filteredJunctions = getJunctionsForQuery(query);
    console.log("Found and published " + filteredJunctions.count() + " junctions for id " + queryID);

    return [Queries.find({_id: queryID}), filteredJunctions]
});

/**
 * Returns a cursor for the junctions from the given
 * query with filters applied
 * @param query
 */
function getJunctionsForQuery(query) {
    var queryRegionJunctions = query[QUERY_JUNCTIONS];
    var filters = query[QUERY_FILTERS];
    var selector = {
        "_id": {
            "$in": queryRegionJunctions
        }
    };

    // Add query filters to the selector
    for (var i = 0; i < filters.length; i++) {
        var filterDoc = filters[i];
        var field = filterDoc[QUERY_FILTER_FIELD];
        var op = filterDoc[QUERY_FILTER_OP];
        var val = filterDoc[QUERY_FILTER_VAL];

        var restriction = {};
        restriction[op] = val;
        selector[field] = restriction;

        //TODO Will there ever be multiple filters for the same field?
    }

    return Junctions.find(selector);
}