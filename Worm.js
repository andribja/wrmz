// ==========
// Worm STUFF
// ==========

"use strict";

/* jshint browser: true, devel: true, globalstrict: true */

// A generic contructor which accepts an arbitrary descriptor object
function Worm(descr) {

    // Common inherited setup logic from Entity
    this.setup(descr);
    
    // Default worm sprite, if not otherwise specified
    this.wormSprite = this.sprite || g_sprites.worm;
    this.width = this.wormSprite.width;
    this.height = this.wormSprite.height;

    // Set normal drawing scale
    this._scale = 1;

    // Create a target
    this.targetSprite = g_sprites.target;
    this.targetCx = this.cx;
    this.targetCy = this.cy - 20;
};

Worm.prototype = new Entity();
Worm.prototype.KEY_LEFT = 'A'.charCodeAt(0);
Worm.prototype.KEY_RIGHT  = 'D'.charCodeAt(0);
Worm.prototype.KEY_ROTATEGUN_L   = 'W'.charCodeAt(0);
Worm.prototype.KEY_ROTATEGUN_R  = 'S'.charCodeAt(0);
Worm.prototype.KEY_JUMP   = ' '.charCodeAt(0);
Worm.prototype.KEY_FIRE   = 13;

// Initial, inheritable, default values
Worm.prototype.rotation = 0;
Worm.prototype.cx = 700;
Worm.prototype.cy = 450;
Worm.prototype.velX = 0;
Worm.prototype.velY = 0;
Worm.prototype.launchVel = 2;
Worm.prototype.health = 100;
Worm.prototype.team = "green";
Worm.prototype.isActive = "false";

/*
// HACKED-IN AUDIO (no preloading)
Worm.prototype.warpSound = new Audio(
    "sounds/WormWarp.ogg");
*/

Worm.prototype.update = function (du) {

    // ToDo: Unregister and check for death?
    
    this.applyAccel(du);

    // Move if buttons are being pressed
    if(!this.isActive) return;
    this.maybeMove();

    // Update the weapon's aim
    this.updateTarget(du);
    
    // Handle firing
    this.maybeFireWeapon();

    // ToDo: Register?
};


Worm.prototype.applyAccel = function (du) {
    // original velocity
    var oldVelX = this.velX;
    var oldVelY = this.velY;
    
    // Activate gravity if worm's not standing on solid ground
    if(!this.horizontalEdgeCollidesWithMap(this.cx-this.width/2, this.cx+this.width/2, this.cy+this.height/2))
        this.velY += this.computeGravity() * du;

    // calculate the average velocity
    var aveVelX = (oldVelX + this.velX) / 2;
    var aveVelY = (oldVelY + this.velY) / 2;
    
    // Apply the velocity to see where the worm will move next
    var nextX = this.cx + aveVelX * du;
    var nextY = this.cy + aveVelY * du; 
    
    // next position of the worm's bounding box
    var nextLx = nextX - this.width/2;
    var nextRx = nextX + this.width/2;
    var nextTopY = nextY - this.height/2;
    var nextBottomY = nextY + this.height/2;

    // prevent worm from jumping up into the map
    if (this.horizontalEdgeCollidesWithMap(nextLx, nextRx, nextTopY)) {
        // it whill hit something, stop moving upwards
        nextY = this.cy + NOMINAL_GRAVITY*du;
        if (this.velY<0)this.velY = 0;
    }

    // Land on the ground
    if(this.horizontalEdgeCollidesWithMap(nextLx, nextRx, nextBottomY)){
        this.velY = 0;
    }

    // now move for real
    this.cx = nextX;
    this.cy = nextY;
};


Worm.prototype.maybeMove = function() {
    // Check if worm collides with map
    if(keys[this.KEY_LEFT]){
        var i = this.canGoUpSlope(true);
        if(i > -Infinity){
            this.cx -= 3;
            this.cy -= i;
        }
    }
    if(keys[this.KEY_RIGHT]){
        var i = this.canGoUpSlope(false);
        if(i > -Infinity){
            this.cx += 3;
            this.cy -= i;
        }
    }

    if(eatKey(this.KEY_JUMP)) {
        this.maybeJump();
    }

};


var NOMINAL_JUMP = -5;

Worm.prototype.maybeJump = function(){
    var yBottom = this.cy + 5 + this.height/2;
    var xLeft = this.cx - this.width/2;
    var xRight = this.cx + this.width/2;

    // The worm can only jump if it is close enough to the ground
    if(this.horizontalEdgeCollidesWithMap(xLeft, xRight, yBottom)) {
        this.velY = NOMINAL_JUMP;
    }
};


