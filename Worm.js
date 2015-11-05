// ==========
// Worm STUFF
// ==========

"use strict";

/* jshint browser: true, devel: true, globalstrict: true */

// A generic contructor which accepts an arbitrary descriptor object
function Worm(descr) {

    // Common inherited setup logic from Entity
    this.setup(descr);

    //this.rememberResets();
    
    // Default sprite, if not otherwise specified
    this.wormSprite = this.sprite || g_sprites.worm;
    this.width = this.wormSprite.width;
    this.height = this.wormSprite.height;
    // Set normal drawing scale, and warp state off
    this._scale = 1;

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
//Worm.prototype.numSubSteps = 1;
/*
// HACKED-IN AUDIO (no preloading)
Worm.prototype.warpSound = new Audio(
    "sounds/WormWarp.ogg");

*/

Worm.prototype.update = function (du) {

    //this.computeGravity();

    this.applyAccel(du);
    
    
    // Unregister and check for death?

    // Move if buttons are being pressed
    this.maybeMove();

    this.updateTarget(du);
    // Handle firing

    this.maybeFireWeapon();

    //  Register?

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

};

Worm.prototype.edgeCollidesWithMap = function(y){
    // Get position of worms "box" 
    var xMin = parseInt(this.cx - this.width/2);
    var xMax = parseInt(this.cx + this.width/2);
    //var yBottom = parseInt(y + this.height/2);
    var i = 0;

    // If the bottom of the bounding box doesn't collide with the map
    // We increase i, i is the number of transparent pixels on the bottom of the worm
    for(var j = xMin; j <= xMax; j++){
        if(entityManager._map[0].getAlphaAt(j, y) == 0)
            i++;
    }

    if(i > 7) return false;
    
    else return true;
};

Worm.prototype.canGoUpSlope = function(left){
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

Worm.prototype.canJump = function(){
    // Let the worm jump if its trying to, but only if it is close enough to the ground
    var yBottom = parseInt(this.cy + 5 + this.height/2);
    if(eatKey(this.KEY_JUMP) && this.edgeCollidesWithMap(yBottom)) {
        return true;
    }

    //Check if worm hits anything if he jumps
    //if(this.isOnGround)
    
    var yTop = parseInt(this.cy - this.height/2);
    var xMin = parseInt(this.cx - this.width/2);
    var xMax = parseInt(this.cx + this.width/2);
    var j = 0;

    for(var x = xMin; x <= xMax; x++){
        if(entityManager._map[0].getAlphaAt(x, yTop) != 0){
            j++;
        }
    }
    //if(j>1)

};

//Worm.prototype.


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

var NOMINAL_JUMP = -5;

Worm.prototype.applyAccel = function (du) {
    // u = original velocity
    var oldVelX = this.velX;
    var oldVelY = this.velY;
    
    // v = u + at
    // Let worm fall if he isn't on ground
    var yBottom = parseInt(this.cy + this.height/2);
    if(!this.edgeCollidesWithMap(yBottom))
        this.velY += this.computeGravity() * du;

    // Let the worm jump if its trying to, but only if it is close enough to the ground
    if(this.canJump()) {
        this.velY = NOMINAL_JUMP * du;
    }

    // v_ave = (u + v) / 2
    var aveVelX = (oldVelX + this.velX) / 2;
    var aveVelY = (oldVelY + this.velY) / 2;
    
    // Decide whether to use the average or not (average is best!)
    var intervalVelX = g_useAveVel ? aveVelX : this.velX;
    var intervalVelY = g_useAveVel ? aveVelY : this.velY;
    
    

    // s = s + v_ave * t
    var nextX = this.cx + intervalVelX * du;
    var nextY = this.cy + intervalVelY * du; 
    
    var i=0;
    for(var j = parseInt(nextX-this.width/2); j <= parseInt(nextX+this.width/2); j++){
        if(entityManager._map[0].getAlphaAt(j, parseInt(nextY-this.height/2)) !== 0) {
            i++;
        }
    } 
    if (i>7) {
        nextY = this.cy + NOMINAL_GRAVITY*du;
        if (this.velY<0)this.velY = 0;
    }

    

    // Land on the ground
    var yBottom = parseInt(nextY + this.height/2);
    if(this.edgeCollidesWithMap(yBottom)){
        this.velY = 0;
    }
    else{
        // s = s + v_ave * t
        this.cx = nextX;
        this.cy = nextY;
    }
};

Worm.prototype.maybeFireWeapon = function () {

    if (eatKey(this.KEY_FIRE)) {
    
        var dX = +Math.sin(this.rotation);
        var dY = -Math.cos(this.rotation);
        var launchDist = this.height + 1.2;
        
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
    this.wormSprite.drawCentredAt(
    ctx, this.cx, this.cy, 0
    );
    this.wormSprite.scale = origScale;

    this.targetSprite.scale = this._scale;
    this.targetSprite.drawCentredAt(
    ctx, this.targetCx, this.targetCy, 0
    );
    this.targetSprite.scale = origScale;
    
};
