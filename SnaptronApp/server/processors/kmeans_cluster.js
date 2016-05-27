/**
 * Created by Phani on 5/25/2016.
 *
 * KMeans Clustering
 *
 * Clusters all of the samples present in the junction group "A"
 * into k groups using the sample meta-data
 *
 * The results in the following format:
 *      {
 *          clusters: [[sampleIds...],[sampleIds...],..],
    *       group: groupId,
    *       k: k
 *       }
 * An array of k arrays with the sampleIds of the samples in the respective groups
 * Expected parameters:
 *      k: The number of groups to cluster into
 *
 * Optional parameters:
 *      None
 *
 */

const MAX_ITERATIONS = 10;

Meteor.methods({
    "clusterSamplesInGroup": function (queryId, inputGroups, params) {
        this.unblock();
        if (!validateInput(inputGroups, params)) {
            return null;
        }
        var grp       = SnapApp.QueryDB.getGroupFromQuery(queryId, inputGroups["A"]);
        var jncts     = SnapApp.JunctionDB.getJunctions(grp[QRY_GROUP_JNCTS]);
        var sampleIds = _.uniq(_.flatten(_.pluck(jncts, JNCT_SAMPLES_KEY)));
        console.log("Loading missing samples before clustering...");
        SnapApp.Snaptron.loadMissingSamples(sampleIds);
        return {
            "clusters": clusterSamples(SnapApp.SampleDB.getSamples(sampleIds), parseInt(params["k"])),
            "group": inputGroups["A"],
            "k": params["k"]
        };
    },
    "clusterSamplesInGroupValidation": function (queryId, inputGroups, params) {
        return validateInput(inputGroups, params);
    }
});

function clusterSamples(samples, k) {
    check(samples, [Object]);
    check(k, Number);
    console.log("Clustering " + samples.length + " samples into " + k + " clusters...");

    if (k <= 0) {
        console.log("Clustering trivial case: k <= 0");
        return [];
    }
    if (k == 1) {
        console.log("Clustering trivial case: k = 1");
        return [_.pluck(samples, "_id")];
    }
    if (k > samples.length) {
        k = samples.length;
    }
    if (k == samples.length) {
        console.log("Clustering trivial case: k = |samples|");
        return _.map(_.pluck(samples, "_id"), function (sampleId) {
            return [sampleId];
        });
    }

    // Generate all document vectors for the samples
    // sampleID maps to the vector
    console.log("Generating document vectors...");
    var vecs = {};
    _.each(samples, function (sample) {
        vecs[sample["_id"]] = SnapApp.Processors.KCLUSTER.getDocumentVector(sample);
    });
    // Pick the initial samples to use as centroids
    console.log("Initializing centroids...");
    var clusters = pickInitialCentroids(vecs, k);
    var itrNum   = 0;
    var changed  = 1;
    // Cluster the samples
    console.log("Starting k-means iterations (max: " + MAX_ITERATIONS + ")");
    while (changed > 0 && itrNum < MAX_ITERATIONS) {
        changed = assignSamples(clusters, vecs);
        updateCentroids(clusters, vecs);
        itrNum++;
    }
    console.log("Done clustering after " + itrNum + " iterations");
    return _.pluck(clusters, "samples");
}

/**
 * Assigns all of the vectors to the nearest
 * centroid.
 * @param clusters
 * @param vecs
 */
function assignSamples(clusters, vecs) {
    var changed = 0;
    // Assign all of the vectors to the closest cluster
    _.each(vecs, function (vec, sampleId) {
        // Find closest cluster
        var sims   = _.map(clusters, function (cluster) {
            return SnapApp.Processors.KCLUSTER.cosineSimilarity(cluster["centroid"], vec);
        });
        var max    = Number.MIN_VALUE;
        var maxIdx = -1;
        _.each(sims, function (s, idx) {
            if (s > max) {
                max    = s;
                maxIdx = idx;
            }
        });
        if (!_.contains(clusters[maxIdx]["samples"], sampleId)) {
            // The sample is moving clusters, first remove it from other cluster
            _.each(clusters, function (cluster) {
                if (_.contains(cluster["samples"], sampleId)) {
                    // Remove it from the other cluster
                    var i = cluster["samples"].indexOf(sampleId);
                    cluster["samples"].splice(i);
                }
            });
            // Add it to the new cluster
            clusters[maxIdx]["samples"].push(sampleId);
            changed++;
        }
    });
    return changed;
}

