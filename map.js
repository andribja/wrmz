
function Map(descr) {
    this.setup(descr);

    this.sprite = g_sprites['map'];
    this.width = this.sprite.width;
    this.height = this.sprite.height;   // For checking if anything has fallen into the ocean
    FULL_WIDTH = this.width;
    FULL_HEIGHT = this.height + this.LAND_OFFSET;

    // Init stuff for the sea
    g_images.sea = this.getWaveImg(g_canvas, g_ctx, FULL_WIDTH, 20, 'blue', 'cyan', 4);
    this.seaX = 0;
    this.seaY = FULL_HEIGHT - 2*this.LAND_OFFSET; 
    this.seaVel = 1;
    
    // Get a quick snapshot of the full image to store it's data
    this.grabMapData(g_canvas, g_ctx, FULL_WIDTH, FULL_HEIGHT);

    this.shakeEffectTimer = -1;
}

Map.prototype = new Entity();
Map.prototype.LAND_OFFSET = 100;

Map.prototype.isLand = function(cx, cy) {
    var x = parseInt(cx);
    var y = parseInt(cy);
    return this.getAlphaAt(x, y) !== 0;
};

Map.prototype.getAlphaAt = function(x, y) {
    var i =  util.getPixelIndex(this.imageData, x, y) + 3;

    if(i !=== undefined)
        return this.imageData.data[i];
};

Map.prototype.setAlphaAt = function(x, y, alpha) {
    var i =  util.getPixelIndex(this.imageData, x, y) + 3;
    
    this.imageData.data[i] = alpha;
};

Map.prototype.circleCollidesWithMap = function(cx, cy, r) {
    var theta;
    for(theta = 0; theta < 2*Math.PI; theta += Math.PI/12) {
        var y = cy+r*Math.sin(theta);
        var x = cx+r*Math.cos(theta);
        if(this.isLand(x,y)) return true;
    }
    return false;
}

Map.prototype.vertLineCollidesWithMap = function(x, y1, y2) {
    var yMin = Math.min(y1,y2);
    var yMax = Math.max(y1,y2);
    var y;
    var i;
    for(y = yMin; y <= yMax; y++) {
        if(this.isLand(x, y)) return true;
    }
    return false;
}

Map.prototype.horiLineCollidesWithMap = function(x1, x2, y) {
    var xMin = Math.min(x1,x2);
    var xMax = Math.max(x1,x2);
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
    if(g_mouseAim) {
        this.focusOn(g_mouseX + OFFSET_X, g_mouseY + OFFSET_Y);
        return;
    }

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

    this.seaX = (this.seaX + this.seaVel*du) % g_canvas.width;
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

Map.prototype.getWaveImg = function(canvas, ctx, width, height, stroke, fill, thickness) {
    // Store the canvas info to be able to restore it later
    var oldWidth = canvas.width;
    var oldHeight = canvas.height;

    canvas.width = width;
    canvas.height = height;

    ctx.save();
    ctx.beginPath();

    var desiredFreq = 0.08;
    var f = Math.floor(desiredFreq * width / (2*Math.PI)) * 2*Math.PI / width;

    var iterations = 1000;
    var incr = width / iterations;
    var x = 0, y = canvas.height/2;
    
    ctx.moveTo(x, y);
    ctx.strokeStyle = stroke;
    ctx.fillStyle = fill;
    ctx.lineWidth = thickness;

    // Draw a sine-wave shape
    for(var i=0; i<iterations; i ++) {
        x += incr;
        y = canvas.height/2 + (height / 2 - thickness) * Math.sin(f*x);
        ctx.lineTo(x, y);
    }

    // Close it up
    ctx.lineTo(x, canvas.height);
    ctx.lineTo(0, canvas.height);
    ctx.lineTo(0, canvas.height/2);
    ctx.closePath();

    ctx.stroke();
    ctx.fill();

    ctx.restore();

    // Grab the data and make an image
    var data = ctx.getImageData(0, 0, canvas.width, canvas.height);
    var img = new Image();
    img.src = canvas.toDataURL(data);

    // Restore the old canvas properties
    canvas.width = oldWidth;
    canvas.height = oldHeight;

    return img;
};

Map.prototype.grabMapData = function(canvas, ctx, width, height) {
    var oldWidth = canvas.width;
    var oldHeight = canvas.height;

    canvas.width = width;
    canvas.height = height;
    this.sprite.drawAt(ctx, 0, 0);
    this.imageData = ctx.getImageData(0,0, g_canvas.width, g_canvas.height);

    canvas.width = oldWidth;
    canvas.height = oldHeight;
};

Map.prototype.renderWave = function(ctx, oy) {
    // Draw the wave
    var img = g_images.sea;
    ctx.drawImage(img, this.seaX - OFFSET_X, this.seaY - OFFSET_Y + oy);

    // Wrap it around the right edge
    ctx.drawImage(img, img.width - this.seaX, 0, this.seaX, img.height,
                    -OFFSET_X, this.seaY - OFFSET_Y + oy, this.seaX, img.height);
}

Map.prototype.renderBackground = function(ctx) {
    //bg_ctx.drawImage(g_images.background, -OFFSET_X, -OFFSET_Y);
    ctx.drawImage(g_images.bkgnd, -OFFSET_X, -OFFSET_Y);
    util.fillBox(ctx, -OFFSET_X, this.seaY - OFFSET_Y, FULL_WIDTH, FULL_HEIGHT, 'cyan'); 

    this.renderWave(ctx, -20);
    this.renderWave(ctx, 10);
    this.renderWave(ctx, 40)
    
};

Map.prototype.renderForeground = function(ctx) {
    var dx = 0;
    var dy = 0;
    if(this.shakeEffectTimer > 0) {
        dx = Math.random()*15*this.shakeEffectTimer;
        dy = Math.random()*15*this.shakeEffectTimer;
    } 

    ctx.putImageData(this.imageData, -OFFSET_X+dx, -OFFSET_Y+dy);

    util.fillBox(ctx, -OFFSET_X, this.height-10 - OFFSET_Y, FULL_WIDTH, FULL_HEIGHT, 'cyan');
    //this.renderWave(ctx, 40);   
    this.renderWave(ctx, 70);
    this.renderWave(ctx, 100);

}

Map.prototype.render = function(ctx) {

    this.renderBackground(bg_ctx);
    this.renderForeground(ctx);
    
};
