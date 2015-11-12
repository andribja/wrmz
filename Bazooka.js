// ======
// Bazooka
// ======

"use strict";

/* jshint browser: true, devel: true, globalstrict: true */

// A generic contructor which accepts an arbitrary descriptor object
function Bazooka(descr) {
    // Common inherited setup logic from Entity
    this.setup(descr);
    // Make a noise when I am created (i.e. fired)
    //this.fireSound.play();
    
    
    this.initAngle = this.rotation - Math.PI / 2;
    this.initX = this.cx;
    this.initY = this.cy;
    
}

Bazooka.prototype = new Entity();

// HACKED-IN AUDIO (no preloading)
//Bazooka.prototype.fireSound = new Audio(
 //   "sounds/BazookaFire.ogg");
//Bazooka.prototype.zappedSound = new Audio(
  //  "sounds/BazookaZapped.ogg");
    
// Initial, inheritable, default values
Bazooka.prototype.damageRadius = 40;
Bazooka.prototype.t = 0;

Bazooka.prototype.rotation = 0;
Bazooka.prototype.cx = 200;
Bazooka.prototype.cy = 200;
Bazooka.prototype.velX = 1;
Bazooka.prototype.velY = 1;


Bazooka.prototype.update = function (du) {

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
    if (hitEntity) {
        var canTakeHit = hitEntity.takeWeaponHit;
        if (canTakeHit) 
            canTakeHit.call(hitEntity); 
        
        return entityManager.KILL_ME_NOW;
    }
    
    
    spatialManager.register(this);

};

Bazooka.prototype.checkIfHitMap = function () {
    var cx = parseInt(this.cx);
    var cy = parseInt(this.cy);
    if(entityManager._map[0].getAlphaAt(cx, cy) !== 0) return true;
};

Bazooka.prototype.damageMap = function () {
    var cx = parseInt(this.cx);
    var cy = parseInt(this.cy);
    entityManager.destroyMap(cx, cy, this.damageRadius);
};

Bazooka.prototype.damageWorms = function () {
    entityManager.damageWorms(this.cx, this.cy, this.damageRadius);
}

Bazooka.prototype.getRadius = function () {
    return 4;
};

Bazooka.prototype.render = function (ctx) {
    var fadeThresh = Bazooka.prototype.lifeSpan / 3;

    if (this.lifeSpan < fadeThresh) {
        ctx.globalAlpha = this.lifeSpan / fadeThresh;
    }

    g_sprites.Bazooka.drawCentredAt(
        ctx, this.cx - OFFSET_X, this.cy - OFFSET_Y, this.rotation
    );

    ctx.globalAlpha = 1;
};
