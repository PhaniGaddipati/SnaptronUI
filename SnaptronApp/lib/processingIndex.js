/**
 * Created by Phani on 3/11/2016.
 */

SnapApp.Processors.Index = {
    "Sample Normalized Difference": {
        "function": "sampleNormalizedDifference",
        "description": "Computes the normalized difference ratio (B-A)/(A+B) of sample expression across 2 groups, and returns the top K results",
        "inputGroups": ["A", "B"],
        "limit": true
    }
};