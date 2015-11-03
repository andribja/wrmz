
function Map(descr) {
    this.setup(descr);

    this.sprite = g_sprites['map'];

    g_ctx.drawImage(this.sprite, 0, 0);
    this.imageData = g_ctx.getImageData(0,0, g_canvas.width, g_canvas.height);
}

Map.prototype = new Entity();

Map.prototype.getAlphaAt = function(x, y) {
    var i =  y * g_canvas.width * 4 + x * 4 + 3;

    return this.imageData.data[i];
};

Map.prototype.setAlphaAt = function(x, y, alpha) {
    var i =  y * g_canvas.width * 4 + x * 4 + 3;
    
    this.imageData.data[i] = alpha;
};

Map.prototype.render = function(ctx) {
    ctx.putImageData(this.imageData, 0, 0);
};

Map.prototype.takeHit = function(cx, cy, r) {
    for(var y=cx-r; y<cy+r; y++) {
        for(var x=cx-r; x<cy+r; x++) {
            if(util.square(x - cx) + util.square(y - cy) < r*r)
                setAlphaAt(this.imageData, x, y, 0);
        }
    }
};