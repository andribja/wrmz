/*

entityManager.js

A module which handles arbitrary entity-management for "Asteroids"


We create this module as a single global object, and initialise it
with suitable 'data' and 'methods'.

"Private" properties are denoted by an underscore prefix convention.

*/


"use strict";


// Tell jslint not to complain about my use of underscore prefixes (nomen),
// my flattening of some indentation (white), or my use of incr/decr ops 
// (plusplus).
//
/*jslint nomen: true, white: true, plusplus: true*/


var entityManager = {

// "PRIVATE" DATA
_worms: [[],[]],
_indexes: [0,0],
_map : [],
_weapons : [],
_activeTeam: 0,
_initTimer : 45,
_timer : 45,
shakeEffectTimer: -1,
_animations: [],
_tombstones: [],

// "PRIVATE" METHODS

_forEachOf: function(aCategory, fn) {
    for (var i = 0; i < aCategory.length; ++i) {
        fn.call(aCategory[i]);
    }
},

// PUBLIC METHODS

// A special return value, used by other objects,
// to request the blessed release of death!
//
KILL_ME_NOW : -1,
gameStarted : false,
gameOver : false,

// Some things must be deferred until after initial construction
// i.e. thing which need `this` to be defined.
//
deferredSetup : function () {
    this._categories = [this._map, this._worms[0], this._worms[1], this._weapons, this._animations, this._tombstones];
},

init: function() {
    this.generateMap();
},

selectNextWorm: function() {
    //Fix
    if(this._worms[this._activeTeam].length <= 0 || this._worms[(this._activeTeam+1)%2] <= 0){
        this.gameOver = true;
        main.gameOver();
        return;
    }

    if(typeof this._worms[this._activeTeam][this._indexes[this._activeTeam]] !== 'undefined') 
        this._worms[this._activeTeam][this._indexes[this._activeTeam]].isActive = false;
    this._activeTeam = (this._activeTeam + 1) % 2;
    this._indexes[this._activeTeam] = (this._indexes[this._activeTeam] + 1) % this._worms[this._activeTeam].length;
    this._worms[this._activeTeam][this._indexes[this._activeTeam]].isActive = true;
    
    var cx = this._worms[this._activeTeam][this._indexes[this._activeTeam]].cx;
    var cy = this._worms[this._activeTeam][this._indexes[this._activeTeam]].cy;
    this._map[0].focusOn(cx, cy);
    
    console.log("currently active: worm " + this._indexes[this._activeTeam] + " of team " + this._activeTeam);
},

destroyMap: function(cx, cy, r) {
    this._map[0].destroy(cx, cy, r);
},

damageWorms: function(cx, cy, r) {
    for(var j = 0; j < this._worms.length; j++) {
        for(var i = 0; i < this._worms[j].length; i++) {
            this._worms[j][i].takeDamage(cx, cy, r);
            this._worms[j][i].shockWave(cx, cy, r);
        }
    }
},

damageWormsHalfRadius: function(cx, cy, r, damagePower, orientation) {
    console.log("cx, cy, r, orientation: "+cx+","+cy+","+r+","+orientation);
    for(var j = 0; j < this._worms.length; j++) {
        for(var i = 0; i < this._worms[j].length; i++) { 
            var currentWorm = this._worms[j][i];
            var posX = currentWorm.getPos().posX;
            var posY = currentWorm.getPos().posY;
            var distance = util.dist(cx, cy, posX, posY);
            // only damage worms to the left/right
            // depending on the orientation -1/1
            // and only check worms in r distance but not the worm
            // who is holding the weapon
            if (orientation === -1 && posX < cx && distance < r && distance > 11)
                currentWorm.takeBaseballBat(cx, cy, damagePower, orientation);
            if (orientation === 1 && posX > cx && distance < r && distance > 11)
                currentWorm.takeBaseballBat(cx, cy, damagePower, orientation);
            
            //this._worms[j][i].shockWave(cx, cy, r);
        }
    }
},

fireWeapon: function(cx, cy, velX, velY, rotation, weapon, shotPower, orientation) {
    // the worm's weapon is passed to the function as a string
    // this is a fix so the appropriate weapon can be created
    var fn = window[weapon];
    console.log("entityManager:"+cx+","+cy);
    this._weapons.push(new fn({
        cx   : cx,
        cy   : cy,
        velX : velX,
        velY : velY,

        rotation : rotation,
        initVel : shotPower,
        orientation : orientation
    }));
},

fireAirstrike: function(cx) {
    var fn = window['Airstrike'];
    for(var i = 0; i < 5; i++) {
        this._weapons.push(new fn({
            cx   : cx+(i-2)*20,
            cy   : 0,
            velX : 0.2,
            velY : 0.2,

            rotation : 0,
            initVel : 0.03
        }));
    }
},

addWormTeam2 : function(descr) {
    this._worms[1].push(new Worm(descr));
},

addWormTeam1 : function(descr) {
    this._worms[0].push(new Worm(descr));
},

generateMap : function(descr) {
    this._map.push(new Map(descr)); // TODO fix parameter to map image variable
},

generateTombstone : function(x, y){
    this._tombstones.push(new Tombstone(x, y));
},

getTeamHealth : function(teamNo) {
    var worms = this._worms[teamNo-1];
    var health = 0;

    for(var i in worms) {
        health += worms[i].health;
    }

    return health;
},

update: function(du) {

    if(this._worms[0].length === 0 || this._worms[1].length === 0){
        //Just put something here --- fix
        this.gameOver = true;
        main.gameOver();
    }
    for (var c = 0; c < this._categories.length; ++c) {

        var aCategory = this._categories[c];
        var i = 0;

        while (i < aCategory.length) {

            //spatialManager.unregister(aCategory[i]);

            var status = aCategory[i].update(du);

            if (status === this.KILL_ME_NOW) {
                // remove the dead guy, and shuffle the others down to
                // posrevent a confusing gap from appearing in the array

                if(!(aCategory[i] instanceof Animation)) {
                    var pos = aCategory[i].getPos();
                    var animation = new Animation({
                        image: g_images.explosion,
                        rows: 4,
                        cols: 4,
                        cx: pos.posX,
                        cy: pos.posY,
                        speed: 0.5,
                        scale: aCategory[i].damageRadius / 20
                    });

                    if(!(aCategory[i] instanceof BaseballBat))
                        this._animations.push(animation);
                }

                if(aCategory[i] instanceof Worm && aCategory[i].isDeadNow && aCategory[i].isActive){
                    // Timerinn hér var 0, en mér finnst koma betur út ef hann er >0.
                    // Þá verður hins vegar vandamál með select next worm
                    // Kemur semsagt upp villa í línu 284 í þessu skjali
                    // Ef einn ormur úr sitthvoru liðinu er dáinn
                    this._timer = 3;
                    spatialManager.unregister(aCategory[i]);
                }

                aCategory.splice(i,1);
            }
            else {
                //spatialManager.register(aCategory[i]);
                ++i;
            }
        }
    }
    if(this._timer > 0) {
        this._timer -= du/SECS_TO_NOMINALS;
    } else {
        this.selectNextWorm();
        this._timer = this._initTimer;
    }

    this.shakeEffectTimer -=du/SECS_TO_NOMINALS;
},

render: function(ctx) {
   
    var debugX = 10, debugY = 100;

    for (var c = 0; c < this._categories.length; ++c) {

        var aCategory = this._categories[c];

        if (!this._bShowRocks && 
            aCategory == this._rocks)
            continue;

        for (var i = 0; i < aCategory.length; ++i) {

            aCategory[i].render(ctx);
            //debug.text(".", debugX + i * 10, debugY);

        }
        debugY += 10;
    }

    if(this.doAnimation) {

    }

    if(this.gameOver){
        endGame(ctx);
        return;
    }

    ctx.save();
    ctx.fillStyle = 'yellow';
    ctx.font = '20pt Arial Bold';
    ctx.fillText(Math.ceil(this._timer), 20, 40);
 
    // Render team health on the screen
    var w = this.getTeamHealth(1) / 200 * 150;
    var h = 20;
    var r = 5;

    var xOff = 20;
    var yOff = 20;

    var x = xOff;
    var y = g_canvas.height - (yOff + 50);

    ctx.fillStyle = "green";
    ctx.textBaseline = "middle";
    ctx.fillText("Team 1", x, y);
    util.fillRoundedBox(ctx, x + 100, y-w/2, w, h, r, "green", "black", 2);

    ctx.fillStyle = "red";
    ctx.textBaseline = "middle";
    y += 30;
    w = this.getTeamHealth(2) / 200 * 150;
    ctx.fillText("Team 2", x, y);
    util.fillRoundedBox(ctx, x + 100, y-w/2, w, h, r, "red", "black", 2);

    // Draw ammo on screen
    ctx.textAlign = 'right';
    console.log("this._activeTeam: " + this._activeTeam + " this.index: " + this._indexes[this._activeTeam]);
    ctx.fillText('Ammo: ' 
        + this._worms[this._activeTeam][this._indexes[this._activeTeam]]
        .currentWeapon.ammo,
        g_canvas.width-20, 40);

    ctx.restore();
    
    }
};

