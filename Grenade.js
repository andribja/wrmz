// ======
// Grenade
// ======

"use strict";

/* jshint browser: true, devel: true, globalstrict: true */

// A generic contructor which accepts an arbitrary descriptor object
function Grenade(descr) {
    // Common inherited setup logic from Entity
    this.setup(descr);
    // Make a noise when I am created (i.e. fired)
    //this.fireSound.play();
    
    this.initAngle = this.rotation - Math.PI / 2;
    this.initX = this.cx;
    this.initY = this.cy;
    
    this.sprite = g_sprites.Grenade;
    this.width = this.sprite.width; 
    this.height = this.sprite.height; 
}

Grenade.prototype = new Weapon();

// HACKED-IN AUDIO (no preloading)
//Grenade.prototype.fireSound = new Audio(
 //   "sounds/GrenadeFire.ogg");
//Grenade.prototype.zappedSound = new Audio(
  //  "sounds/GrenadeZapped.ogg");
    
// Initial, inheritable, default values
Grenade.prototype.name = 'Grenade';
Grenade.prototype.damageRadius = 40;
Grenade.prototype.t = 5;

Grenade.prototype.update = function (du) {

    spatialManager.unregister(this);
    
    this.t -= du/SECS_TO_NOMINALS

    // explode when the countdown ends
    if(this.t < 0) {
        this.damageMap();
        this.damageWorms();
        return entityManager.KILL_ME_NOW;
    }

    this.applyGravity(du);
 
 /*
    // Handle collisions
    //
    var hitEntity = this.findHitEntity();
    if (hitEntity) {
        var canTakeHit = hitEntity.takeWeaponHit;
        if (canTakeHit) 
            canTakeHit.call(hitEntity); 
        
        return entityManager.KILL_ME_NOW;
    }*/
    
    
    spatialManager.register(this);

};

Grenade.prototype.applyGravity = function (du) {
    this.velY += this.computeGravity() * du;

    var nextY = this.cy + this.velY * du; 
    
    var nextBottomY = nextY + this.height/2;

    // Land on the ground
    if(entityManager._map[0].horiLineCollidesWithMap(this.cx-this.width/2, this.cx+this.width/2, nextBottomY-3)){
        this.velY = 0;
    }

    this.cy = this.cy + this.velY * du;
};

var NOMINAL_GRAVITY = 0.2;

Grenade.prototype.computeGravity = function () {
    return g_useGravity ? NOMINAL_GRAVITY : 0;
};

Grenade.prototype.render = function(ctx) {
    this.sprite.drawCentredAt(
        ctx, this.cx - OFFSET_X, this.cy - OFFSET_Y, this.rotation
    );

    ctx.save();
    ctx.fillStyle = 'black';
    ctx.textAlign = 'center';
    ctx.font = '15pt Arial Bold';
    ctx.fillText(Math.ceil(this.t),this.cx - OFFSET_X, this.cy-30 - OFFSET_Y);
    ctx.restore();
};

Grenade.prototype.getRadius = function() {
    return this.sprite.width / 2;
}
