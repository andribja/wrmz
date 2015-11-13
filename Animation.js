
// This is a class that stores an array of sprites and 
// is capable of drawing them sequentially to create an animation
// It receives a spritesheet image, how many rows and columns
// the spritesheet contains and processes it accordingly

function Animation(descr) {
	// Default these variables, may be overwritten
	this.speed = 1;
	this.scale = 1;

	for(var property in descr) {
		this[property] = descr[property];
	}

	this.width = this.image.width / this.cols;
	this.height = this.image.height / this.rows;
	this.frameCounter = 0;
	this.createFrames();
}

Animation.prototype.update = function(ctx) {
	this.frameCounter += this.speed;

	if(this.continuous) {
		this.frameCounter = this.frameCounter % this.frames.length;
	} 

	if(Math.floor(this.frameCounter) === this.frames.length) 
		return -1;
};

Animation.prototype.setPos = function(pos) {
	this.cx = pos.posX;
	this.cy = pos.posY;
};

Animation.prototype.setSpeed = function(speed) {
	this.speed = speed;
};

Animation.prototype.setScale = function(scale) {
	this.scale = scale;
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
	cell.scale = this.scale;

	cell.drawCentredAt(ctx, this.cx - OFFSET_X, this.cy - OFFSET_Y);
};