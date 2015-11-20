// ======
// BaseballBat
// ======

"use strict";

/* jshint browser: true, devel: true, globalstrict: true */

// A generic contructor which accepts an arbitrary descriptor object
function BaseballBat(descr) {
    // Common inherited setup logic from Entity
    this.setup(descr);
    // Make a noise when I am created (i.e. fired)
    //this.fireSound.play();
    
    this.initAngle = this.rotation - Math.PI / 2;
    this.initX = this.cx;
    this.initY = this.cy;
    this.ammo = 10;
    
    this.sprite = g_sprites.baseballBat;
    this.weaponSprite = this.sprite;
    this.width = this.sprite.width; 
    this.height = this.sprite.height; 
    this.weaponSprite.offsetX = 6;
    this.weaponSprite.offsetY = 5;

    this.scalablePower = true;
}

BaseballBat.prototype = new Weapon();
BaseballBat.prototype.KEY_LEFT = 'A'.charCodeAt(0);
BaseballBat.prototype.KEY_RIGHT = 'D'.charCodeAt(0);

// HACKED-IN AUDIO (no preloading)
//BaseballBat.prototype.batChosenSound = new Audio(
 //   "sounds/BaseballBatFire.ogg");
BaseballBat.prototype.batSound = new Audio(
    "sounds/batSound.wav");
//BaseballBat.prototype.wormCrying = new Audio(
  //  "sounds/BaseballBatZapped.ogg");
    
// Initial, inheritable, default values
BaseballBat.prototype.name = 'BaseballBat';
BaseballBat.prototype.damageRadius = 50;
BaseballBat.prototype.countdown = 0.3;

BaseballBat.prototype.update = function (du) {    
    spatialManager.unregister(this);
    
    this.countdown -= du/SECS_TO_NOMINALS;

    // explode when the countdown ends
    if(this.countdown < 0) {
        this.batSound.play();
        this.damageWorms();
        return entityManager.KILL_ME_NOW;
    } else {
        this.rotation -= this.orientation*0.4;
    }
    
    spatialManager.register(this);

};

BaseballBat.prototype.damageWorms = function() {
    entityManager.damageWormsHalfRadius(this.cx, this.cy, this.damageRadius, this.initVel, this.orientation);
};

BaseballBat.prototype.getRadius = function() {
    return this.sprite.width / 2;
};
