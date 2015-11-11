
function Map(descr) {
    this.setup(descr);

    this.sprite = g_sprites['map'];

    FULL_WIDTH = this.sprite.width;
    FULL_HEIGHT = this.sprite.height;
    
    // Get a quick snapshot of the full image to store it's data
    g_canvas.width = FULL_WIDTH;
    g_canvas.height = FULL_HEIGHT;
    this.sprite.drawAt(g_ctx, 0, 0);
    this.imageData = g_ctx.getImageData(0,0, g_canvas.width, g_canvas.height);

    this.shakeEffectTimer = -1;
    //spatialManager.register(this)
}

Map.prototype = new Entity();

Map.prototype.isLand = function(x, y) {
    return this.getAlphaAt(x, y) !== 0;
};

Map.prototype.getAlphaAt = function(x, y) {
    var i =  util.getPixelIndex(this.imageData, x, y) + 3;

    return this.imageData.data[i];
};

Map.prototype.setAlphaAt = function(x, y, alpha) {
    var i =  util.getPixelIndex(this.imageData, x, y) + 3;
    
    this.imageData.data[i] = alpha;
};

Map.prototype.render = function(ctx) {
    var dx = 0;
    var dy = 0;
    if(this.shakeEffectTimer > 0) {
        dx = Math.random()*15*this.shakeEffectTimer;
        dy = Math.random()*15*this.shakeEffectTimer;
    }
    
    ctx.putImageData(this.imageData, -OFFSET_X+dx, -OFFSET_Y+dy);
};

Map.prototype.circleCollidesWithMap = function(cx, cy, r) {
    var theta;
    for(theta = 0; theta < 2*Math.PI; theta += Math.PI/12) {
        var y = r*Math.sin(theta);
        var x = r*Math.cos(theta);
        if(this.isLand(x,y)) return true;
    }
    return false;
}

Map.prototype.vertLineCollidesWithMap = function(x0, y1, y2) {
    var yMin = parseInt(Math.min(y1,y2));
    var yMax = parseInt(Math.max(y1,y2));
    var x = parseInt(x0);
    var y;
    var i;
    for(y = yMin; y <= yMax; y++) {
        if(this.isLand(x, y)) return true;
    }
    return false;
}

Map.prototype.horiLineCollidesWithMap = function(x1, x2, y0) {
    var xMin = parseInt(Math.min(x1,x2));
    var xMax = parseInt(Math.max(x1,x2));
    var y = parseInt(y0);
    var x;
    var i = 0;
    for(x = xMin; x <= xMax; x++) {
        if(this.isLand(x,y)) i++;
    }
    // i is the number of pixles on the line, that are colliding with the map
    // 13 px or more mean that more than 65% of the top/bottom of the worm is colliding with te map
    // (we might need to change this later)
    if(i>13) return true;
    return false;
}

Map.prototype.destroy = function(cx, cy, r) {
    for(var y=cy-r; y<cy+r; y++) {
        for(var x=cx-r; x<cx+r; x++) {
            if(util.square(x - cx) + util.square(y - cy) < r*r)
                this.setAlphaAt(x, y, 0);
        }
    }

    // Shake map when it takes damage
    this.shakeEffectTimer = 0.9;
    entityManager.shakeEffectTimer = 0.9;
};

Map.prototype.update = function(du) {
    var px = 10;

    // Scroll left
    if(eatKey(37))
        this.scroll(-px, 0);

    // Scroll right
    if(eatKey(39))
        this.scroll(px, 0);

    // Scroll up
    if(eatKey(38))
        this.scroll(0, -px);

    // Scroll down
    if(eatKey(40))
        this.scroll(0, px);

    // The map shakes for a bit when it takes damage
    this.shakeEffectTimer -= du/SECS_TO_NOMINALS;
};

// Negative dx scrolls to the left
// Negative dy scrolls up
Map.prototype.scroll = function(dx, dy) {

    OFFSET_X = util.clampRange(OFFSET_X + dx, 0, FULL_WIDTH - g_canvas.width);
    OFFSET_Y = util.clampRange(OFFSET_Y + dy, 0, FULL_HEIGHT - g_canvas.height);

};

Map.prototype.focusOn = function(cx, cy) {

    var scrollX = cx - g_canvas.width/2 - OFFSET_X;
    var scrollY = cy - g_canvas.height/2 - OFFSET_Y;

    this.scroll(scrollX, scrollY); 
};