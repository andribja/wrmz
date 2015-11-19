// =====
// WORMS
// =====
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

// Stretch canvas to window on resize
window.addEventListener('resize', resizeListener);

function resizeListener(e) {
    util.resizeCanvas(g_canvas, FULL_WIDTH, FULL_HEIGHT);
    util.resizeCanvas(bg_canvas, FULL_WIDTH, FULL_HEIGHT);
}

/*
0        1         2         3         4         5         6         7         8
12345678901234567890123456789012345678901234567890123456789012345678901234567890
*/

// ====================
// CREATE INITIAL WORMS
// ====================

function createInitialWorms() {
    entityManager.addWormTeam1({
        cx : 700,
        cy : 200,
        isActive : true
    });
    entityManager.addWormTeam2({
        cx:1100,
        cy: 100,
        isActive : false,
        team : "red"
    });
    entityManager.addWormTeam1({
        cx: 400,
        cy: 100,
        isActive : false
    });
    entityManager.addWormTeam2({
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

var KEY_MIXED   = keyCode('M');
var KEY_GRAVITY = keyCode('G');
var KEY_AVE_VEL = keyCode('V');
var KEY_SPATIAL = keyCode('X');

var KEY_HALT  = keyCode('H');
var KEY_RESET = keyCode('R');

var KEY_0 = keyCode('0');

var KEY_1 = keyCode('1');
var KEY_2 = keyCode('2');

var KEY_K = keyCode('K');
var KEY_START = keyCode('B');
var KEY_INSTRUCTIONS = keyCode('I');

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
        background : "images/bg.jpg",
		worm   : "images/worm.png",
        wormFlipped: "images/wormFlipped.png",
        jetpackFlying : "images/jetpackFlying.png",
        jetpack : "images/jetpack.png",
        target   : "images/target.png",
        explosion : "images/explosion.png",
        grenade : "images/grenade.png",
        tombstone : "images/tombstone.png",
        dynamite : "images/dynamite.png",
        bazooka : 'images/bazooka.png',
        airstrike : 'images/airstrike.png',
        powerBar : "images/powerBar.png",
        launcher : "images/rocket_launcher.png",
        detonator : "images/Detonator.png",
        shotgun : "images/shotgun.png",
        fuelMeter : "images/fuelMeter.png",
        bkgnd : "images/space.png"

    };

    imagesPreload(requiredImages, g_images, preloadDone);
}



var g_sprites = {};

function preloadDone() {
    g_sprites.map = new Sprite(g_images.map);
    g_sprites.worm  = new Sprite(g_images.worm);
    g_sprites.wormFlipped = new Sprite(g_images.wormFlipped); 
    g_sprites.target = new Sprite(g_images.target);
    g_sprites.Bazooka = new Sprite(g_images.target);
    g_sprites.Bazooka.scale = 0.5;
    g_sprites.Grenade = new Sprite(g_images.grenade);
    g_sprites.Airstrike = new Sprite(g_images.grenade);
    g_sprites.Tombstone = new Sprite(g_images.tombstone);
    g_sprites.Dynamite = new Sprite(g_images.dynamite);
    g_sprites.BazookaGun = new Sprite(g_images.bazooka);
    g_sprites.airstrike = new Sprite(g_images.airstrike);
    g_sprites.powerBar = new Sprite(g_images.powerBar);
    g_sprites.launcher = new Sprite(g_images.launcher);
    g_sprites.Detonator = new Sprite(g_images.detonator);
    g_sprites.Shotgun = new Sprite(g_images.shotgun);
    g_sprites.Jetpack = new Sprite(g_images.jetpack);
    g_sprites.JetpackFlying = new Sprite(g_images.jetpackFlying);
    g_sprites.fuelMeter = new Sprite(g_images.fuelMeter);

    entityManager.init();
    createInitialWorms();

    // Stretch the canvas to the window
    util.resizeCanvas(g_canvas, FULL_WIDTH, FULL_HEIGHT);
    util.resizeCanvas(bg_canvas, FULL_WIDTH, FULL_HEIGHT);
    startScreen(g_ctx);
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
