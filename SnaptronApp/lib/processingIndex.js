/**
 * Created by Phani on 3/11/2016.
 *
 * Defines the available processors.
 * Each processor is in the index with the given format:
 *
 *      processorName: {
 *          "function": "meteorMethodName",
 *          "description": "a description of this processor",
 *          "inputGroups": ["group1", ...], // An array of N different groups required, with the given group name
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

SnapApp.Processors.FUNCTION     = "function";
SnapApp.Processors.DESCRIPTION  = "description";
SnapApp.Processors.INPUT_GROUPS = "inputGroups";

SnapApp.Processors.PARAM       = "param";
SnapApp.Processors.NAME        = "name";
SnapApp.Processors.SELECTS     = "selects";
SnapApp.Processors.SELECT_OPTS = "opts";
SnapApp.Processors.INPUTS      = "inputs";
SnapApp.Processors.TEMPLATE    = "template";

SnapApp.Processors.Index = {
    "Sample Normalized Difference": {
        "function": "sampleNormalizedDifference",
        "description": "Computes the normalized difference ratio (B-A)/(A+B+2) of sample expression across 2 groups," +
        " and returns a histogram along with the top K results",
        "inputGroups": ["A", "B"],
        "selects": [
            {
                "param": "k",
                "name": "Top K Results",
                "opts": [100, 50, 25, 10]
            }
        ],
        "inputs": [],
        "template": "sampleNormalizedDiffResults"
    }
};