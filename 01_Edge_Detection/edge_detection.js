var currentFilter = 'combined';
var _sourceImage = document.getElementById('source-image');
var _ouputCanvas = document.getElementById('output-canvas');
var currentImage = new ManipulatableImage(_sourceImage, _ouputCanvas);

// all filters are already mirrored and normalised
var filters = {
  xGradient: [[0, 0, 0], [0.5, 0 , -0.5], [0, 0, 0]],
  yGradient: [[0, 0.5, 0], [0, 0, 0], [0, -0.5, 0]],
  laplaceSharpening: [[0, 1, 0], [1, -4, 1], [0, 1, 0]],
  sobelX: [[0.125, 0, -0.125], [0.25, 0, -0.25], [0.125, 0, -0.125]],
  sobelY: [[0.125, 0.25, 0.125], [0, 0, 0], [-0.125, -0.25, -0.125]]
};

var testing = function(){
  var addition = 128;

  currentImage.drawImageToCanvas();
  currentImage.grayScale();

  if(currentFilter === 'sobelAbsoluteGradient'){
    
    // apply sobelx and sobely on the image
    currentImage.convolute([filters.sobelX, filters.sobelY], function(image, pos, sum){
      // apply the equation for the absolute sobel gradient
      image[pos] = Math.sqrt(sum[0] * sum[0] + sum[1] * sum[1]);
    });
    // add 20 to the grayscale
    addition = 20;
    currentImage.flushGrayScaleToCanvas(addition);

  }else if(currentFilter === 'sobelGradientDirection'){
    
    var angle = 0;
    // apply sobelx and sobely on the image
    currentImage.convolute([filters.sobelX, filters.sobelY], function(image, pos, sum){
      // get the direction
      angle = Math.atan2(sum[1], sum[0]);
      // calculate the percentage of the angle
      angle = (angle + Math.PI) / (2 * Math.PI);
      // apply a grayscaled percentage
      image[pos] = 255 * angle;
    });
    addition = 0;
    currentImage.flushGrayScaleToCanvas(addition);

  }else if(currentFilter === 'sobelGradientDirectionColor'){
    
    var angle = 0;
    // apply sobelx and sobely on the image
    currentImage.convolute([filters.sobelX, filters.sobelY], function(image, pos, sum){
      // calculate the angle
      angle = (Math.atan2(sum[1], sum[0]));
      // save the angle in degree
      image[pos] = (angle + Math.PI) * 360 / (2 * Math.PI);
    });
    addition = 0;
    currentImage.flushHSBtoRGBToCanvas(addition);

  }else if(currentFilter === 'combined'){
    var absl = 0;
    var angle = 0;
    // apply sobelx and sobely on the image
    currentImage.convolute([filters.sobelX, filters.sobelY], function(image, pos, sum){
      // calculate the angle
      angle = (Math.atan2(sum[1], sum[0]));
      // save the angle in degree
      angle = (angle + Math.PI) * 360 / (2 * Math.PI);
      // save the absolute
      absl = Math.sqrt(sum[0] * sum[0] + sum[1] * sum[1]);
      image[pos] = { angle: angle, absolute: absl };
    });
    addition = 0;
    currentImage.combinedFlush(addition);

  }else{
    currentImage.convolute([filters[currentFilter]], function(image, pos, sum){
      image[pos] = sum[0];
    });
    currentImage.flushGrayScaleToCanvas(addition);
  }
};

// change the current image when a new file is selected from the filepicker
document.getElementById('file-select').addEventListener('change', function(){
  currentImage = new ManipulatableImage(_sourceImage, _ouputCanvas);
  currentImage.load('images/' + this.value, function(){
    testing();
  });
});

document.getElementById('action-select').addEventListener('change', function(){
  currentFilter = this.value;
  testing();
});

window.onload = function(){
  currentImage.load('images/train.png', function(){
    testing();
  });
};