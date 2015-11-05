// ======
// Weapon
// ======

"use strict";

/* jshint browser: true, devel: true, globalstrict: true */

/*
0        1         2         3         4         5         6         7         8
12345678901234567890123456789012345678901234567890123456789012345678901234567890
*/


// A generic contructor which accepts an arbitrary descriptor object
function Weapon(descr) {
    // Common inherited setup logic from Entity
    this.setup(descr);
    // Make a noise when I am created (i.e. fired)
    //this.fireSound.play();
    
/*
    // Diagnostics to check inheritance stuff
    this._WeaponProperty = true;
    console.dir(this);
*/
    this.fullLifeSpan = this.lifeSpan;

    if(this.type === 'projectile') {
        this.initAngle = this.rotation - Math.PI / 2;
        this.initX = this.cx;
        this.initY = this.cy;
    }
}

Weapon.prototype = new Entity();

// HACKED-IN AUDIO (no preloading)
//Weapon.prototype.fireSound = new Audio(
 //   "sounds/WeaponFire.ogg");
//Weapon.prototype.zappedSound = new Audio(
  //  "sounds/WeaponZapped.ogg");
    
// Initial, inheritable, default values
Weapon.prototype.rotation = 0;
Weapon.prototype.cx = 200;
Weapon.prototype.cy = 200;
Weapon.prototype.velX = 1;
Weapon.prototype.velY = 1;

// Convert times from milliseconds to "nominal" time units.
Weapon.prototype.lifeSpan = 3000 / 16.6;

Weapon.prototype.update = function (du) {
    // TODO: YOUR STUFF HERE! --- Unregister and check for death
    var t = this.fullLifeSpan - this.lifeSpan;
    this.lifeSpan -= du;
    //if (this.lifeSpan < 0) return entityManager.KILL_ME_NOW;

    if(this.cx > g_canvas.width || this.cx < 0 || 
        this.cy > g_canvas.height)
        return entityManager.KILL_ME_NOW;

    if(this.type === 'projectile') {
        this.cx = this.initX + this.initVel*t*Math.cos(this.initAngle);
        this.cy = this.initY + this.initVel*t*Math.sin(this.initAngle) + 
                    0.5*NOMINAL_GRAVITY*util.square(t);
    } else {
        this.cx += this.velX * du;
        this.cy += this.velY * du;

        this.rotation += 1 * du;
        this.rotation = util.wrapRange(this.rotation, 0, consts.FULL_CIRCLE);
    }

    //this.wrapPosition();
    
    // TODO? NO, ACTUALLY, I JUST DID THIS BIT FOR YOU! :-)
    //
    // Handle collisions
    //
    var hitEntity = this.findHitEntity();
    if (hitEntity) {
        var canTakeHit = hitEntity.takeWeaponHit;
        if (canTakeHit) canTakeHit.call(hitEntity); 
        return entityManager.KILL_ME_NOW;
    }
    
    // TODO: YOUR STUFF HERE! --- (Re-)Register

};

Weapon.prototype.getRadius = function () {
    return 4;
};

Weapon.prototype.takeWeaponHit = function () {
    this.kill();
    
    // Make a noise when I am zapped by another Weapon
    this.zappedSound.play();
};

Weapon.prototype.render = function (ctx) {
    var fadeThresh = Weapon.prototype.lifeSpan / 3;

    if (this.lifeSpan < fadeThresh) {
        ctx.globalAlpha = this.lifeSpan / fadeThresh;
    }

    g_sprites.weapon1.drawCentredAt(
        ctx, this.cx, this.cy, this.rotation
    );

    ctx.globalAlpha = 1;
};
