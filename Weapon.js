// ======
// Weapon
// ======

"use strict";

/* jshint browser: true, devel: true, globalstrict: true */

// A generic contructor which accepts an arbitrary descriptor object
function Weapon(descr) {
    // Common inherited setup logic from Entity
    this.setup(descr);

}

Weapon.prototype = new Entity();

// HACKED-IN AUDIO (no preloading)
//Weapon.prototype.fireSound = new Audio(
 //   "sounds/WeaponFire.ogg");
//Weapon.prototype.zappedSound = new Audio(
  //  "sounds/WeaponZapped.ogg");
    
// Initial, inheritable, default values
Weapon.prototype.name = 'Bazooka';
Weapon.prototype.damageRadius = 40;
Weapon.prototype.t = 0;
Weapon.prototype.KEY_FIRE = 13;
Weapon.prototype.launchVel = 2;

Weapon.prototype.fire = function(cx, cy, rotation) {
    //if (eatKey(this.KEY_FIRE)) {
    
        var dX = +Math.sin(rotation);
        var dY = -Math.cos(rotation);
        var launchDist = 10;
        
        var relVel = this.launchVel;
        var relVelX = dX * relVel;
        var relVelY = dY * relVel;

        entityManager.fireWeapon(
           cx + dX * launchDist, cy + dY * launchDist,
           relVelX, relVelY,
           rotation,
           this.name);
    //}
}

Weapon.prototype.checkIfHitMap = function () {
    var cx = parseInt(this.cx);
    var cy = parseInt(this.cy);
    if(entityManager._map[0].getAlphaAt(cx, cy) !== 0) return true;
};

Weapon.prototype.checkIfHitWorm = function() {
    var cx = parseInt(this.cx);
    var cy = parseInt(this.cy);

};

Weapon.prototype.damageMap = function () {
    var cx = parseInt(this.cx);
    var cy = parseInt(this.cy);
    entityManager.destroyMap(cx, cy, this.damageRadius);
};

Weapon.prototype.damageWorms = function () {
    entityManager.damageWorms(this.cx, this.cy, this.damageRadius);
}

Weapon.prototype.render = function (ctx) {
    this.sprite.drawCentredAt(
        ctx, this.cx - OFFSET_X, this.cy - OFFSET_Y, this.rotation
    );
};
