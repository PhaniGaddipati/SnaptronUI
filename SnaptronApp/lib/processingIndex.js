/**
 * Created by Phani on 3/11/2016.
 *
 * Defines the available processors.
 * Each processor is in the index with the given format:
 *
 *      processorName: {
 *          "function": "meteorMethodName",
 *              // Function to return what should be published for the results template, given the QRY_PROCESSOR object
 *          "publishFunction": function,
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
SnapApp.Processors.PUBLISH_FUNCTION = "publishFunction";
SnapApp.Processors.DESCRIPTION      = "description";
SnapApp.Processors.INPUT_GROUPS     = "inputGroups";

SnapApp.Processors.PARAM       = "param";
SnapApp.Processors.NAME        = "name";
SnapApp.Processors.SELECTS     = "selects";
SnapApp.Processors.SELECT_OPTS = "opts";
SnapApp.Processors.INPUTS      = "inputs";
SnapApp.Processors.TEMPLATE    = "template";

SnapApp.Processors.Index = {
    "Junction Inclusion Ratio": {
        "function": "junctionInclusionRatio",
        "publishFunction": SnapApp.Processors.SND.loadAndPublish,
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
    }
};