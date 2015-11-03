var bg_canvas = document.getElementById("bg_canvas");
var fg_canvas = document.getElementById("fg_canvas");

var bg_ctx = bg_canvas.getContext("2d");
var fg_ctx = fg_canvas.getContext("2d");

var fg_image;
var bg_image;
var g_imagedata;

function main() {
    bg_ctx.scale(bg_canvas.width/bg_image.width, bg_canvas.height/bg_image.height);
    bg_ctx.drawImage(bg_image, 0, 0);

    fg_ctx.scale(fg_canvas.width/fg_image.width, fg_canvas.height/fg_image.height);
	fg_ctx.drawImage(fg_image, 0, 0);

	g_imagedata = fg_ctx.getImageData(0, 0, fg_canvas.width, fg_canvas.height);
}

function getAlphaAt(imgData, x, y) {
    var i =  y * fg_canvas.width * 4 + x * 4 + 3;

    return imgData.data[i];
}

function setAlphaAt(imgData, x, y, alpha) {
    var i =  y * fg_canvas.width * 4 + x * 4 + 3;
    
    imgData.data[i] = alpha;
}

window.addEventListener("mousedown", handleMousedown);

function handleMousedown(e) {
    console.time("asdf");
    var posX = e.clientX;
    var posY = e.clientY;

    var r = 50;

    for(var y=posY-r; y<posY+r; y++) {
        for(var x=posX-r; x<posX+r; x++) {
            if(Math.pow(x - posX, 2) + Math.pow(y - posY, 2) < r*r)
                setAlphaAt(g_imagedata, x, y, 0);
        }
    }

    fg_ctx.putImageData(g_imagedata, 0, 0);
    console.timeEnd("asdf");
} 

function preload1(completionCallback) {
    fg_image = new Image();
    
    fg_image.onload = function () { 
        completionCallback(main);
    };
    
    fg_image.src = "world3.png";
    fg_image.crossOrigin = "Anonymous";
}

function preload2(completionCallback) {
    bg_image = new Image();
    
    bg_image.onload = function () { 
        completionCallback();
    };
    
    bg_image.src = "clouds.jpg";
    bg_image.crossOrigin = "Anonymous";
}

preload1(preload2);