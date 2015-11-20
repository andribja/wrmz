// ==========
// Worm STUFF
// ==========

"use strict";

/* jshint browser: true, devel: true, globalstrict: true */

// A generic contructor which accepts an arbitrary descriptor object
function Worm(descr) {

    // Common inherited setup logic from Entity
    this.setup(descr);
    
    // Default worm sprite, if not otherwise specified
    this.wormSprite = this.sprite || g_sprites.worm;
    this.width = this.wormSprite.width;
    this.height = this.wormSprite.height;

    // Set normal drawing scale
    this._scale = 1;
    this.flip = 1;

    // Create a target
    this.targetSprite = g_sprites.target;
    this.targetCx = this.cx;
    this.targetCy = this.cy - 20;
    this.weapons = {'bazooka': new Bazooka(), 'grenade': new Grenade(),
        'airstrike': new Airstrike(), 'dynamite': new Dynamite(), 
        'shotgun': new Shotgun(), 'baseballBat' : new BaseballBat()};
    this.currentWeapon = new Bazooka();
};

Worm.prototype = new Entity();
Worm.prototype.KEY_LEFT = 'A'.charCodeAt(0);
Worm.prototype.KEY_RIGHT  = 'D'.charCodeAt(0);
Worm.prototype.KEY_ROTATEGUN_L   = 'S'.charCodeAt(0);
Worm.prototype.KEY_ROTATEGUN_R  = 'W'.charCodeAt(0);
Worm.prototype.KEY_JUMP   = ' '.charCodeAt(0);
Worm.prototype.KEY_FIRE   = 13;

Worm.prototype.KEY_BAZOOKA   = '1'.charCodeAt(0);
Worm.prototype.KEY_GRENADE   = '2'.charCodeAt(0);
Worm.prototype.KEY_AIRSTRIKE = '3'.charCodeAt(0);
Worm.prototype.KEY_DYNAMITE = '4'.charCodeAt(0);
Worm.prototype.KEY_SHOTGUN = '5'.charCodeAt(0);
Worm.prototype.KEY_BASEBALLBAT = '6'.charCodeAt(0);
Worm.prototype.KEY_JETPACK = 'J'.charCodeAt(0);


Worm.prototype.RESET_ROTATION = Math.PI/2;

// Initial, inheritable, default values
Worm.prototype.rotation = Worm.prototype.RESET_ROTATION;
Worm.prototype.cx = 700;
Worm.prototype.cy = 450;
Worm.prototype.velX = 0;
Worm.prototype.velY = 0;
Worm.prototype.health = 100;
Worm.prototype.team = "green";
Worm.prototype.timeLeft = 0;
Worm.prototype.isActive = false;
Worm.prototype.shotPower = 0;
Worm.prototype.takeWeaponHit = true; 
Worm.prototype.fuel = 15;
Worm.prototype.canShoot = false;
Worm.prototype.jetpacking = false;

// TEMPORARY ----
Worm.prototype.shockWaveX=0;
Worm.prototype.shockWaveY=0;
//--------------


// HACKED-IN AUDIO (no preloading)
Worm.prototype.jetpackSound = new Audio(
    "sounds/jetPackLoop2.wav");
Worm.prototype.wormSpringSound = new Audio(
    "sounds/wormSpring.wav");


Worm.prototype.update = function (du) {

    // ToDo: Unregister and check for death?
    spatialManager.unregister(this);

    if(this.isDeadNow) {
        return entityManager.KILL_ME_NOW;
    }

    // Worm may not shoot when jumping or flying
    if(!this.horizontalEdgeCollidesWithMap(this.cx-this.width/2, this.cx+this.width/2, this.cy+this.height/2)) {
        this.canShoot = false;
    } else {
        this.canShoot = true;
    }

    // choose current weapon
    if(this.isActive) {
        this.chooseWeapon();  
    } 

    if(this.cy - this.height >= FULL_HEIGHT)
        this.death();

    if(this.cy + this.height/2 >= entityManager._map[0].height) {
        this.isDrowning = true;
    }
    
    if(this.isDrowning)
        this.applyAccel(du/8);
    else
        this.applyAccel(du);

    // Update the weapon's aim
    this.updateTarget(du);
 
    // Move if buttons are being pressed
    if(this.isActive) {
        this.maybeMove();
       
        // Count the seconds the FIRE key has been pressed, max 2
        if(this.canShoot && keys[this.KEY_FIRE]) {
            this.shotPower += du/SECS_TO_NOMINALS;
            if(this.shotPower > 2) this.shotPower = 2;
        }

        // Handle firing
        this.maybeFireWeapon();
    }
    
    // ToDo: Register?
    spatialManager.register(this);
};

