var currentFilter = 'combined';
var _sourceImage = document.getElementById('source-image');
var _ouputCanvas = document.getElementById('output-canvas');
var time = document.getElementById('time');
var currentImage = new ManipulatableImage(_sourceImage, _ouputCanvas);

// all filters are already mirrored and normalised
var filters = {
  xGradient: [[0, 0, 0], [0.5, 0 , -0.5], [0, 0, 0]],
  yGradient: [[0, 0.5, 0], [0, 0, 0], [0, -0.5, 0]],
  sobelX: [[0.125, 0, -0.125], [0.25, 0, -0.25], [0.125, 0, -0.125]],
  sobelY: [[0.125, 0.25, 0.125], [0, 0, 0], [-0.125, -0.25, -0.125]]
};

// excutes the actions
var execute = function(){
  var addition = 128;

  currentImage.drawImageToCanvas();
  currentImage.grayScale();

  var start = new Date().getTime();

  if(currentFilter === 'sobelXSeparated'){
    // apply sobelx[0]
    currentImage.convolute([[[0, 0.25, 0], [0, 0.5, 0], [0, 0.25, 0]]], function(image, pos, sum){
      image[pos] = sum[0];
    });
    // apply sobelx[1]
    currentImage.convolute([[[0, 0, 0], [0.5, 0, -0.5], [0, 0, 0]]], function(image, pos, sum){
      image[pos] = sum[0];
    });

    currentImage.flushGrayScaleToCanvas(addition);
  }else if(currentFilter === 'sobelYSeparated'){
    // apply sobely[0]
    currentImage.convolute([[[0, 0.5, 0], [0, 0, 0], [0, -0.5, 0]]], function(image, pos, sum){
      image[pos] = sum[0];
    });
    // apply sobely[1]
    currentImage.convolute([[[0, 0, 0], [0.25, 0.5, 0.25], [0, 0, 0]]], function(image, pos, sum){
      image[pos] = sum[0];
    });

    currentImage.flushGrayScaleToCanvas(addition);
  }else if(currentFilter === 'sobelAbsoluteGradient'){
    
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
    var angles = new Uint16Array(currentImage.manipulatedImageData.length);
    // apply sobelx and sobely on the image
    currentImage.convolute([filters.sobelX, filters.sobelY], function(image, pos, sum){
      // calculate the angle
      angle = (Math.atan2(sum[1], sum[0]));
      // save the angle in degree
      angles[pos] = (angle + Math.PI) * 360 / (2 * Math.PI);
    }, true);

    currentImage.flushHSBtoRGBToCanvas(angles);

  }else if(currentFilter === 'combined'){
    var absl = 0;
    var angle = 0;
    var angles = new Uint16Array(currentImage.manipulatedImageData.length);
    var absolutes = new Uint16Array(currentImage.manipulatedImageData.length);
    // apply sobelx and sobely on the image
    currentImage.convolute([filters.sobelX, filters.sobelY], function(image, pos, sum){
      // calculate the angle
      angle = (Math.atan2(sum[1], sum[0]));
      // save the angle in degree
      angle = (angle + Math.PI) * 360 / (2 * Math.PI);
      // save the absolute
      absl = Math.sqrt(sum[0] * sum[0] + sum[1] * sum[1]);
      angles[pos] = angle;
      absolutes[pos] = absl;
    }, true);
    currentImage.combinedFlush(angles, absolutes);

  }else{
    currentImage.convolute([filters[currentFilter]], function(image, pos, sum){
      image[pos] = sum[0];
    });
    currentImage.flushGrayScaleToCanvas(addition);
  }

  var end = new Date().getTime();
  time.textContent = (end - start) + 'ms';
};

// change the current image when a new file is selected from the filepicker
document.getElementById('file-select').addEventListener('change', function(){
  currentImage = new ManipulatableImage(_sourceImage, _ouputCanvas);
  currentImage.load('images/' + this.value, function(){
    execute();
  });
});

document.getElementById('action-select').addEventListener('change', function(){
  currentFilter = this.value;
  execute();
});

window.onload = function(){
  currentImage.load('images/train.png', function(){
    execute();
  });
};