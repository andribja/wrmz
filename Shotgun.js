// ======
// Shotgun
// ======

"use strict";

/* jshint browser: true, devel: true, globalstrict: true */

// A generic contructor which accepts an arbitrary descriptor object
function Shotgun(descr) {
     // Common inherited setup logic from Weapon
    this.setup(descr);
    // Make a noise when I am created (i.e. fired)
    //this.explosionSound.play();
    
    this.initAngle = this.rotation - Math.PI / 2;
    this.initX = this.cx;
    this.initY = this.cy;
    this.ammo = 9;

    this.sprite = g_sprites.Shotgun;
    this.weaponSprite = this.sprite;
    this.weaponSprite.scale = 0.06;
    this.weaponSprite.offsetX = 4;
    this.weaponSprite.offsetY = 5;

    this.scalablePower = true;

    this.fireSound = new Audio("sounds/shotgunFire.wav");
}

Shotgun.prototype = new Weapon();

// HACKED-IN AUDIO (no preloading)
//Shotgun.prototype.explosionSound = new Audio(
 //   "sounds/ShotgunFire.ogg");
//Shotgun.prototype.zappedSound = new Audio(
  //  "sounds/ShotgunZapped.ogg");
    
// Initial, inheritable, default values
Shotgun.prototype.damageRadius = 10;
Shotgun.prototype.t = 0;

Shotgun.prototype.fire = function(cx, cy, rotation, shotPower) {
    if(this.ammo <= 0) return;
    this.fireSound.play();
    Weapon.prototype.fire.call(this, cx, cy, rotation-Math.PI/96, shotPower);
    Weapon.prototype.fire.call(this, cx, cy, rotation-Math.PI/48, shotPower);
    Weapon.prototype.fire.call(this, cx, cy, rotation, shotPower);
    Weapon.prototype.fire.call(this, cx, cy, rotation+Math.PI/48, shotPower);
    Weapon.prototype.fire.call(this, cx, cy, rotation+Math.PI/24, shotPower);
    this.ammo--;
}

Shotgun.prototype.update = function (du) {
    // Keep track of my time alive to allow for a small
    // grace period when initially fired
    if(this.age === undefined)
        this.age = 0;

    this.age++;

    spatialManager.unregister(this);
    
    // did it hit something?
    var mapHit = this.checkIfHitMap();
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
    this.cy = this.initY + this.initVel*this.t*Math.sin(this.initAngle); 
  
    
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

Shotgun.prototype.getRadius = function() {
    return this.sprite.width / 2 * this.sprite.scale;
}
