var currentFilter = 'xGradient';
var _sourceImage = document.getElementById('source-image');
var _ouputCanvas = document.getElementById('output-canvas');
var currentImage = new ManipulatableImage(_sourceImage, _ouputCanvas);

// all filter are already mirrored and normalised
var filters = {
  xGradient: [[0, 0, 0], [0.5, 0 , -0.5], [0, 0, 0]],
  yGradient: [[0, 0.5, 0], [0, 0, 0], [0, -0.5, 0]],
  laplaceSharpening: [[0, 1, 0], [1, -4, 1], [0, 1, 0]],
  sobelX: [[0.125, 0, -0.125], [0.25, 0, -0.25], [0.125, 0, -0.125]],
  sobelY: [[0.125, 0.25, 0.125], [0, 0, 0], [-0.125, -0.25, -0.125]]
};

var testing = function(){
  currentImage.drawImageToCanvas();
  var start = new Date().getTime();
  currentImage.grayScale();
  var pointA = new Date().getTime();
  currentImage.convolute(filters[currentFilter]);
  var pointB = new Date().getTime();
  currentImage.flushToCanvas();
  var end = new Date().getTime();
  console.log('start to a:', pointA - start, 'a to b:', pointB - pointA, 'b to end:', end - pointB, 'total:', end - start);
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

document.getElementById('test').addEventListener('click', function(){
  testing();
});