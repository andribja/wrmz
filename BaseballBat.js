// ======
// BaseballBat
// ======

"use strict";
/* jshint browser: true, devel: true, globalstrict: true */

// A generic contructor which accepts an arbitrary descriptor object
function BaseballBat(descr) {
    // Common inherited setup logic from Entity
    this.setup(descr);
    
    //this.initAngle = this.rotation - Math.PI / 2;
    //this.initX = this.cx;
    //this.initY = this.cy;
    this.ammo = 99;
    this.scalablePower = true;
    
    this.sprite = g_sprites.baseballBat;
    this.weaponSprite = this.sprite;
    this.width = this.sprite.width; 
    this.height = this.sprite.height; 
    this.weaponSprite.offsetX = 6;
    this.weaponSprite.offsetY = 5;
}

BaseballBat.prototype = new Weapon();

BaseballBat.prototype.batSound = new Audio(
    "sounds/batSound.wav");

// Initial, inheritable, default values
BaseballBat.prototype.name = 'BaseballBat';
BaseballBat.prototype.damageRadius = 50;
BaseballBat.prototype.countdown = 0.3;

BaseballBat.prototype.update = function (du) {    
    spatialManager.unregister(this);
    
    this.countdown -= du/SECS_TO_NOMINALS;

    // try to hit worm when the countdown ends
    if(this.countdown < 0) {
        this.batSound.play();
        this.damageWorms();
        return entityManager.KILL_ME_NOW;
    } else {
        // swing bat
        this.rotation -= this.orientation*0.4;
    }
    
    spatialManager.register(this);

};

BaseballBat.prototype.damageWorms = function() {
    // only damage worms that you are facing, worms behind you won't get hit
    entityManager.damageWormsHalfRadius(this.cx, this.cy, this.damageRadius, this.initVel, this.orientation);
};