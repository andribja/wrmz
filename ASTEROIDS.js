// =========
// ASTEROIDS
// =========
/*

A sort-of-playable version of the classic arcade game.


HOMEWORK INSTRUCTIONS:

You have some "TODO"s to fill in again, particularly in:

spatialManager.js

But also, to a lesser extent, in:

Rock.js
Bullet.js
Ship.js


...Basically, you need to implement the core of the spatialManager,
and modify the Rock/Bullet/Ship to register (and unregister)
with it correctly, so that they can participate in collisions.

Be sure to test the diagnostic rendering for the spatialManager,
as toggled by the 'X' key. We rely on that for marking. My default
implementation will work for the "obvious" approach, but you might
need to tweak it if you do something "non-obvious" in yours.
*/

"use strict";

/* jshint browser: true, devel: true, globalstrict: true */

var g_canvas = document.getElementById("g_canvas");
var g_ctx = g_canvas.getContext("2d");

// Stretch canvas to window on resize
window.addEventListener('resize', resizeListener);

function resizeListener(e) {
    util.resizeCanvas(g_canvas, FULL_WIDTH, FULL_HEIGHT);
}

/*
0        1         2         3         4         5         6         7         8
12345678901234567890123456789012345678901234567890123456789012345678901234567890
*/


// ====================
// CREATE INITIAL SHIPS
// ====================

function createInitialShips() {

}

// ====================
// CREATE INITIAL WORMS
// ====================

function createInitialWorms() {
    entityManager.generateWorm({
        cx : 700,
        cy : 200,
        isActive : true,
        //cy : 450
    });
    entityManager.generateWorm({
        cx:1100,
        cy: 100,
        isActive : false,
        team : "red"
    });
    entityManager.generateWorm({
        cx: 400,
        cy: 100,
        isActive : false
    });
    entityManager.generateWorm({
        cx:1300,
        cy: 100,
        isActive : false,
        team : "red"
    });
}

// =============
// GATHER INPUTS
// =============

function gatherInputs() {
    // Nothing to do here!
    // The event handlers do everything we need for now.
}


// =================
// UPDATE SIMULATION
// =================

// We take a very layered approach here...
//
// The primary `update` routine handles generic stuff such as
// pausing, single-step, and time-handling.
//
// It then delegates the game-specific logic to `updateSimulation`


// GAME-SPECIFIC UPDATE LOGIC

function updateSimulation(du) {
    
    processDiagnostics();
    
    entityManager.update(du);

}

// GAME-SPECIFIC DIAGNOSTICS

var g_allowMixedActions = true;
var g_useGravity = true;
var g_useAveVel = true;
var g_renderSpatialDebug = false;

var KEY_MIXED   = keyCode('M');;
var KEY_GRAVITY = keyCode('G');
var KEY_AVE_VEL = keyCode('V');
var KEY_SPATIAL = keyCode('X');

var KEY_HALT  = keyCode('H');
var KEY_RESET = keyCode('R');

var KEY_0 = keyCode('0');

var KEY_1 = keyCode('1');
var KEY_2 = keyCode('2');

var KEY_K = keyCode('K');

function processDiagnostics() {

    if (eatKey(KEY_MIXED))
        g_allowMixedActions = !g_allowMixedActions;

    if (eatKey(KEY_GRAVITY)) g_useGravity = !g_useGravity;

    if (eatKey(KEY_AVE_VEL)) g_useAveVel = !g_useAveVel;

    if (eatKey(KEY_SPATIAL)) g_renderSpatialDebug = !g_renderSpatialDebug;

}


// =================
// RENDER SIMULATION
// =================

// We take a very layered approach here...
//
// The primary `render` routine handles generic stuff such as
// the diagnostic toggles (including screen-clearing).
//
// It then delegates the game-specific logic to `gameRender`


// GAME-SPECIFIC RENDERING
/*
function renderSimulation(ctx) {
    entityManager.render(ctx);

    if (g_renderSpatialDebug) spatialManager.render(ctx);
}
*/

// =============
// PRELOAD STUFF
// =============

var g_images = {};

function requestPreloads() {

    var requiredImages = {
        map    : "images/world3.png",
		worm   : "images/worm.png",
        wormFlipped: "images/wormFlipped.png",
        target   : "images/target.png",
        explosion : "images/explosion.png",
        grenade : "images/grenade.png"
    };

    imagesPreload(requiredImages, g_images, preloadDone);
}



var g_sprites = {};

function preloadDone() {
    g_sprites.map = new Sprite(g_images.map);
    //g_sprites.ship  = new Sprite(g_images.ship);
    //g_sprites.ship2 = new Sprite(g_images.ship2);
    //g_sprites.rock  = new Sprite(g_images.rock);
    g_sprites.worm  = new Sprite(g_images.worm);
    g_sprites.wormFlipped = new Sprite(g_images.wormFlipped); 
    g_sprites.target = new Sprite(g_images.target);
    g_sprites.Bazooka = new Sprite(g_images.target);
    g_sprites.Bazooka.scale = 0.5;
    g_sprites.Grenade = new Sprite(g_images.grenade);

    entityManager.init();
    createInitialShips();
    createInitialWorms();

    main.init();

    // Stretch the canvas to the window
    util.resizeCanvas(g_canvas, FULL_WIDTH, FULL_HEIGHT);
}

// =================
// RENDER SIMULATION
// =================

// We take a very layered approach here...
//
// The primary `render` routine handles generic stuff such as
// the diagnostic toggles (including screen-clearing).
//
// It then delegates the game-specific logic to `gameRender`


// GAME-SPECIFIC RENDERING

function renderSimulation(ctx) {
    entityManager.render(ctx);

    if (g_renderSpatialDebug) spatialManager.render(ctx);
}

// Kick it off
requestPreloads();
