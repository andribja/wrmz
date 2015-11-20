// ======
// Dynamite
// ======

"use strict";
/* jshint browser: true, devel: true, globalstrict: true */

// A generic contructor which accepts an arbitrary descriptor object
function Dynamite(descr) {
    // Common inherited setup logic from Entity
    this.setup(descr);
   
    this.ammo = 2; 
    this.scalablePower = false;

    this.sprite = g_sprites.Dynamite;
    this.weaponSprite = this.sprite;
    this.weaponSprite.offsetX = 5;
    this.weaponSprite.offsetY = 5;

    this.width = this.sprite.width; 
    this.height = this.sprite.height; 
}

Dynamite.prototype = new Weapon();

// HACKED-IN AUDIO (no preloading)
Dynamite.prototype.fireSound = new Audio(
    "sounds/dynamite.wav");

// Initial, inheritable, default values
Dynamite.prototype.name = 'Dynamite';
Dynamite.prototype.damageRadius = 80;
Dynamite.prototype.countdown = 5;

Dynamite.prototype.update = function (du) {

    spatialManager.unregister(this);
    
    this.countdown -= du/SECS_TO_NOMINALS

    // explode when the countdown ends
    if(this.countdown < 0) {
        this.fireSound.play();
        this.damageMap();
        this.damageWorms();
        return entityManager.KILL_ME_NOW;
    }

    this.applyGravity(du);
    
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

    // Move if it hasn't landed yet
    this.cy = this.cy + this.velY * du;
};


var NOMINAL_GRAVITY = 0.2;

Dynamite.prototype.computeGravity = function () {
    return NOMINAL_GRAVITY;
};

Dynamite.prototype.render = function(ctx) {
    Weapon.prototype.render.call(this, ctx);
    Weapon.prototype.renderCountdown.call(this, ctx);
};
