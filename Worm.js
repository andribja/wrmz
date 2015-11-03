// ==========
// Worm STUFF
// ==========

"use strict";

/* jshint browser: true, devel: true, globalstrict: true */

/*
0        1         2         3         4         5         6         7         8
12345678901234567890123456789012345678901234567890123456789012345678901234567890
*/


// A generic contructor which accepts an arbitrary descriptor object
function Worm(descr) {

    // Common inherited setup logic from Entity
    this.setup(descr);

    this.rememberResets();
    
    // Default sprite, if not otherwise specified
    this.sprite = this.sprite || g_sprites.worm;
    this.width = this.sprite.width;
    this.height = this.sprite.height;
    // Set normal drawing scale, and warp state off
    this._scale = 1;
    this._isWarping = false;
};

Worm.prototype = new Entity();

Worm.prototype.rememberResets = function () {
    // Remember my reset positions
    this.reset_cx = this.cx;
    this.reset_cy = this.cy;
    this.reset_rotation = this.rotation;
};

Worm.prototype.KEY_LEFT = 'A'.charCodeAt(0);
Worm.prototype.KEY_RIGHT  = 'D'.charCodeAt(0);
Worm.prototype.KEY_ROTATEGUN_L   = 'W'.charCodeAt(0);
Worm.prototype.KEY_ROTATEGUN_R  = 'S'.charCodeAt(0);

Worm.prototype.KEY_FIRE   = ' '.charCodeAt(0);

// Initial, inheritable, default values
Worm.prototype.rotation = 0;
Worm.prototype.cx = 200;
Worm.prototype.cy = 200;
Worm.prototype.velX = 0;
Worm.prototype.velY = 0;
Worm.prototype.launchVel = 2;
Worm.prototype.numSubSteps = 1;
/*
// HACKED-IN AUDIO (no preloading)
Worm.prototype.warpSound = new Audio(
    "sounds/WormWarp.ogg");

Worm.prototype.warp = function () {

    this._isWarping = true;
    this._scaleDirn = -1;
    this.warpSound.play();
    
    // Unregister me from my old posistion
    // ...so that I can't be collided with while warping
    spatialManager.unregister(this);
};

Worm.prototype._updateWarp = function (du) {

    var SHRINK_RATE = 3 / SECS_TO_NOMINALS;
    this._scale += this._scaleDirn * SHRINK_RATE * du;
    
    if (this._scale < 0.2) {
    
        this._moveToASafePlace();
        this.halt();
        this._scaleDirn = 1;
        
    } else if (this._scale > 1) {
    
        this._scale = 1;
        this._isWarping = false;
        
        // Reregister me from my old posistion
        // ...so that I can be collided with again
        spatialManager.register(this);
        
    }
};

Worm.prototype._moveToASafePlace = function () {

    // Move to a safe place some suitable distance away
    var origX = this.cx,
        origY = this.cy,
        MARGIN = 40,
        isSafePlace = false;

    for (var attempts = 0; attempts < 100; ++attempts) {
    
        var warpDistance = 100 + Math.random() * g_canvas.width /2;
        var warpDirn = Math.random() * consts.FULL_CIRCLE;
        
        this.cx = origX + warpDistance * Math.sin(warpDirn);
        this.cy = origY - warpDistance * Math.cos(warpDirn);
        
        this.wrapPosition();
        
        // Don't go too near the edges, and don't move into a collision!
        if (!util.isBetween(this.cx, MARGIN, g_canvas.width - MARGIN)) {
            isSafePlace = false;
        } else if (!util.isBetween(this.cy, MARGIN, g_canvas.height - MARGIN)) {
            isSafePlace = false;
        } else {
            isSafePlace = !this.isColliding();
        }

        // Get out as soon as we find a safe place
        if (isSafePlace) break;
        
    }
};
*/

Worm.prototype.update = function (du) {

    
    // Unregister and check for death?

    // Move if buttons are being pressed
    this.maybeMove();

    // Handle firing
    this.maybeFireBullet();

    //  Register?

};

Worm.prototype.maybeMove = function() {
    // Check if worm collides with map
console.log(this.width);
    // 
};

