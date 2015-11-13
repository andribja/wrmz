// ==============
// MOUSE HANDLING
// ==============

"use strict";

/* jshint browser: true, devel: true, globalstrict: true */

/*
0        1         2         3         4         5         6         7         8
12345678901234567890123456789012345678901234567890123456789012345678901234567890
*/

var g_mouseX = 0,
    g_mouseY = 0,
    g_mouseAim = false;

function handleMouse(evt) {
    
    g_mouseX = evt.clientX - g_canvas.offsetLeft;
    g_mouseY = evt.clientY - g_canvas.offsetTop;
	
    // If no button is being pressed, then bail
    var button = evt.buttons === undefined ? evt.which : evt.buttons;
    if (!button) return;
    if(g_mouseAim) {
        entityManager.fireAirstrike(g_mouseX + OFFSET_X);
        g_mouseAim = false;
    }
    // Use ctrl+click to focus
    if(keys[17])
	    entityManager._map[0].focusOn(g_mouseX + OFFSET_X, g_mouseY + OFFSET_Y);
	else
    	entityManager.destroyMap(g_mouseX + OFFSET_X, g_mouseY + OFFSET_Y, 50);
}

// Handle "down" and "move" events the same way.
window.addEventListener("mousedown", handleMouse);
window.addEventListener("mousemove", handleMouse);
