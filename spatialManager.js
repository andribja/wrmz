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

findEntityInRange: function(obj) {
    var posX = obj.getPos().posX;
    var posY = obj.getPos().posY;

    for(var ID in this._entities) {
        var collidingEntity = this._entities[ID];
        var pos = collidingEntity.getPos();

        // Is my bounding object a circle?
        if(obj.getRadius) {

            // Am I colliding with another circle
            if(collidingEntity.getRadius()) {
                var distSq = util.distSq(posX, posY, pos.posX, pos.posY);

                if(distSq <= util.square(obj.getRadius() + collidingEntity.getRadius())) {
                    return collidingEntity;
                }
            }

            // Am I colliding with a box?
            if(collidingEntity.getBoundingBox()) {
                var box = collidingEntity.getBoundingBox();
                var distSq = util.distSq(posX, posY, pos.posX, pos.posY);
                var dist = Math.sqrt(distSq) - obj.getRadius();

                var dx = posX - pos.posX;
                var dy = posY - pos.posY;

                var theta = Math.atan(dy, dx);

                var dxx = dist * Math.cos(theta);
                var dyy = dist * Math.sin(theta);

                if(Math.abs(dxx) <= box.width/2 && Math.abs(dyy) <= box.height/2) {
                    return  collidingEntity;
                }

            }
        };

        /*
        var distSq = util.distSq(posX, posY, pos.posX, pos.posY);

        if(distSq <= util.square(radius + collidingEntity.getRadius())) {
            return collidingEntity;
        }
        */
    }

},

render: function(ctx) {
    var oldStyle = ctx.strokeStyle;
    ctx.strokeStyle = "red";

    for (var ID in this._entities) {
        var e = this._entities[ID];
        
        if(e.getRadius())
            util.strokeCircle(ctx, e.cx, e.cy, e.getRadius(), 'red');

        if(e.getBoundingBox()) {
            var box = e.getBoundingBox();
            var h = box.height;
            var w = box.width;

            util.strokeBox(ctx, e.cx - w/2, e.cy - h/2, w, h, 'red');
        }

    }
    ctx.strokeStyle = oldStyle;
}

}
