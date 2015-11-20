// =====
// WORMS
// =====

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
    if(eatKey(g_diagnosticsOn_KEY1) && eatKey(g_diagnosticsOn_KEY2)) g_diagnosticsOn = !g_diagnosticsOn;

    if(g_diagnosticsOn) 
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
        startScreenWorm1 : "images/startScreenWorm1.png",
        startScreenWorm2 : "images/startScreenWorm2.png",
        map_space    : "images/maps/map_space.png",
        map_candy : "images/maps/map_candy.png",
        map_urban : "images/maps/map_urban.png",
        map_trees : "images/maps/map_trees.png",
        background : "images/bg.jpg",
        bkgnd : "images/space.png",

		worm   : "images/worm.png",
        wormFlipped: "images/wormFlipped.png",
        tombstone : "images/tombstone.png",
        jetpackFlying : "images/jetpackFlying.png",
        jetpack : "images/jetpack.png",
        fuelMeter : "images/fuelMeter.png",
        
        powerBar : "images/powerBar.png",
        target   : "images/crosshair.png",
        explosion : "images/explosion.png",
        grenade : "images/grenade.png",
        dynamite : "images/dynamite.png",
        bazooka : 'images/bazooka.png',
        airstrike : 'images/airstrike.png',
        launcher : "images/rocket_launcher.png",
        detonator : "images/Detonator.png",
        shotgun : "images/shotgun.png",

        baseballBat : "images/baseballBat.png",
        fuelMeter : "images/fuelMeter.png",
        bkgnd : "images/space.png",
        sky : "images/bluesky.png"
    };

    imagesPreload(requiredImages, g_images, preloadDone);
}



var g_sprites = {};

function preloadDone() {
    g_sprites.startScreenWorm1 = new Sprite(g_images.startScreenWorm1);
    g_sprites.startScreenWorm2 = new Sprite(g_images.startScreenWorm2);
    
    g_sprites.map_space = new Sprite(g_images.map_space);
    g_sprites.map_candy = new Sprite(g_images.map_candy);
    g_sprites.map_urban = new Sprite(g_images.map_urban);
    g_sprites.map_trees = new Sprite(g_images.map_trees);

    g_sprites.worm  = new Sprite(g_images.worm);
    g_sprites.wormFlipped = new Sprite(g_images.wormFlipped); 
    g_sprites.target = new Sprite(g_images.target);
    g_sprites.Tombstone = new Sprite(g_images.tombstone);
    g_sprites.Jetpack = new Sprite(g_images.jetpack);
    g_sprites.JetpackFlying = new Sprite(g_images.jetpackFlying);
    g_sprites.fuelMeter = new Sprite(g_images.fuelMeter);

    g_sprites.powerBar = new Sprite(g_images.powerBar);
    g_sprites.Bazooka = new Sprite(g_images.target);
    g_sprites.Bazooka.scale = 0.5;
    g_sprites.Grenade = new Sprite(g_images.grenade);
    g_sprites.Airstrike = new Sprite(g_images.grenade);
    g_sprites.Dynamite = new Sprite(g_images.dynamite);
    g_sprites.BazookaGun = new Sprite(g_images.bazooka);
    g_sprites.airstrike = new Sprite(g_images.airstrike);
    g_sprites.launcher = new Sprite(g_images.launcher);
    g_sprites.Detonator = new Sprite(g_images.detonator);
    g_sprites.Shotgun = new Sprite(g_images.shotgun);
    g_sprites.baseballBat = new Sprite(g_images.baseballBat);

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
