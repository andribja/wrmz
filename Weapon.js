// ======
// Weapon
// ======

"use strict";

/* jshint browser: true, devel: true, globalstrict: true */

// A generic contructor which accepts an arbitrary descriptor object
function Weapon(descr) {
    // Common inherited setup logic from Entity
    this.setup(descr);
    // Make a noise when I am created (i.e. fired)
    //this.fireSound.play();
    
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
Weapon.prototype.damageRadius = 40;
Weapon.prototype.t = 0;

Weapon.prototype.rotation = 0;
Weapon.prototype.cx = 200;
Weapon.prototype.cy = 200;
Weapon.prototype.velX = 1;
Weapon.prototype.velY = 1;


Weapon.prototype.update = function (du) {
    // TODO: YOUR STUFF HERE! --- Unregister and check for death???
    
    // did it hit something?
    var mapHit = this.checkIfHitMap();
    if(mapHit) {
        this.damageMap();
        this.damageWorms();
        return entityManager.KILL_ME_NOW;
    }

    // has it left the frame?
    if(this.cx > g_canvas.width || this.cx < 0 || 
        this.cy > g_canvas.height)
        return entityManager.KILL_ME_NOW;

    this.t += du;
    if(this.type === 'projectile') {
        this.cx = this.initX + this.initVel*this.t*Math.cos(this.initAngle);
        this.cy = this.initY + this.initVel*this.t*Math.sin(this.initAngle) + 
                    0.5*NOMINAL_GRAVITY*util.square(this.t);
    } else {
        this.cx += this.velX * du;
        this.cy += this.velY * du;

        this.rotation += 1 * du;
        this.rotation = util.wrapRange(this.rotation, 0, consts.FULL_CIRCLE);
    }

    
    /*
    // Handle collisions
    //
    var hitEntity = this.findHitEntity();
    if (hitEntity) {
        var canTakeHit = hitEntity.takeWeaponHit;
        if (canTakeHit) canTakeHit.call(hitEntity); 
        return entityManager.KILL_ME_NOW;
    }*/
    
    // TODO: YOUR STUFF HERE! --- (Re-)Register?

};

Weapon.prototype.checkIfHitMap = function () {
    var cx = parseInt(this.cx);
    var cy = parseInt(this.cy);
    if(entityManager._map[0].getAlphaAt(cx, cy) !== 0) return true;
};

Weapon.prototype.damageMap = function () {
    var cx = parseInt(this.cx);
    var cy = parseInt(this.cy);
    entityManager._map[0].destroy(cx, cy, this.damageRadius);
};

Weapon.prototype.damageWorms = function () {
    entityManager.damageWorms(this.cx, this.cy, this.damageRadius);
}

Weapon.prototype.getRadius = function () {
    return 4;
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
