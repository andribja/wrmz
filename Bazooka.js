// ======
// Bazooka
// ======

"use strict";

/* jshint browser: true, devel: true, globalstrict: true */

// A generic contructor which accepts an arbitrary descriptor object
function Bazooka(descr) {
     // Common inherited setup logic from Weapon
    this.setup(descr);
    // Make a noise when I am created (i.e. fired)
    //this.fireSound.play();
    
    this.initAngle = this.rotation - Math.PI / 2;
    this.initX = this.cx;
    this.initY = this.cy;

    this.sprite = g_sprites.Bazooka;
}

Bazooka.prototype = new Weapon();

// HACKED-IN AUDIO (no preloading)
//Bazooka.prototype.fireSound = new Audio(
 //   "sounds/BazookaFire.ogg");
//Bazooka.prototype.zappedSound = new Audio(
  //  "sounds/BazookaZapped.ogg");
    
// Initial, inheritable, default values
Bazooka.prototype.damageRadius = 40;
Bazooka.prototype.t = 0;

Bazooka.prototype.update = function (du) {
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

Bazooka.prototype.getRadius = function() {
    return this.sprite.width / 2 * this.sprite.scale;
}