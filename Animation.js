
// This is a class that stores an array of sprites and 
// is capable of drawing them sequentially to create an animation
// It receives a spritesheet image, how many rows and columns
// the spritesheet contains and processes it accordingly

function Animation(image, rows, cols) {
	this.image = image;
	this.rows = rows;
	this.cols = cols;
	this.speed = 1;

	this.width = this.image.width / this.cols;
	this.height = this.image.height / this.rows;
	this.frameCounter = 0;
	this.createFrames();
}

Animation.prototype.update = function(ctx) {
	this.frameCounter += this.speed;

	if(Math.floor(this.frameCounter) === 16) 
		return -1;
};

Animation.prototype.setPos = function(pos) {
	this.cx = pos.posX;
	this.cy = pos.posY;
};

Animation.prototype.setSpeed = function(speed) {
	this.speed = speed;
};

Animation.prototype.createFrames = function() {
    var image = this.image;
    var rows = this.rows;
    var cols = this.cols;

    var frames = [];
    var width = Math.floor(image.width/rows);
    var height = Math.floor(image.height/cols);

    for(var i=0; i<rows; i++) {
        for(var j=0; j<cols; j++) {
            var sprite = new Sprite(image, j * width, i * height,
                                    width, height);

            frames.push(sprite);
        }
    }

    this.frames = frames;
};

Animation.prototype.render = function(ctx) {
	var cell = this.frames[Math.floor(this.frameCounter)];

	cell.drawCentredAt(ctx, this.cx - OFFSET_X, this.cy - OFFSET_Y);
};