/**
 * Updates the centroids of all of the clusters,
 * based on the members of each cluster.
 * @param clusters
 * @param vecs
 */
function updateCentroids(clusters, vecs) {
    _.each(clusters, function (cluster) {
        cluster["centroid"] = computeCentroid(_.map(cluster["samples"], function (sampleId) {
            return vecs[sampleId];
        }))
    });
}

/**
 * Computes the centroid of the given vectors.
 * The keyset of the vectors can be different.
 * @param vectors
 * @returns {{}}
 */
function computeCentroid(vectors) {
    var centroid = {};
    _.each(vectors, function (vector) {
        _.each(vector, function (w, word) {
            if (_.has(centroid, word)) {
                centroid[word] += w;
            } else {
                centroid[word] = w;
            }
        })
    });
    _.each(_.keys(centroid), function (w) {
        centroid[w] /= vectors.length;
    });
    return centroid;
}

/**
 * Picks the initial centroids using the K-means++ algorithm.
 * Algorithm taken from Wikipedia.
 *
 * Returns a cluster array
 * Each element is an object with:
 *      centroid: vector of the cluster centroid
 *      samples: samples currently in the cluster
 */
function pickInitialCentroids(vecs, k) {
    var clusters           = [];
    // Step 1: Choose one center uniformly at random from among the data points.
    var randVectorSampleId = _.sample(_.keys(vecs));
    clusters[0]            = {
        centroid: vecs[randVectorSampleId],
        samples: []
    };
    var usedSampleIds      = [randVectorSampleId];
    while (clusters.length < k) {
        // Step 2: For each data point x, compute D(x), the distance between x
        // and the nearest center that has already been chosen.
        var D = {};
        _.each(vecs, function (vec, sampleId) {
            if (!_.contains(usedSampleIds, sampleId)) {
                var distances = _.map(clusters, function (cluster) {
                    // Want a distance metric. Angular distance isn't a proper
                    // distance metric, but we just care about the minimum
                    return 1 - SnapApp.Processors.KCLUSTER.cosineSimilarity(cluster["centroid"], vec);
                });
                D[sampleId]   = _.min(distances);
            }
        });

        // Step 3: Choose one new data point at random as a new center, using
        // a weighted probability distribution where a point x is chosen with
        // probability proportional to D(x)^2.

        // Compute sum(D^2) to normalize
        var totalD2   = _.reduce(D, function (memo, d) {
            return memo + d * d
        });
        // Compute probability density function
        var sampleIds = [];
        var pdf       = [];
        _.each(D, function (d, sampleId) {
            pdf.push(d * d / totalD2);
            sampleIds.push(sampleId);
        });
        // Compute the cumulative density function
        var cdf = [];
        var p   = 0;
        for (var i = 0; i < pdf.length; i++) {
            cdf[i] = p + pdf[i];
        }
        // Pick the new sample
        var rand = Math.random();
        var idx  = 0;
        while (rand > cdf[idx] && idx < (cdf.length - 1)) {
            idx++;
        }
        clusters.push({
            centroid: vecs[sampleIds[idx]],
            samples: []
        });
        usedSampleIds.push(sampleIds[idx]);

        // Step 4: Repeat Steps 2 and 3 until k centers have been chosen.
    }
    return clusters;
}

/**
 * Ensures that the given params are valid
 * @param inputGroups
 * @param params
 * @returns {boolean}
 */
function validateInput(inputGroups, params) {
    if (!_.contains(_.keys(inputGroups), "A")) {
        // Proper input group not present
        return false;
    }
    var k;
    if (!_.contains(_.keys(params), "k")) {
        return false;
    } else {
        k = parseInt(params["k"]);
        if (!_.isFinite(k) || k <= 0) {
            // Invalid k value
            return false;
        }
    }
    return true;
}