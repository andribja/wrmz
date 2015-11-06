
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

    //spatialManager.register(this)
}

Map.prototype = new Entity();

Map.prototype.isLand = function(x, y) {
    return this.getAlphaAt(x, y) == 0;
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
    ctx.putImageData(this.imageData, OFFSET_X, OFFSET_Y);
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

Map.prototype.vertLineCollidesWithMap = function(x, y1, y2) {
    var y;
    for(y = Math.min(y1,y2); y < Math.max(y1,y2); y++) {
        if(this.isLand(x, y)) return true;
    }
    return false;
}

Map.prototype.horiLineCollidesWithMap = function(x1, x2, y) {
    var x;
    for(x = Math.min(x1,x2); x < Math.max(x1,x2); x++) {
        if(this.isLand(x, y)) return true;
    }
    return false;
}

Map.prototype.destroy = function(cx, cy, r) {
    for(var y=cy-r; y<cy+r; y++) {
        for(var x=cx-r; x<cx+r; x++) {
            if(util.square(x - cx) + util.square(y - cy) < r*r)
                this.setAlphaAt(x, y, 0);
        }
    }
};

Map.prototype.update = function(du) {
    var px = 10;

    // Scroll left
    if(eatKey(37))
        this.scroll(px, 0);

    // Scroll right
    if(eatKey(39))
        this.scroll(-px, 0);

    // Scroll up
    if(eatKey(38))
        this.scroll(0, px);

    // Scroll down
    if(eatKey(40))
        this.scroll(0, -px);
};

Map.prototype.scroll = function(dx, dy) {

    OFFSET_X = util.clampRange(OFFSET_X + dx, g_canvas.width - FULL_WIDTH, 0);
    OFFSET_Y = util.clampRange(OFFSET_Y + dy, g_canvas.height - FULL_HEIGHT, 0);
};
