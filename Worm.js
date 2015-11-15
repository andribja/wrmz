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

    // Create a target
    this.targetSprite = g_sprites.target;
    this.targetCx = this.cx;
    this.targetCy = this.cy - 20;

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

// Initial, inheritable, default values
Worm.prototype.rotation = 0;
Worm.prototype.cx = 700;
Worm.prototype.cy = 450;
Worm.prototype.velX = 0;
Worm.prototype.velY = 0;
Worm.prototype.launchVel = 2;
Worm.prototype.health = 100;
Worm.prototype.team = "green";
Worm.prototype.timeLeft = 0;
Worm.prototype.isActive = false;

// TEMPORARY ----
Worm.prototype.shockWaveX=0;
Worm.prototype.shockWaveY=0;
//--------------

/*
// HACKED-IN AUDIO (no preloading)
Worm.prototype.warpSound = new Audio(
    "sounds/WormWarp.ogg");
*/

Worm.prototype.update = function (du) {
    // choose current weapon
    if(this.isActive) {
        this.chooseWeapon();  
    } 

    // ToDo: Unregister and check for death?
    spatialManager.unregister(this);
    
    this.applyAccel(du);

    // Update the weapon's aim
    this.updateTarget(du);
 
    // Move if buttons are being pressed
    if(this.isActive) {
        this.maybeMove();
       
        // Handle firing
        this.maybeFireWeapon();

        if(this.cy >= g_canvas.height)
            this.death();
    }
    
    // ToDo: Register?
    spatialManager.register(this);
};