Worm.prototype.applyAccel = function (du) {
    
    // fly if worm is jetpacking
    this.jetPack(du);

    // original velocity
    var oldVelX = this.velX;
    var oldVelY = this.velY;
    
    // Activate gravity if worm's not standing on solid ground
    if(!this.horizontalEdgeCollidesWithMap(this.cx-this.width/2, this.cx+this.width/2, this.cy+this.height/2))
        this.velY += this.computeGravity() * du;

    // calculate the average velocity
    var aveVelX = (oldVelX + this.velX) / 2;
    var aveVelY = (oldVelY + this.velY) / 2;
    
    // Apply the velocity to see where the worm will move next
    var nextX = this.cx + aveVelX * du;
    var nextY = this.cy + aveVelY * du; 
    
    // next position of the worm's bounding box
    var nextLx = nextX - this.width/2;
    var nextRx = nextX + this.width/2;
    var nextTopY = nextY - this.height/2;
    var nextBottomY = nextY + this.height/2;

    // prevent worm from jumping up into the map
    if (this.horizontalEdgeCollidesWithMap(nextLx, nextRx, nextTopY)) {
        // Check if we're above ground
        if(this.cy + this.height/2 < entityManager._map[0].height) {
            // it whill hit something, stop moving upwards
            nextY = this.cy + NOMINAL_GRAVITY*du;
            if (this.velY<0) this.velY = 0;
        }
    }

    // Land on the ground
    if(this.horizontalEdgeCollidesWithMap(nextLx, nextRx, nextBottomY)){
        // Check if we're above ground
        if(this.cy + this.height/2 < entityManager._map[0].height)
            this.velY = 0;
    }

    // Don't walk through walls
    if(this.verticalEdgeCollidesWithMap(nextLx, nextBottomY, nextTopY) ||
        this.verticalEdgeCollidesWithMap(nextRx, nextBottomY, nextTopY)){
        this.velX = 0;
    }

    // now move for real
    this.cx = nextX;
    this.cy = nextY;
};


var NOMINAL_JETPACK = -1;

Worm.prototype.jetPack = function(du) {
    // fly if worm is jetpacking
    if(this.isActive && keys[this.KEY_JETPACK] && this.fuel > 0) {
        this.jetpacking = true;
        this.jetpackSound.play();

        this.velY = NOMINAL_JETPACK;
        this.fuel -= du/SECS_TO_NOMINALS;

        // alternate between images to create an 'animation'
        var random = Math.random();
        if(random < 0.5) this.wormSprite = g_sprites.JetpackFlying;
        else this.wormSprite = g_sprites.Jetpack;
    }
     else {
        this.wormSprite = g_sprites.worm;
        this.jetpacking = false;
    }
}

Worm.prototype.maybeMove = function() {
    // Check if worm collides with map
    if(keys[this.KEY_LEFT]){
        this.flip = -1;

        var i = this.canGoUpSlope(true, this.cx - 3);
        if(i > -Infinity){
            this.cx -= 3;
            this.cy -= i;
        }

        // Refocus
        if(!g_mouseAim)
            entityManager._map[0].focusOn(this.cx, this.cy); 
    }
    if(keys[this.KEY_RIGHT]){
        this.flip = 1;

        var i = this.canGoUpSlope(false, this.cx + 3);
        if(i > -Infinity){
            this.cx += 3;
            this.cy -= i;
        }

        // Refocus
        if(!g_mouseAim)
            entityManager._map[0].focusOn(this.cx, this.cy);   
    }

    if(eatKey(this.KEY_JUMP)) {
        this.maybeJump();
    }
};

Worm.prototype.getXPositionOnCanvas = function(){
    var x = this.cx - OFFSET_X;
    return x;
};

Worm.prototype.getRotation = function() {
    return this.rotation * this.flip;
}

var NOMINAL_JUMP = -5;

Worm.prototype.maybeJump = function(){
    var yBottom = this.cy + 5 + this.height/2;
    var xLeft = this.cx - this.width/2;
    var xRight = this.cx + this.width/2;

    // The worm can only jump if it is close enough to the ground
    if(this.horizontalEdgeCollidesWithMap(xLeft, xRight, yBottom)) {
        this.velY = NOMINAL_JUMP;
    }
};