function startScreen (ctx) {
    ctx.save();
    ctx.drawImage(g_images.bkgnd, 0,0);

    var startScreenWorm1 = g_sprites.startScreenWorm1;
    var startScreenWorm2 = g_sprites.startScreenWorm2;
    var grenade = g_sprites.Grenade;
    
    drawSprite(ctx, startScreenWorm1, 2.5, g_canvas.width/7, 4*g_canvas.height/15, 0);
    drawSprite(ctx, startScreenWorm2, 3, 4*g_canvas.width/5, 5*g_canvas.height/7, 0);
    drawSprite(ctx, grenade, 4, g_canvas.width/5, 5*g_canvas.height/15, 0);

    ctx.fillStyle = 'yellow';
    ctx.font = '20pt Arial Bold';
    ctx.textAlign = "center";
    ctx.fillText("Press 'B' to start a game of Worms!", g_canvas.width/2, g_canvas.height/2-25);
    ctx.fillText("Press 'I' to get instructions", g_canvas.width/2, g_canvas.height/2+25);
    ctx.restore();
}

function drawSprite(ctx, sprite, scale, x, y, rotation){
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);
    ctx.scale(scale, scale);
    ctx.drawImage(sprite.image, sprite.sx, sprite.sy, sprite.width, sprite.height,
                    -sprite.width/2, -sprite.height/2, sprite.width, sprite.height);
    
    ctx.restore();
}

