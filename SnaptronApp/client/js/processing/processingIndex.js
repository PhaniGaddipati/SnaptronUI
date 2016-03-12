/**
 * Created by Phani on 3/11/2016.
 */

SnapApp.Processors.Index = {
    "Sample Normalized Difference": {
        "function": SnapApp.Processors.sampleNormalizedDifference,
        "description": "Computes the normalized difference ratio (B-A)/(A+B) of sample expression across 2 groups",
        "inputGroups": ["A", "B"]
    }
};