Worm.prototype.verticalEdgeCollidesWithMap = function(x, y1, y2){
    //check if the line between (x,y1) and (x,y2) collides with the map 
    return entityManager._map[0].vertLineCollidesWithMap(x, y1, y2);
};

Worm.prototype.horizontalEdgeCollidesWithMap = function(x1, x2, y){
    //check if the line between (x1,y) and (x2,y) collides with the map 
    return entityManager._map[0].horiLineCollidesWithMap(x1, x2, y);
};


Worm.prototype.canGoUpSlope = function(left, nextX){
    
    // ToDo: reyna að breyta þannig að við notum föllin úr map 1/2

    var yBottom = parseInt(this.cy + this.height/2);
    var yTop = parseInt(this.cy - this.height/2);
    var i = 0; var k = 0; var x; 

    // See which side of the worm we need to check 
    if(left)
        x = parseInt(nextX - this.width/2);
    else
        x = parseInt(nextX + this.width/2);

    // Count pixels that arent transparent close to the bottom of the worm
    for(var j = 0; j <= 10; j++){
        if(entityManager._map[0].getAlphaAt(x, yBottom-j) != 0)
            i++;
    }

    var wholeEdgeCollides = this.verticalEdgeCollidesWithMap(x, yBottom-12, yTop);
    
    // Return pixels that worm can move upwards
    if(i <= 10 && !wholeEdgeCollides){
        return i;
    }
    return -Infinity;
};


var NOMINAL_ROTATE_RATE = 0.05;

Worm.prototype.updateTargetRotation = function (du) {
    if (keys[this.KEY_ROTATEGUN_L]) {
        this.rotation += NOMINAL_ROTATE_RATE * du;
    }
    if (keys[this.KEY_ROTATEGUN_R]) {
        this.rotation -= NOMINAL_ROTATE_RATE * du;
    }

    this.rotation = util.clampRange(this.rotation, 0, Math.PI);
};

Worm.prototype.updateTarget = function(du){
    if(this.currentWeapon instanceof Airstrike) {
        this.targetCx = g_mouseX + OFFSET_X;
        this.targetCy = g_mouseY + OFFSET_Y;

        this.rotation = this.RESET_ROTATION;
    } else {
        this.updateTargetRotation(du);

        var distFromWorm = 40;
        this.targetCx = +Math.sin(this.getRotation())*distFromWorm + this.cx;
        this.targetCy = -Math.cos(this.getRotation())*distFromWorm + this.cy;
    }
    
};

var NOMINAL_GRAVITY = 0.2;

Worm.prototype.computeGravity = function () {
    return g_useGravity ? NOMINAL_GRAVITY : 0;
};


Worm.prototype.maybeFireWeapon = function () {

    // Fire if the FIRE key has been pressed and released
    if (!keys[this.KEY_FIRE] && this.shotPower > 0) {
        // update the orientation of the baseballBat
        this.currentWeapon.fire(this.cx, this.cy, this.getRotation(), this.shotPower, this.flip);

        // make sure we don't fire again until the FIRE key has been pressed another time
        this.shotPower = 0;
        if(this.currentWeapon instanceof Dynamite) return;
        this.isActive = false;
        /*var dX = +Math.sin(this.rotation);
        var dY = -Math.cos(this.rotation);
        var launchDist = 10;
        
        var relVel = this.launchVel;
        var relVelX = dX * relVel;
        var relVelY = dY * relVel;

        entityManager.fireWeapon(
           this.cx + dX * launchDist, this.cy + dY * launchDist,
           relVelX, relVelY,
           this.rotation,
           this.currentWeapon);*/

    }
    
};

Worm.prototype.shockWave = function(cx, cy, r) {
    // x- and y components of the distance vector between the explosion and worm
    var xDist=this.cx-cx; 
    var yDist=this.cy-cy; 
    var dist = util.dist(cx, cy, this.cx, this.cy);

    // the angle of the vector (the shockwave)
    var angle = Math.atan2(yDist,xDist);
    var dX = Math.cos(angle);
    var dY = Math.sin(angle);

    // if the worm is close enough, it bounces away from the explosion
    var damageRadius = 100;
    if(dist < damageRadius) {
        this.velX = dX * damageRadius/dist;
        this.velY = dY * damageRadius/dist;
    }
};

Worm.prototype.takeDamage = function(cx, cy, r) {
    var d = util.dist(this.cx, this.cy, cx, cy);
    if(d > r) return;
    else this.health -= Math.ceil(r-d);
    if(this.health <= 0) this.death();
};

