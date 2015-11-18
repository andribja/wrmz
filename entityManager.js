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
_initTimer : 10,
_timer : 10,
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
        console.log("Game over!");
        keys[KEY_QUIT] = true;
        return;
    }

    if(typeof this._worms[this._activeTeam][this._indexes[this._activeTeam]] !== 'undefined') 
        this._worms[this._activeTeam][this._indexes[this._activeTeam]].isActive = false;
    this._activeTeam = (this._activeTeam + 1) % 2;
    this._indexes[this._activeTeam] = (this._indexes[this._activeTeam] + 1) % this._worms[this._activeTeam].length;
    this._worms[this._activeTeam][this._indexes[this._activeTeam]].isActive = true;
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

fireWeapon: function(cx, cy, velX, velY, rotation, weapon, initVel) {
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
        initVel : initVel
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

update: function(du) {

    if(this._worms[0].length === 0 || this._worms[1].length === 0){
        //Just put something here --- fix
        console.log("Congratulations, you win!");
        keys[KEY_QUIT] = true;
    }
    for (var c = 0; c < this._categories.length; ++c) {

        var aCategory = this._categories[c];
        var i = 0;

        while (i < aCategory.length) {

            //spatialManager.unregister(aCategory[i]);

            var status = aCategory[i].update(du);

            if (status === this.KILL_ME_NOW) {
                console.log("Kill me now");
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

                    this._animations.push(animation);
                }

                if(aCategory[i] instanceof Worm && aCategory[i].isDeadNow && aCategory[i].isActive){
                    this._timer = 0;
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
    /*ctx.save();

    if(this.shakeEffectTimer > 0){
        var dx = Math.random()*4*this.shakeEffectTimer;
        var dy = Math.random()*10*this.shakeEffectTimer;
        ctx.translate(dx, dy);
    }*/

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

    //ctx.restore();

    if(this.doAnimation) {

    }
    if(this.gameOver) return;
    ctx.save();
    ctx.font = '20pt Arial Bold';
    ctx.fillText(Math.ceil(this._timer), 20, 40);
    ctx.textAlign = 'right';
    ctx.fillText('Ammo: ' 
        + this._worms[this._activeTeam][this._indexes[this._activeTeam]]
        .currentWeapon.ammo,
        g_canvas.width-20, 40);
    ctx.restore();
    
}

}

// Some deferred setup which needs the object to have been created first
entityManager.deferredSetup();

