// =================
// KEYBOARD HANDLING
// =================

var keys = [];

function handleKeydown(evt) {
    keys[evt.keyCode] = true;

    if(!entityManager.gameStarted && evt.keyCode === KEY_START){
    	//main.init();
    	entityManager.generateMap();
        entityManager.gameStarted = true;
    }
    if(!entityManager.gameStarted && evt.keyCode === KEY_INSTRUCTIONS){
    	g_infoScreen = !g_infoScreen;
    }
}

function handleKeyup(evt) {
    keys[evt.keyCode] = false;
}

// Inspects, and then clears, a key's state
//
// This allows a keypress to be "one-shot" e.g. for toggles
// ..until the auto-repeat kicks in, that is.
//
function eatKey(keyCode) {
    var isDown = keys[keyCode];
    keys[keyCode] = false;
    return isDown;
}

// A tiny little convenience function
function keyCode(keyChar) {
    return keyChar.charCodeAt(0);
}

window.addEventListener("keydown", handleKeydown);
window.addEventListener("keyup", handleKeyup);