Worm.prototype.verticalEdgeCollidesWithMap = function(x, y1, y2){
    //check if the line between (x,y1) and (x,y2) collides with the map 
    return entityManager._map[0].vertLineCollidesWithMap(x, y1, y2);
};

Worm.prototype.horizontalEdgeCollidesWithMap = function(x1, x2, y){
    //check if the line between (x1,y) and (x2,y) collides with the map 
    return entityManager._map[0].horiLineCollidesWithMap(x1, x2, y);
};


Worm.prototype.canGoUpSlope = function(left){
    
    // ToDo: reyna að breyta þannig að við notum föllin úr map

    var yBottom = parseInt(this.cy + this.height/2);
    var yTop = parseInt(this.cy - this.height/2);
    var i = 0; var k = 0; var x;

    // See which side of the worm we need to check 
    if(left)
        x = parseInt(this.cx - this.width/2);
    else
        x = parseInt(this.cx + this.width/2);

    // Count pixels that arent transparent, first only close to the bottom of the worm
    // Then on the whole side of the worm
    for(var j = 0; j <= 5; j++){
        if(entityManager._map[0].getAlphaAt(x, yBottom-j) != 0)
            i++;
    }
    for(var j = yTop; j <= yBottom; j++){
        if(entityManager._map[0].getAlphaAt(x, j) != 0)
            k++;
    }
    
    // We need to figure out which numbers are appropriate here
    // For how many non-transparent pixels are on the side of the worn
    // can the worm move?
    if(i<=7 && k<=10){
        return i;
    }
    return -Infinity;
};


var NOMINAL_ROTATE_RATE = 0.1;

Worm.prototype.updateTargetRotation = function (du) {
    if (keys[this.KEY_ROTATEGUN_L]) {
        this.rotation -= NOMINAL_ROTATE_RATE * du;
    }
    if (keys[this.KEY_ROTATEGUN_R]) {
        this.rotation += NOMINAL_ROTATE_RATE * du;
    }

    this.rotation = util.wrapRange(this.rotation, 0, consts.FULL_CIRCLE);
};

Worm.prototype.updateTarget = function(du){
    this.updateTargetRotation(du);

    var distFromWorm = 40;
    this.targetCx = +Math.sin(this.rotation)*distFromWorm + this.cx;
    this.targetCy = -Math.cos(this.rotation)*distFromWorm + this.cy;
};


var NOMINAL_GRAVITY = 0.2;

Worm.prototype.computeGravity = function () {
    return g_useGravity ? NOMINAL_GRAVITY : 0;
};


Worm.prototype.maybeFireWeapon = function () {

    if (eatKey(this.KEY_FIRE)) {
    
        var dX = +Math.sin(this.rotation);
        var dY = -Math.cos(this.rotation);
        var launchDist = this.width + 1.2;
        
        var relVel = this.launchVel;
        var relVelX = dX * relVel;
        var relVelY = dY * relVel;

        entityManager.fireWeapon(
           this.cx + dX * launchDist, this.cy + dY * launchDist,
           relVelX, relVelY,
           this.rotation,
           'projectile');

    }
    
};


Worm.prototype.takeDamage = function(cx, cy, r) {
    var d = util.dist(this.cx, this.cy, cx, cy);
    if(d > r) return;
    else this.health -= Math.ceil(r-d);
    if(this.health <= 0) this.death();
};

Worm.prototype.death = function() {
    //TODO implement
};

/*
//Hugsanlega gera getBoundingBox
Worm.prototype.getRadius = function () {
    return (this.sprite.width / 2) * 0.9;
};

//Breyta þessu falli
Worm.prototype.takeWeaponHit = function () {
    this.warp();
};

// Þurfum að bæta inn this.reset_cx og cy ef við ætlum að nota þetta
Worm.prototype.reset = function () {
    this.setPos(this.reset_cx, this.reset_cy);
    this.rotation = this.reset_rotation;
    
    this.halt();
};
*/


Worm.prototype.render = function (ctx) {
    var origScale = this.wormSprite.scale;
    // pass my scale into the sprite, for drawing
    this.wormSprite.scale = this._scale;
    this.wormSprite.drawCentredAt(ctx, this.cx + OFFSET_X, 
                                    this.cy + OFFSET_Y, 0);
    this.wormSprite.scale = origScale;

    this.targetSprite.scale = this._scale;
    this.targetSprite.drawCentredAt(ctx, this.targetCx + OFFSET_X, 
                                    this.targetCy + OFFSET_Y, 0);
    this.targetSprite.scale = origScale;
    
    ctx.save();
    ctx.fillStyle = this.team;
    ctx.textAlign = 'center';
    ctx.font = '15pt Arial Bold';
    ctx.fillText(this.health,this.cx + OFFSET_X, this.cy-30 + OFFSET_Y);
};
