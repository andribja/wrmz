// ======
// Dynamite
// ======

"use strict";

/* jshint browser: true, devel: true, globalstrict: true */

// A generic contructor which accepts an arbitrary descriptor object
function Dynamite(descr) {
    // Common inherited setup logic from Entity
    this.setup(descr);
    // Make a noise when I am created (i.e. fired)
    //this.fireSound.play();
    
    this.initAngle = this.rotation - Math.PI / 2;
    this.initX = this.cx;
    this.initY = this.cy;
    this.ammo = 2; 
    this.sprite = g_sprites.Dynamite;
    this.weaponSprite = this.sprite;
    this.weaponSprite.offsetX = 5;
    this.weaponSprite.offsetY = 5;

    this.width = this.sprite.width; 
    this.height = this.sprite.height; 

    this.scalablePower = false;
}

Dynamite.prototype = new Weapon();

// HACKED-IN AUDIO (no preloading)
//Dynamite.prototype.fireSound = new Audio(
 //   "sounds/DynamiteFire.ogg");
//Dynamite.prototype.zappedSound = new Audio(
  //  "sounds/DynamiteZapped.ogg");
    
// Initial, inheritable, default values
Dynamite.prototype.name = 'Dynamite';
Dynamite.prototype.damageRadius = 80;
Dynamite.prototype.t = 5;

Dynamite.prototype.update = function (du) {

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

Dynamite.prototype.applyGravity = function (du) {
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

Dynamite.prototype.computeGravity = function () {
    return g_useGravity ? NOMINAL_GRAVITY : 0;
};

Dynamite.prototype.render = function(ctx) {
    
    Weapon.prototype.render.call(this, ctx);

    // Draw countdown
    ctx.save();
    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';
    ctx.font = '10pt Arial Bold';
    ctx.fillText(Math.ceil(this.t),this.cx - OFFSET_X, this.cy-20 - OFFSET_Y);
    ctx.restore();
};

Dynamite.prototype.getRadius = function() {
    return this.sprite.width / 2;
}