/*
Worm.prototype.computeSubStep = function (du) {
    
    var thrust = this.computeThrustMag();

    // Apply thrust directionally, based on our rotation
    var accelX = +Math.sin(this.rotation) * thrust;
    var accelY = -Math.cos(this.rotation) * thrust;
    
    accelY += this.computeGravity();

    this.applyAccel(accelX, accelY, du);
    
    this.wrapPosition();
    
    if (thrust === 0 || g_allowMixedActions) {
        this.updateRotation(du);
    }
};
*/



var NOMINAL_GRAVITY = 0.12;

Worm.prototype.computeGravity = function () {
    return g_useGravity ? NOMINAL_GRAVITY : 0;
};
/*
var NOMINAL_THRUST = +0.2;
var NOMINAL_RETRO  = -0.1;

Worm.prototype.computeThrustMag = function () {
    
    var thrust = 0;
    
    if (keys[this.KEY_THRUST]) {
        thrust += NOMINAL_THRUST;
    }
    if (keys[this.KEY_RETRO]) {
        thrust += NOMINAL_RETRO;
    }
    
    return thrust;
};

Worm.prototype.applyAccel = function (accelX, accelY, du) {
    
    // u = original velocity
    var oldVelX = this.velX;
    var oldVelY = this.velY;
    
    // v = u + at
    this.velX += accelX * du;
    this.velY += accelY * du; 

    // v_ave = (u + v) / 2
    var aveVelX = (oldVelX + this.velX) / 2;
    var aveVelY = (oldVelY + this.velY) / 2;
    
    // Decide whether to use the average or not (average is best!)
    var intervalVelX = g_useAveVel ? aveVelX : this.velX;
    var intervalVelY = g_useAveVel ? aveVelY : this.velY;
    
    // s = s + v_ave * t
    var nextX = this.cx + intervalVelX * du;
    var nextY = this.cy + intervalVelY * du;
    
    // bounce
    if (g_useGravity) {

    var minY = g_sprites.Worm.height / 2;
    var maxY = g_canvas.height - minY;

    // Ignore the bounce if the Worm is already in
    // the "border zone" (to avoid trapping them there)
    if (this.cy > maxY || this.cy < minY) {
        // do nothing
    } else if (nextY > maxY || nextY < minY) {
            this.velY = oldVelY * -0.9;
            intervalVelY = this.velY;
        }
    }
    
    // s = s + v_ave * t
    this.cx += du * intervalVelX;
    this.cy += du * intervalVelY;
};
*/
Worm.prototype.maybeFireBullet = function () {

    if (keys[this.KEY_FIRE]) {
    
        var dX = +Math.sin(this.rotation);
        var dY = -Math.cos(this.rotation);
        var launchDist = this.getRadius() * 1.2;
        
        var relVel = this.launchVel;
        var relVelX = dX * relVel;
        var relVelY = dY * relVel;

        entityManager.fireBullet(
           this.cx + dX * launchDist, this.cy + dY * launchDist,
           this.velX + relVelX, this.velY + relVelY,
           this.rotation);
           
    }
    
};
/*
Worm.prototype.getRadius = function () {
    return (this.sprite.width / 2) * 0.9;
};

Worm.prototype.takeBulletHit = function () {
    this.warp();
};

Worm.prototype.reset = function () {
    this.setPos(this.reset_cx, this.reset_cy);
    this.rotation = this.reset_rotation;
    
    this.halt();
};

Worm.prototype.halt = function () {
    this.velX = 0;
    this.velY = 0;
};

var NOMINAL_ROTATE_RATE = 0.1;

Worm.prototype.updateRotation = function (du) {
    if (keys[this.KEY_ROTATEGUN_L]) {
        this.rotation -= NOMINAL_ROTATE_RATE * du;
    }
    if (keys[this.KEY_ROTATEGUN_R]) {
        this.rotation += NOMINAL_ROTATE_RATE * du;
    }
};
*/
Worm.prototype.render = function (ctx) {
    var origScale = this.sprite.scale;
    // pass my scale into the sprite, for drawing
    this.sprite.scale = this._scale;
    this.sprite.drawWrappedCentredAt(
    ctx, this.cx, this.cy, this.rotation
    );
    this.sprite.scale = origScale;
};
