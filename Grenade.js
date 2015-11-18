// ======
// Grenade
// ======

"use strict";

/* jshint browser: true, devel: true, globalstrict: true */

// A generic contructor which accepts an arbitrary descriptor object
function Grenade(descr) {
    // Common inherited setup logic from Entity
    this.setup(descr);
    // Make a noise when I am created (i.e. fired)
    //this.fireSound.play();
    
    this.initAngle = this.rotation - Math.PI / 2;
    this.initX = this.cx;
    this.initY = this.cy;
    
    this.sprite = g_sprites.Grenade;
    this.weaponSprite = this.sprite;
    this.width = this.sprite.width; 
    this.height = this.sprite.height; 
    this.weaponSprite.offsetX = 5;
    this.weaponSprite.offsetY = 5;
}

Grenade.prototype = new Weapon();

// HACKED-IN AUDIO (no preloading)
//Grenade.prototype.fireSound = new Audio(
 //   "sounds/GrenadeFire.ogg");
//Grenade.prototype.zappedSound = new Audio(
  //  "sounds/GrenadeZapped.ogg");
    
// Initial, inheritable, default values
Grenade.prototype.name = 'Grenade';
Grenade.prototype.damageRadius = 40;
Grenade.prototype.countdown = 5;

Grenade.prototype.update = function (du) {

    spatialManager.unregister(this);
    
    this.countdown -= du/SECS_TO_NOMINALS;

    // explode when the countdown ends
    if(this.countdown < 0) {
        this.damageMap();
        this.damageWorms();
        return entityManager.KILL_ME_NOW;
    }

    this.move(du);
 /*
    // Apply gravity to the flying object
    this.t += du;
    var nextX = this.initX + this.initVel*this.t*Math.cos(this.initAngle);
    var nextY = this.initY + this.initVel*this.t*Math.sin(this.initAngle) + 
                    0.5*NOMINAL_GRAVITY*util.square(this.t);

    // did it hit something?
    var mapHit = entityManager._map[0].circleCollidesWithMap(nextX, nextY, 1);
    if(mapHit) {
        //alert("grenade hit map");
        //this.initVel = -1;
        this.initVel = 0;
        //nextY = 10;
    }

    this.cx = nextX;
    this.cy = nextY;
 /*
    // Handle collisions
    //
    var hitEntity = this.findHitEntity();
    if (hitEntity) {
        var canTakeHit = hitEntity.takeWeaponHit;
        if (canTakeHit) 
            canTakeHit.call(hitEntity); 
        
        return entityManager.KILL_ME_NOW;
    }*/
    
    
    spatialManager.register(this);

};

Grenade.prototype.move = function (du) {

    this.velY += this.computeGravity() * du;

    var nextX = this.cx + this.velX * du;
    var nextY = this.cy + this.velY * du; 
    
    // Land on the map
    var mapHit = entityManager._map[0].circleCollidesWithMap(nextX, nextY, 1);
    if(mapHit) {
        this.velX = 0;
        this.velY = 0;
    }

    this.cx = this.cx + this.velX * du;
    this.cy = this.cy + this.velY * du;
};

var NOMINAL_GRAVITY = 0.2;

Grenade.prototype.computeGravity = function () {
    return NOMINAL_GRAVITY;
};

Grenade.prototype.fire = function(cx, cy, rotation, power) {
    // unit vector components in the distance of 'rotation'
    var dX = Math.sin(rotation);
    var dY = -Math.cos(rotation);

    // Calculate the velocity and fire weapon
    this.velX = dX*power*3;
    this.velY = dY*power*3;

    entityManager.fireWeapon(
        cx + dX, cy + dY,
        this.velX, this.velY,
        rotation,
        this.name);
};

Grenade.prototype.render = function(ctx) {
    
    Weapon.prototype.render.call(this, ctx);

    // Draw countdown
    ctx.save();
    ctx.fillStyle = 'black';
    ctx.textAlign = 'center';
    ctx.font = '10pt Arial Bold';
    ctx.fillText(Math.ceil(this.countdown),this.cx - OFFSET_X, this.cy-20 - OFFSET_Y);
    ctx.restore();
};

Grenade.prototype.getRadius = function() {
    return this.sprite.width / 2;
}
