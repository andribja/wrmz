
function Map(descr) {
    this.setup(descr);

    this.sprite = g_sprites['map'];

    this.fullWidth = this.sprite.width;
    var oldWidth = g_canvas.width;

    // Get a quick snapshot of the full image to store it's data
    g_canvas.width = this.fullWidth;
    this.sprite.drawAt(g_ctx, 0, 0);
    this.imageData = g_ctx.getImageData(0,0, g_canvas.width, g_canvas.height);

    // Just display the desired view
    g_canvas.width = oldWidth;
    this.sprite.drawAt(g_ctx, 0, 0);

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

    if(eatKey(37))
        this.scroll(10);

    if(eatKey(39))
        this.scroll(-10);
};

Map.prototype.scroll = function(pixels) {

    OFFSET_X = util.clampRange(OFFSET_X + pixels, g_canvas.width - this.fullWidth, 0);
};
