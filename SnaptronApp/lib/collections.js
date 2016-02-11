/**
 * Created by Phani on 2/10/2016.
 */
/**
 * Contains previously requested query data.
 * The raw response data is cached in compressed form.
 * @type {Mongo.Collection}
 */
Meteor.queriesDB = new Mongo.Collection("queries");

/**
 * An active set of data containing a 'metadata' document
 * as well as a document for each junction
 * @type {Mongo.Collection}
 */
Meteor.currData = new Mongo.Collection("currData");