Worm.prototype.takeBaseballBat = function(cx, cy, power, orientation) {
    this.health -= 20;
    if(this.health <= 0) this.death();
    if(this.velX === 0 && this.velY === 0) {
        this.velX = orientation*2*power;
        this.velY = -3*power;
    }
};

Worm.prototype.drown = function(){
    this.death();
};

Worm.prototype.death = function() {
    
    this.isDeadNow = true;
    entityManager.generateTombstone(this.cx, this.cy);
    spatialManager.unregister(this);
};

/*
//Hugsanlega gera getBoundingBox
Worm.prototype.getRadius = function () {
    return (this.sprite.width / 2) * 0.9;
};

// Þurfum að bæta inn this.reset_cx og cy ef við ætlum að nota þetta
Worm.prototype.reset = function () {
    this.setPos(this.reset_cx, this.reset_cy);
    this.rotation = this.reset_rotation;
    
    this.halt();
};
*/

Worm.prototype.getBoundingBox = function() {
    var box = {};

    box.height = this.height;
    box.width = this.width;

    return box;
};

Worm.prototype.chooseWeapon = function() {
    if(keys[this.KEY_BAZOOKA]) this.currentWeapon = this.weapons.bazooka;
    if(keys[this.KEY_GRENADE]) this.currentWeapon = this.weapons.grenade;
    if(keys[this.KEY_AIRSTRIKE]) this.currentWeapon = this.weapons.airstrike;
    if(keys[this.KEY_DYNAMITE]) this.currentWeapon = this.weapons.dynamite;
    if(keys[this.KEY_SHOTGUN]) this.currentWeapon = this.weapons.shotgun;
    if(keys[this.KEY_BASEBALLBAT]) this.currentWeapon = this.weapons.baseballBat;
};

Worm.prototype.render = function (ctx) {
    var posX = this.cx - OFFSET_X,
        posY = this.cy - OFFSET_Y,
        targetX = this.targetCx - OFFSET_X,
        targetY = this.targetCy - OFFSET_Y;


    // Draw the worm
    var origScale = this.wormSprite.scale;
    // pass my scale into the sprite, for drawing
    this.wormSprite.scale = this._scale;

    ctx.save();
    ctx.translate(posX, posY);
    ctx.scale(this.flip, 1);
    ctx.translate(-posX, -posY);

    this.wormSprite.drawCentredAt(ctx, posX, posY, 0);

    ctx.restore();

    this.wormSprite.scale = origScale;

    if(this.isActive) {
        // Draw the target when aiming
        if(!keys[this.KEY_FIRE] && !this.jetpacking) {
            this.targetSprite.scale = this._scale;
            this.targetSprite.drawCentredAt(ctx, targetX, targetY, 0);
            this.targetSprite.scale = origScale;
        }

        // draw power bar when the weapon gets more power the longer FIRE key is pressed
        if(this.currentWeapon.scalablePower &&
            keys[this.KEY_FIRE]) {
            g_sprites.powerBar.drawPartialCentredAt(ctx, this.cx - OFFSET_X, this.cy-60 - OFFSET_Y, 
                0, 0+15*this.shotPower, g_sprites.powerBar.height);
        }

        // draw power bar when the weapon gets more power the longer FIRE key is pressed
        if(this.jetpacking) {
            g_sprites.fuelMeter.drawPartialCentredAt(ctx, this.cx - OFFSET_X, this.cy-60 - OFFSET_Y, 
                0, 2*this.fuel, g_sprites.fuelMeter.height);
        }

        // Draw the weapon
        var weaponSprite = this.currentWeapon.weaponSprite;
        if(weaponSprite.offsetY)
            posY += weaponSprite.offsetY;
        if(weaponSprite.offsetX)
            posX += weaponSprite.offsetX * this.flip;

        ctx.save();
        ctx.translate(posX, posY);
        ctx.scale(this.flip, 1);
        ctx.rotate(this.rotation - Math.PI/2);
        ctx.translate(-posX, -posY);

        if(!this.jetpacking) weaponSprite.drawCentredAt(ctx, posX, posY);

        ctx.restore();
    }

    ctx.save();
    ctx.fillStyle = this.team;
    ctx.textAlign = 'center';
    ctx.font = '15pt Arial Bold';
    ctx.fillText(this.health,this.cx - OFFSET_X, this.cy-30 - OFFSET_Y);
    ctx.restore();


};
