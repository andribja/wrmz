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

// Initial, inheritable, default values
Weapon.prototype.name = 'Bazooka';
Weapon.prototype.damageRadius = 40;
Weapon.prototype.t = 0;
Weapon.prototype.KEY_FIRE = 13;
Weapon.prototype.launchVel = 2;
Weapon.prototype.ammo = 0;
Weapon.prototype.countdown = 0;

Weapon.prototype.fire = function(cx, cy, rotation, shotPower, orientation) {
        if(this.ammo <= 0) return; 

        var dX = +Math.sin(rotation);
        var dY = -Math.cos(rotation);
        var launchDist = 10;
        
        // Calculate the velocity vector of the weapon
        var relVel = this.launchVel;
        var relVelX = dX * relVel;
        var relVelY = dY * relVel;
        
        var initVel = 10+shotPower;

        entityManager.fireWeapon(
           cx + dX * launchDist, cy + dY * launchDist,
           relVelX, relVelY,
           rotation,
           this.name, initVel, orientation);

        this.ammo--;
        entityManager._timer = this.countdown + 5;
}

Weapon.prototype.checkIfHitMap = function () {
    var cx = parseInt(this.cx);
    var cy = parseInt(this.cy);
    return entityManager._map[0].getAlphaAt(cx, cy) > 0;
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
        ctx, this.cx - OFFSET_X, this.cy - OFFSET_Y, this.rotation);
};

Weapon.prototype.renderCountdown = function (ctx) {
    ctx.save();
    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';
    ctx.font = '10pt Arial Bold';
    ctx.fillText(Math.ceil(this.countdown),this.cx - OFFSET_X, this.cy-20 - OFFSET_Y);
    ctx.restore();
};
