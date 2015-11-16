// ==========
// Worm-Tombstone STUFF
// ==========

"use strict";

/* jshint browser: true, devel: true, globalstrict: true */

// A generic contructor which accepts an arbitrary descriptor object
function Tombstone(x, y) {
	console.log("Create new tombstone");
	//this.setup(descr);

	this.cx = x; this.cy = y - 10;
	this.tombstoneSprite = g_sprites.Tombstone;
	this.width = this.tombstoneSprite.width; 
	this.height = this.tombstoneSprite.height;

	this._scale = 1;

	spatialManager.register(this);
};

Tombstone.prototype = new Entity();
Tombstone.prototype.velY = 0;

Tombstone.prototype.update = function(du){

	spatialManager.unregister(this);

	//Apply gravity if needed
	this.applyAccel(du);

	spatialManager.register(this);
};

Tombstone.prototype.applyAccel = function(du){

	var oldVelY = this.velY;

    // Activate gravity if tombstone's not standing on solid ground
    if(!this.horizontalEdgeCollidesWithMap(this.cx-this.width/2, this.cx+this.width/2, this.cy+this.height/2))
        this.velY += this.computeGravity() * du;

    var aveVelY = (oldVelY + this.velY) / 2;
    var nextY = this.cy + oldVelY * du; 

    console.log("this.cx: " + this.cx + "this.cy: " + this.cy);
    // next position of the worm's bounding box
    var nextLx = this.cx - this.width/2;
    var nextRx = this.cx + this.width/2;
    var nextTopY = nextY - this.height/2;
    var nextBottomY = nextY + this.height/2;

    console.log("nextLX, nextRX, nextBottomY: " + nextLx + ", " + nextRx + ", " + nextBottomY);

    // Land on the ground
    if(this.horizontalEdgeCollidesWithMap(nextLx, nextRx, nextBottomY)){
    	console.log("vely 0");
        this.velY = 0;
    }

    // Move
    this.cy = nextY;
};

var NOMINAL_GRAVITY = 0.2;

Tombstone.prototype.computeGravity = function () {
    return g_useGravity ? NOMINAL_GRAVITY : 0;
};

Tombstone.prototype.horizontalEdgeCollidesWithMap = function(x1, x2, y){
    //check if the line between (x1,y) and (x2,y) collides with the map 
    return entityManager._map[0].horiLineCollidesWithMap(x1, x2, y);
};

Tombstone.prototype.render = function(ctx){
	var origScale = this.tombstoneSprite.scale;
    // pass my scale into the sprite, for drawing
    this.tombstoneSprite.scale = this._scale;
    this.tombstoneSprite.drawCentredAt(ctx, this.cx - OFFSET_X, 
                                    this.cy - OFFSET_Y, 0);
    this.tombstoneSprite.scale = origScale;
};