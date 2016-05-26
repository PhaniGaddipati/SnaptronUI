/**
 * Created by Phani on 3/11/2016.
 *
 * Defines the available processors.
 * Each processor is in the index with the given format:
 *
 *      processorName: {
 *          "function": "meteorMethodName",
 *              // function to validate inputs
 *          "validateFunction" : "meteorMethodName",
 *          "description": "a description of this processor",
 *              // An array of N different groups required, with the given group name
 *          "inputGroups": ["group1", ...],
 *          "selects": [
 *              {
 *                  "param": "variableName",
 *                  "name": "Human readable name of parameter",
 *                  "opts": ["21",...] // Valid options for this parameter
 *              },
 *              ... ],
 *          "inputs": [
 *              {
 *                  "param": "variableName",
 *                  "name": "Human readable name of parameter",
 *              },
 *              ... ],
 *          "template" : "someTemplateName" // The template to render the results
 *      }
 *
 * Selects allow for parameters that must be chosen from a given list of options.
 * inputs present a plain text entry box for the parameter, and will be a user-inputted value.
 *
 * Group options are always displayed first, and selects are always displayed before inputs.
 */

SnapApp.Processors.FUNCTION = "function";
SnapApp.Processors.VALIDATE_FUNCTION = "validateFunction";
SnapApp.Processors.DESCRIPTION       = "description";
SnapApp.Processors.INPUT_GROUPS      = "inputGroups";

SnapApp.Processors.PARAM       = "param";
SnapApp.Processors.NAME        = "name";
SnapApp.Processors.SELECTS     = "selects";
SnapApp.Processors.SELECT_OPTS = "opts";
SnapApp.Processors.INPUTS      = "inputs";
SnapApp.Processors.TEMPLATE    = "template";

SnapApp.Processors.SND = {};

SnapApp.Processors.SND.RESULTS_TOP_K        = "topk";
SnapApp.Processors.SND.RESULTS_TOP_K_SAMPLE = "sample";

SnapApp.Processors.SND.RESULTS_HIST      = "hist";
SnapApp.Processors.SND.RESULT_HIST_START = "start";
SnapApp.Processors.SND.RESULT_HIST_END   = "end";
SnapApp.Processors.SND.RESULT_HIST_COUNT = "count";

SnapApp.Processors.KMEANS = {};

SnapApp.Processors.KMEANS.RESULTS_CLUSTERS = "clusters";
SnapApp.Processors.KMEANS.RESULTS_GROUP    = "group";
SnapApp.Processors.KMEANS.RESULTS_K        = "k";

SnapApp.Processors.Index = {
    "Junction Inclusion Ratio": {
        "function": "junctionInclusionRatio",
        "validateFunction": "junctionInclusionRatioValidation",
        "description": "Computes the junction inclusion ratio (B-A)/(A+B+1) across samples in 2 groups," +
        " and returns a histogram along with the top K results",
        "inputGroups": ["A", "B"],
        "selects": [
            {
                "param": "k",
                "name": "Top K Results",
                "opts": [250, 100, 50, 25, 10]
            }
        ],
        "inputs": [{
            "param": "notes",
            "name": "Notes"
        }],
        "template": "junctionInclusionRatioResults"
    },
    "K-Means Clustering": {
        "function": "clusterSamplesInGroup",
        "validateFunction": "clusterSamplesInGroupValidation",
        "description": "Clusters all of the samples in the group into k clusters, using the sample meta-data",
        "inputGroups": ["A"],
        "selects": [],
        "inputs": [{
            "param": "k",
            "name": "K Clusters"
        }],
        "template": "sampleClusteringResults"
    }
};