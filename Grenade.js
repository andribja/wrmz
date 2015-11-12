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
    
}

Grenade.prototype = new Weapon();

// HACKED-IN AUDIO (no preloading)
//Grenade.prototype.fireSound = new Audio(
 //   "sounds/GrenadeFire.ogg");
//Grenade.prototype.zappedSound = new Audio(
  //  "sounds/GrenadeZapped.ogg");
    
// Initial, inheritable, default values
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

Grenade.prototype.render = function (ctx) {
    var fadeThresh = Grenade.prototype.lifeSpan / 3;

    if (this.lifeSpan < fadeThresh) {
        ctx.globalAlpha = this.lifeSpan / fadeThresh;
    }

    g_sprites.Grenade.drawCentredAt(
        ctx, this.cx - OFFSET_X, this.cy - OFFSET_Y, this.rotation
    );

    ctx.globalAlpha = 1;
};
