/*

spatialManager.js

A module which handles spatial lookup, as required for...
e.g. general collision detection.

*/

"use strict";

/* jshint browser: true, devel: true, globalstrict: true */

/*
0        1         2         3         4         5         6         7         8
12345678901234567890123456789012345678901234567890123456789012345678901234567890
*/

var spatialManager = {

// "PRIVATE" DATA

_nextSpatialID : 1, // make all valid IDs non-falsey (i.e. don't start at 0)

_entities : {},

// "PRIVATE" METHODS
//
// <none yet>


// PUBLIC METHODS

getNewSpatialID : function() {
    
    return this._nextSpatialID++;
},

register: function(entity) {
    var spatialID = entity.getSpatialID();

    this._entities[spatialID] = entity;
},

unregister: function(entity) {
    var spatialID = entity.getSpatialID();

    delete this._entities[spatialID];
},

findEntityInRange: function(posX, posY, radius) {

    for(var ID in this._entities) {
        var collidingEntity = this._entities[ID];
        var pos = collidingEntity.getPos();
        var distSq = util.distSq(posX, posY, pos.posX, pos.posY);

        if(distSq <= util.square(radius + collidingEntity.getRadius())) {
            return collidingEntity;
        }
    }

},

render: function(ctx) {
    var oldStyle = ctx.strokeStyle;
    ctx.strokeStyle = "red";

    for (var ID in this._entities) {
        var e = this._entities[ID];
        
        util.strokeCircle(ctx, e.cx, e.cy, e.getRadius());
    }
    ctx.strokeStyle = oldStyle;
}

}
