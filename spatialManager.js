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
                if(circleToCircle(obj, collidingEntity))
                    return collidingEntity;
            }

            // Am I colliding with a box?
            if(collidingEntity.getBoundingBox()) {
                if(circleToBox(obj, collidingEntity))
                    return collidingEntity;
            }
            
            // Am I colliding with the map?
            
        }
        
        // Is my bounding object a circle?
        if(obj.getBoundingBox()) {
            
            // Am I colliding with another box?
            if(collidingEntity.getBoundingBox()) {
                if(boxToBox(obj, collidingEntity)) 
                    return collidingEntity;
            }
            
            // Am I colliding with a circle?
            if(collidingEntity.getRadius()) {
                if(circleToBox(collidingEntity, obj))
                    return collidingEntity;
            }
        }
    }
    
    /// HELPER FUNCTIONS ///
        
    // circle1, circle2:    objects with a bounding circle
    function circleToCircle(circle1, circle2) {
        var pos1 = circle1.getPos();
        var pos2 = circle2.getPos();
        
        var distSq = util.distSq(pos1.posX, pos1.posY, pos2.posX, pos2.posY);
        
        if(distSq <= util.square(circle1.getRadius() + circle2.getRadius())) {
            return true;
        }
    }
    
    // box1, box2:  objects with a bounding box
    function boxToBox(box1, box2) {
        var bb1 = box1.getBoundingBox();
        var bb2 = box2.getBoundingBox();
        
        var dx = box1.getPos().posX - box2.getPos().posX;
        var dy = box1.getPos().posX - box2.getPos().posY;
        
        var w = bb1.width/2 + bb2.width/2;
        var h = bb1.height/2 + bb2.height/2;
        
        if(Math.abs(dx) <= w && Math.abs(dy) <= h)
            return true;
    }
    
    // circle:  object  with a bounding circle
    // box:     object with a bounding box
    function circleToBox(circle, box) {
        var cPosX = circle.getPos().posX;
        var cPosY = circle.getPos().posY;
        
        var bPosX = box.getPos().posX;
        var bPosY = box.getPos().posY;
        
        var bb = box.getBoundingBox();
        
        var distSq = util.distSq(cPosX, cPosY, bPosX, bPosY);
        var dist = Math.sqrt(distSq) - circle.getRadius();

        var dx = posX - pos.posX;
        var dy = posY - pos.posY;

        var theta = Math.atan(dy, dx);

        var dxx = dist * Math.cos(theta);
        var dyy = dist * Math.sin(theta);

        if(Math.abs(dxx) <= bb.width/2 && Math.abs(dyy) <= bb.height/2) {
            return  true;
        }
    }

},

render: function(ctx) {
    var oldStyle = ctx.strokeStyle;
    ctx.strokeStyle = "red";

    for (var ID in this._entities) {
        var e = this._entities[ID];
        
        if(e.getRadius())
            util.strokeCircle(ctx, e.cx - OFFSET_X, e.cy - OFFSET_Y, e.getRadius(), 'red');

        if(e.getBoundingBox()) {
            var box = e.getBoundingBox();
            var h = box.height;
            var w = box.width;

            util.strokeBox(ctx, e.cx - w/2 - OFFSET_X, e.cy - h/2 - OFFSET_Y, w, h, 'red');
        }

    }
    ctx.strokeStyle = oldStyle;
}

}
