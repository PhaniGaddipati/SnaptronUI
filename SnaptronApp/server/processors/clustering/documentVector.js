/**
 * Generates a text vector from the given document, with optional field weights.
 * The default weight for a key not found in fieldWeights is 1.
 *
 * @param doc
 * @param fieldWeights
 * @constructor
 */
SnapApp.Processors.KCLUSTER.getDocumentVector = function (doc, fieldWeights) {
    if (!fieldWeights) {
        fieldWeights = {};
    }
    var fieldKeys = _.keys(fieldWeights);
    var vector    = {};
    // Loop through all of the fields in the document
    _.each(_.keys(doc), function (docKey) {
        var words  = getWords(doc[docKey]);
        // Set the weight of all of these words
        var weight = 1;
        if (fieldKeys.contains(docKey)) {
            weight = fieldWeights[docKey];
        }
        // Make the changes to the doc vector
        _.each(words, function (word) {
            if (_.keys(vector).contains(word)) {
                vector[word] += weight;
            } else {
                vector[word] = weight;
            }
        });
    });
    return vector;
};

/**
 * Sanitizes, splits, removes stop words, and stems
 * the text to return a list of words.
 * @param text
 */
function getWords(text) {
    text             = text.replace(/\s+/g, " "); // Multiple spaces to a single space
    text             = text.toLowerCase();
    text             = SnapApp.Processors.KCLUSTER.stopListText(text.toLowerCase());
    var words        = text.split(" ");
    var stemmedWords = _.map(words, function (word) {
        return SnapApp.Processors.KCLUSTER.stemWord(word);
    });
    return _.uniq(stemmedWords);
}