var ManipulatableImage = function (sourceImage, outputCanvas){
  this.sourceImage = sourceImage;
  this.outputCanvas = outputCanvas;
  this.outputContext = outputCanvas.getContext('2d');
  this.originalImageData = null;
  this.manipulatedImageData = [];
};

// performs a convolution with callbacks
ManipulatableImage.prototype.convolute = function(filters, callback){
  var length = this.manipulatedImageData.length;
  var width = this.sourceImage.width;
  var height = this.sourceImage.height;
  var newImage = [];
  var sum, factor, y, x;

  for (var i = 0; i < length; i++) {
    y = Math.floor(i / width);
    x = i - y * width;
    sum = [0, 0];
    // apply each filter to the image
    for (var f = 0; f < filters.length; f++){
      for (var convY = -1; convY < 2; convY++) {
        for (var convX = -1; convX < 2; convX++) {
          factor = filters[f][convY + 1][convX + 1];
          sum[f] += factor * this.getStreamLineValue(x + convX, y + convY, width, height);
        }
      }
    }
    // execute the callback with the calculated values
    if(callback){ callback(newImage, i , sum); }
  }
  this.manipulatedImageData = newImage;
  return this;
};

// save access to the streamlined imagedata
ManipulatableImage.prototype.getStreamLineValue = function(x, y, width, height){
  if(x < 0){ x = 0; } else if(x > width - 1){ x = width - 1; }
  if(y < 0){ y = 0; } else if(y > height - 1){ y = height - 1; }
  return this.manipulatedImageData[y * width + x];
};

// Creates a grayscale from the current image data
ManipulatableImage.prototype.grayScale = function(){
  var length = this.originalImageData.data.length;
  
  for(var i = 0, n = 0; i < length; i += 4, n++){
    var r = this.originalImageData.data[i];
    var g = this.originalImageData.data[i+1];
    var b = this.originalImageData.data[i+2];
    this.manipulatedImageData[n] = (r+g+b) / 3;
  }

  return this;
};

// loads an image
ManipulatableImage.prototype.load = function(imagePath, callback){
  if(!callback){ callback = function(){}; }

  // when image is already loaded show it directly
  if(this.sourceImage.src.indexOf(imagePath) !== -1){
    callback();
  }else{
    // load the new image
    this.sourceImage.src = imagePath;
    this.sourceImage.onload = function(){
      callback();
    };
  }
};

// Simply draws the current image to the canvas
ManipulatableImage.prototype.drawImageToCanvas = function() {
  // first set new size
  this.outputCanvas.width = this.sourceImage.width;
  this.outputCanvas.height = this.sourceImage.height;

  // draw the image to the canvas
  this.outputContext.drawImage(this.sourceImage, 0, 0);

  // reset the image data
  this.originalImageData = this.outputContext.getImageData(0, 0, this.sourceImage.width, this.sourceImage.height);
};

// Flushes the manipulated grayscale data to the canvas
ManipulatableImage.prototype.flushGrayScaleToCanvas = function(addition){
  if(!addition){ addition = 0; }
  var flush = this.outputContext.createImageData(this.outputCanvas.width, this.outputCanvas.height);
  var current;
  for(var i = 0; i < this.manipulatedImageData.length; i++){
    // add the addition
    debugger
    current = this.manipulatedImageData[i] + addition;
    current = (current > 255) ? 255 : current;
    // 4 channels as needed by the canvas-api -> R,G,B,A
    flush.data[4*i] = current;
    flush.data[4*i+1] = current;
    flush.data[4*i+2] = current;
    flush.data[4*i+3] = 255;
  }
  this.outputContext.putImageData(flush, 0, 0);
  return this;
};

// creates an RGB image from the saved hsl value
ManipulatableImage.prototype.flushHSBtoRGBToCanvas = function(){
  var flush = this.outputContext.createImageData(this.outputCanvas.width, this.outputCanvas.height);
  var current, rgbFromCurrentHsb;
  for(var i = 0; i < this.manipulatedImageData.length; i++){
    // read out the angle
    current = this.manipulatedImageData[i];
    // convert hsb to RGB, see utilities.js
    rgbFromCurrentHsb = utilities.rgbFromHsb([current, 100, 100]);
    
    flush.data[4*i] = rgbFromCurrentHsb[0];
    flush.data[4*i+1] = rgbFromCurrentHsb[1];
    flush.data[4*i+2] = rgbFromCurrentHsb[2];
    flush.data[4*i+3] = 255;
  }
  this.outputContext.putImageData(flush, 0, 0);
  return this;
};

// creates a combined image from the angle and absolute value
ManipulatableImage.prototype.combinedFlush = function(){
  var flush = this.outputContext.createImageData(this.outputCanvas.width, this.outputCanvas.height);
  var current, rgbFromCurrentHsb;
  for(var i = 0; i < this.manipulatedImageData.length; i++){
    // get the current object
    current = this.manipulatedImageData[i];
    // create an RGB color from the HSB values
    rgbFromCurrentHsb = utilities.rgbFromHsb([current.angle, 100, current.absolute]);
    flush.data[4*i] = rgbFromCurrentHsb[0];
    flush.data[4*i+1] = rgbFromCurrentHsb[1];
    flush.data[4*i+2] = rgbFromCurrentHsb[2];
    flush.data[4*i+3] = 255;
  }
  this.outputContext.putImageData(flush, 0, 0);
  return this;
};