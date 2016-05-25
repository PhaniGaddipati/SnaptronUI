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
    var vector = {};
    // Loop through all of the fields in the document
    _.each(_.keys(doc), function (docKey) {
        var words  = getWords(doc[docKey]);
        // Set the weight of all of these words
        var weight = 1;
        if (_.has(fieldWeights, docKey)) {
            weight = fieldWeights[docKey];
        }
        // Make the changes to the doc vector
        _.each(words, function (word) {
            if (_.has(vector, word)) {
                vector[word] += weight;
            } else {
                vector[word] = weight;
            }
        });
    });
    return vector;
};

/**
 * Computes the cosine similarity between the given documents.
 * @param doc1
 * @param doc2
 */
SnapApp.Processors.KCLUSTER.cosineSimilarity = function (doc1, doc2) {
    return vecDotProduct(doc1, doc2) / (vecMagnitude(doc1) * vecMagnitude(doc2));
};

/**
 * Computes the dot product of 2 vectors
 * @param doc1
 * @param doc2
 */
function vecDotProduct(doc1, doc2) {
    var prod = 0;
    _.each(_.intersection(_.keys(doc1), _.keys(doc2)), function (key) {
        prod += doc1[key] * doc2[key];
    });
    return prod;
}

/**
 * Computes the magnitude of a vector.
 * @param doc
 */
function vecMagnitude(doc) {
    var mag = 0;
    _.each(_.keys(doc), function (key) {
        mag += doc[key] * doc[key];
    });
    return Math.sqrt(mag);
}

/**
 * Sanitizes, splits, removes stop words, and stems
 * the text to return a list of words.
 * @param text
 */
function getWords(text) {
    text             = text.replace(/\s+/g, " "); // Multiple spaces to a single space
    text             = text.toLowerCase();
    text             = SnapApp.Processors.KCLUSTER.cleanText(text.toLowerCase());
    var words        = SnapApp.Processors.KCLUSTER.filterWords(text.split(" "));
    var stemmedWords = _.map(words, function (word) {
        return SnapApp.Processors.KCLUSTER.stemWord(word);
    });
    return _.filter(_.uniq(stemmedWords), function (w) {
        return !!w;
    });
}