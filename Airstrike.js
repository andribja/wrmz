// ======
// Weapon
// ======

"use strict";

/* jshint browser: true, devel: true, globalstrict: true */

// A generic contructor which accepts an arbitrary descriptor object
function Airstrike(descr) {
    // Common inherited setup logic from Entity
    this.setup(descr);
    // Make a noise when I am created (i.e. fired)
    //this.fireSound.play();
    
    this.initAngle = this.rotation - Math.PI / 2;
    this.initX = this.cx;
    this.initY = this.cy;

    this.sprite = g_sprites.Bazooka;
}

Airstrike.prototype = new Weapon();

// HACKED-IN AUDIO (no preloading)
//Weapon.prototype.fireSound = new Audio(
 //   "sounds/WeaponFire.ogg");
//Weapon.prototype.zappedSound = new Audio(
  //  "sounds/WeaponZapped.ogg");
    
// Initial, inheritable, default values
Airstrike.prototype.damageRadius = 40;
Airstrike.prototype.t = 0;

Airstrike.prototype.fire = function(cx, cy, rotation) {
    g_mouseAim = true;
}

Airstrike.prototype.update = function (du) {
    console.log("updating Airstrike");
    spatialManager.unregister(this);
    
    // did it hit something?
    var mapHit = this.checkIfHitMap();
    console.log(mapHit);
    if(mapHit) {
        this.damageMap();
        this.damageWorms();
        return entityManager.KILL_ME_NOW;
    }

    // has it left the frame?
    if(this.cx - OFFSET_X > g_canvas.width || this.cx < 0 || 
        this.cy - OFFSET_Y > g_canvas.height)
        return entityManager.KILL_ME_NOW;

    this.t += du;
    this.cx = this.initX + this.initVel*this.t*Math.cos(this.initAngle);
    this.cy = this.initY + this.initVel*this.t*Math.sin(this.initAngle) + 
                    0.5*NOMINAL_GRAVITY*util.square(this.t);
  
    
    // Handle collisions
    //
    var hitEntity = this.findHitEntity();
    if (hitEntity && this.age > 3*du) {
        var canTakeHit = hitEntity.takeWeaponHit;
        if (canTakeHit) 
            hitEntity.takeDamage(this.cx, this.cy, this.damageRadius) 
        
        return entityManager.KILL_ME_NOW;
    }
    
    
    spatialManager.register(this);

};