function getInstructions(){
    ctx.save();

    ctx.drawImage(g_images.bkgnd, 0,0);

    ctx.fillStyle = 'yellow';
    ctx.font = '15pt Arial Bold';
    ctx.textAlign = "center";
    ctx.fillText("Press AWSD to move worm", g_canvas.width/2, g_canvas.height/11);
    ctx.fillText("Press spacebar to jump and 'J' for Jetpack", g_canvas.width/2, 2*g_canvas.height/11);
    ctx.fillText("Press 1 for Bazooka", g_canvas.width/2, 3*g_canvas.height/11);
    ctx.fillText("Press 2 for Grenade", g_canvas.width/2, 4*g_canvas.height/11);
    ctx.fillText("Press 3 for Airstrike, enter to aim and click to shoot", g_canvas.width/2, 5*g_canvas.height/11);
    ctx.fillText("Press 4 for Dynamite", g_canvas.width/2, 6*g_canvas.height/11);
    ctx.fillText("Press 5 for Shotgun", g_canvas.width/2, 7*g_canvas.height/11);
    ctx.fillText("Use arrow buttons to move map", g_canvas.width/2, 8*g_canvas.height/11);
    ctx.fillText("Press and/or hold enter to shoot", g_canvas.width/2, 9*g_canvas.height/11);
    ctx.fillText("Press 'B' to start a game of Worms!", g_canvas.width/2, 10*g_canvas.height/11);
    ctx.restore();
}

function endGame(ctx){
        console.log("game over");
        var beginX = g_canvas.width/2 - g_canvas.width/4;
        var beginY = g_canvas.height/2 - g_canvas.height/4;

        var winningTeam = "";
        if(entityManager._worms[0].length > 0)
            winningTeam = entityManager._worms[0][0].team;
        else
            winningTeam = entityManager._worms[1][0].team;

        ctx.save();
        ctx.fillStyle = 'black';
        ctx.strokeRect(beginX, beginY, g_canvas.width/2, g_canvas.height/2);
        ctx.fillStyle = 'white';
        ctx.fillRect(beginX, beginY, g_canvas.width/2, g_canvas.height/2);
        ctx.font = '20pt Arial Bold';
        ctx.textAlign = "center";
        ctx.fillStyle = 'black';
        ctx.fillText("Game Over!", g_canvas.width/2, g_canvas.height/2);
        ctx.fillStyle = winningTeam;
        ctx.fillText(capFirstLetterOf(winningTeam) + " team wins!!!", g_canvas.width/2, g_canvas.height/2+25);

        ctx.restore();
}

function capFirstLetterOf(string){
    return string.charAt(0).toUpperCase() + string.slice(1);
}
// Some deferred setup which needs the object to have been created first
entityManager.deferredSetup();

