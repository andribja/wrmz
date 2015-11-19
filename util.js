// util.js
//
// A module of utility functions, with no private elements to hide.
// An easy case; just return an object containing the public stuff.

"use strict";


var util = {


// RANGES
// ======

clampRange: function(value, lowBound, highBound) {
    //console.log(value, lowBound, highBound);
    if (value < lowBound) {
	value = lowBound;
    } else if (value > highBound) {
	value = highBound;
    }
    return value;
},

wrapRange: function(value, lowBound, highBound) {
    while (value < lowBound) {
	value += (highBound - lowBound);
    }
    while (value > highBound) {
	value -= (highBound - lowBound);
    }
    return value;
},

isBetween: function(value, lowBound, highBound) {
    if (value < lowBound) { return false; }
    if (value > highBound) { return false; }
    return true;
},


// RANDOMNESS
// ==========

randRange: function(min, max) {
    return (min + Math.random() * (max - min));
},


// MISC
// ====

square: function(x) {
    return x*x;
},


// DISTANCES
// =========
dist: function(x1, y1, x2, y2) {
    return Math.sqrt(this.distSq(x1, y1, x2, y2));
},

distSq: function(x1, y1, x2, y2) {
    return this.square(x2-x1) + this.square(y2-y1);
},

wrappedDistSq: function(x1, y1, x2, y2, xWrap, yWrap) {
    var dx = Math.abs(x2-x1),
	dy = Math.abs(y2-y1);
    if (dx > xWrap/2) {
	dx = xWrap - dx;
    };
    if (dy > yWrap/2) {
	dy = yWrap - dy;
    }
    return this.square(dx) + this.square(dy);
},


// CANVAS OPS
// ==========

clearCanvas: function (ctx) {
    var prevfillStyle = ctx.fillStyle;
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.fillStyle = prevfillStyle;
},

strokeCircle: function (ctx, x, y, r, style) {
    var oldStyle = ctx.strokeStyle;
    ctx.strokeStyle = style;

    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = oldStyle; 
},

fillCircle: function (ctx, x, y, r) {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
},

fillBox: function (ctx, x, y, w, h, style) {
    var oldStyle = ctx.fillStyle;
    ctx.fillStyle = style;
    ctx.fillRect(x, y, w, h);
    ctx.fillStyle = oldStyle;
},

fillRoundedBox: function(ctx, x, y, w, h, r, fillStyle, lineStyle, lineWidth) {
    var oldFill = ctx.fillStyle;
    var oldStroke = ctx.strokeStyle;
    var oldWidth = ctx.lineWidth;

    ctx.fillStyle = fillStyle;
    ctx.strokeStyle = lineStyle;
    ctx.lineWidth = lineWidth;

    var hw = w/2;
    var hh = h/2;
    var cx = x + hw;
    var cy = y + hw;

    ctx.beginPath();
    ctx.moveTo(cx, cy - hh);
    ctx.arcTo(cx + hw, cy - hh, cx + hw, cy - hh + r, r);
    ctx.arcTo(cx + hw, cy + hh, cx + hw - r, cy + hh, r);
    ctx.arcTo(cx - hw, cy + hh, cx - hw, cy + hh - r, r);
    ctx.arcTo(cx - hw, cy - hh, cx - hw + r, cy - hh, r);
    ctx.lineTo(cx, cy - hh);
    ctx.closePath();

    ctx.stroke();
    ctx.fill();

    ctx.fillStyle = oldFill;
    ctx.strokeStyle = oldStroke;
    ctx.lineWidth = oldWidth;
},

strokeBox: function(ctx, x, y, w, h, style) {
    var oldStyle = ctx.fillStyle;
    ctx.strokeStyle = style;
    ctx.strokeRect(x, y, w, h);
    ctx.strokeStyle = oldStyle;
},

getPixelIndex: function(imgData, x, y) {
    var index = parseInt(y) * imgData.width * 4 + parseInt(x) * 4;

    if(index >= 0 && index < imgData.data.length)
        return index;
},

setPixelData: function(imgData, x, y, r, g, b, a) {
    var i = this.getPixelIndex(imgData, parseInt(x), parseInt(y));

    imgData.data[i] = r;
    imgData.data[i+1] = g;
    imgData.data[i+2] = b;

    if(a)
        imgData.data[i+3] = a;
},

resizeCanvas: function(canvas, maxWidth, maxHeight) {
    var width = maxWidth;
    var height = maxHeight;

    var innerWidth = window.innerWidth - 16;
    var innerHeight = window.innerHeight - 16;

    if(innerWidth <= maxWidth) {
        while(OFFSET_X > FULL_WIDTH - innerWidth)
            OFFSET_X--;

        width = innerWidth;
    } else
        OFFSET_X = 0;

    if(innerHeight <= maxHeight) {
        while(OFFSET_Y > FULL_HEIGHT - innerHeight)
            OFFSET_Y--;
        
        height = innerHeight;
    } else
        OFFSET_Y = 0;

    canvas.width = width;
    canvas.height = height;
}

};
