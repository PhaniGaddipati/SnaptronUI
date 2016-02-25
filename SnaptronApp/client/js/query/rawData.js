/**
 * Created by Phani on 2/25/2016.
 */

Template.rawData.helpers({
    'rawData': function () {
        return getJunctionTSV();
    }
});

function getJunctionTSV() {
    var junctions = Junctions.find().fetch();
    var cols = Object.keys(junctions[0]);
    var lines = junctions.map(function (jnct) {
        var vals = [];
        for (var i = 0; i < cols.length; i++) {
            vals.push(jnct[cols[i]]);
        }
        return vals.join("\t");
    });
    return cols.join("\t") + "<br>" + lines.join("<br>");
}