Worm.prototype.applyAccel = function (du) {
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
        // it whill hit something, stop moving upwards
        nextY = this.cy + NOMINAL_GRAVITY*du;
        if (this.velY<0) this.velY = 0;
    }

    // Land on the ground
    if(this.horizontalEdgeCollidesWithMap(nextLx, nextRx, nextBottomY)){
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


Worm.prototype.maybeMove = function() {
    // Check if worm collides with map
    if(keys[this.KEY_LEFT]){
        this.wormSprite = g_sprites.worm;
        var i = this.canGoUpSlope(true);
        if(i > -Infinity){
            this.cx -= 3;
            this.cy -= i;
        }
        //If the worm is close to the left edge of the canvas we refocus
        // Is buggy, needs fixing
        //if(this.isCloseToEdgeOfCanvas(true, this.getXPositionOnCanvas())){
        //    console.log("this.cx, this.cy: " + this.cx + ", " + this.cy);
        if(!g_mouseAim)
            entityManager._map[0].focusOn(this.cx, this.cy); 
        //}
    }
    if(keys[this.KEY_RIGHT]){
        this.wormSprite = g_sprites.wormFlipped;
        var i = this.canGoUpSlope(false);
        if(i > -Infinity){
            this.cx += 3;
            this.cy -= i;
        }
        //If the worm is close to the right edge of the canvas we refocus
        //This seems to work fine
        //if(this.isCloseToEdgeOfCanvas(false, this.getXPositionOnCanvas()))
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

Worm.prototype.isCloseToEdgeOfCanvas = function(left, x){
    var right = !left;
    if(left && x < 100)
        return true;
    else if(right && x + 100 > g_canvas.width)
        return true;   
    else 
        return false;
};

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


Worm.prototype.canGoUpSlope = function(left){
    
    // ToDo: reyna að breyta þannig að við notum föllin úr map 1/2

    var yBottom = parseInt(this.cy + this.height/2);
    var yTop = parseInt(this.cy - this.height/2);
    var i = 0; var k = 0; var x;

    // See which side of the worm we need to check 
    if(left)
        x = parseInt(this.cx - this.width/2);
    else
        x = parseInt(this.cx + this.width/2);

    // Count pixels that arent transparent, first only close to the bottom of the worm
    // Then on the whole side of the worm
    for(var j = 0; j <= 7; j++){
        if(entityManager._map[0].getAlphaAt(x, yBottom-j) != 0)
            i++;
    }

    var wholeEdgeCollides = this.verticalEdgeCollidesWithMap(x, yBottom-10, yTop);
    
    // We need to figure out which numbers are appropriate here
    // For how many non-transparent pixels are on the side of the worm
    // can the worm move?
    if(i <= 7 && !wholeEdgeCollides){
        return true;
    }
    return -Infinity;
};


var NOMINAL_ROTATE_RATE = 0.1;

Worm.prototype.updateTargetRotation = function (du) {
    if (keys[this.KEY_ROTATEGUN_L]) {
        this.rotation -= NOMINAL_ROTATE_RATE * du;
    }
    if (keys[this.KEY_ROTATEGUN_R]) {
        this.rotation += NOMINAL_ROTATE_RATE * du;
    }

    this.rotation = util.wrapRange(this.rotation, 0, consts.FULL_CIRCLE);
};

Worm.prototype.updateTarget = function(du){
    if(this.cx === entityManager._worms[1])
        console.log("updateTarget");
    this.updateTargetRotation(du);

    var distFromWorm = 40;
    this.targetCx = +Math.sin(this.rotation)*distFromWorm + this.cx;
    this.targetCy = -Math.cos(this.rotation)*distFromWorm + this.cy;
};


var NOMINAL_GRAVITY = 0.2;

Worm.prototype.computeGravity = function () {
    return g_useGravity ? NOMINAL_GRAVITY : 0;
};


Worm.prototype.maybeFireWeapon = function () {

    if (eatKey(this.KEY_FIRE)) {
        this.currentWeapon.fire(this.cx, this.cy, this.rotation); 
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
    /*
    // ToDo: fix this, doesn't quite work yet
//console.log("(cx,cy)= "+cx+" , "+cy);
    //calculate the x and y components of the vector from the center of the explosion to the worm
    var xDist=this.cx-cx; 
    var yDist=this.cy-cy; 

    var explosionForce = 1000;

    var dist = util.dist(cx, this.cx, cy, this.cy);
   
    //use those distances to find the angle of the vextor between the worm and the explosion
    var angle = Math.atan2(yDist,xDist);

    //find the x-,and -y components of the vector
    var vectorX = Math.cos(angle);
    var vectorY = Math.sin(angle);
        this.velX=vectorX*explosionForce/dist;
        //if(vectorY<0) 
        this.velY=vectorY*explosionForce/dist; //don't sink into the ground
       // console.log("x,y dist= "+xDist+" , "+yDist);
       // console.log("dist= "+dist);
       // console.log("angle= "+angle);
       // console.log("force vector= "+vectorX+" , "+vectorY);
       this.shockWaveX=Math.abs(this.velX);
       this.shockWaveX=Math.abs(this.velY);
*/
}

Worm.prototype.takeDamage = function(cx, cy, r) {
    var d = util.dist(this.cx, this.cy, cx, cy);
    if(d > r) return;
    else this.health -= Math.ceil(r-d);
    if(this.health <= 0) this.death();
};

Worm.prototype.death = function() {
    //TODO implement

    //Unregister? 
};

/*
//Hugsanlega gera getBoundingBox
Worm.prototype.getRadius = function () {
    return (this.sprite.width / 2) * 0.9;
};

//Breyta þessu falli
Worm.prototype.takeWeaponHit = function () {
    this.warp();
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
    if(keys[this.KEY_BAZOOKA]) this.currentWeapon = new Bazooka();
    if(keys[this.KEY_GRENADE]) this.currentWeapon = new Grenade();
    if(keys[this.KEY_AIRSTRIKE]) this.currentWeapon = new Airstrike();
    if(keys[this.KEY_DYNAMITE]) this.currentWeapon = new Dynamite();
};

Worm.prototype.render = function (ctx) {
    var origScale = this.wormSprite.scale;
    // pass my scale into the sprite, for drawing
    this.wormSprite.scale = this._scale;
    this.wormSprite.drawCentredAt(ctx, this.cx - OFFSET_X, 
                                    this.cy - OFFSET_Y, 0);
    this.wormSprite.scale = origScale;
    if(this.isActive) {
        this.targetSprite.scale = this._scale;
        this.targetSprite.drawCentredAt(ctx, this.targetCx - OFFSET_X, 
                                        this.targetCy - OFFSET_Y, 0);
        this.targetSprite.scale = origScale;
    }
    ctx.save();
    ctx.fillStyle = this.team;
    ctx.textAlign = 'center';
    ctx.font = '15pt Arial Bold';
    ctx.fillText(this.health,this.cx - OFFSET_X, this.cy-30 - OFFSET_Y);
/* temporary-------
ctx.beginPath();
ctx.fillStyle='black';
ctx.lineWidth=10;
ctx.moveTo(this.cx-OFFSET_X,this.cy-OFFSET_Y);
ctx.lineTo(this.cx+this.shockWaveX*50-OFFSET_X,this.cy+this.shockWaveY*50-OFFSET_Y);
ctx.stroke();
//----------------*/
    ctx.restore();


};
