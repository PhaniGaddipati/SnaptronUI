/**
 * Created by Phani on 2/10/2016.
 */
/**
 * Contains previously requested query data.
 * The ids to the junctions in the result set is stored
 * in reference to Junctions.
 * @type {Mongo.Collection}
 */
Queries = new Mongo.Collection("queries");
Junctions = new Mongo.Collection("junctions");