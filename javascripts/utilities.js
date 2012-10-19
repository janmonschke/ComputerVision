var sourceImage = document.getElementById('source-image');
var ouputCanvas = document.getElementById('output-canvas');
var outputContext = ouputCanvas.getContext('2d');

var utilities = {
  // Loads an image to the source image and to the canvas
  loadImage: function(imagePath){
    // when image is already loaded show it directly
    if(sourceImage.src.indexOf(imagePath) !== -1){
      this.drawCurrImageToCanvas();
    }else{
      // load the new image
      sourceImage.src = imagePath;
      sourceImage.onload = function(){
        // draw when it's loaded
        utilities.drawCurrImageToCanvas();
      };
    }
  },

  drawCurrImageToCanvas: function(){
    // first set new widths
    ouputCanvas.width = sourceImage.width;
    ouputCanvas.height = sourceImage.height;

    // draw the image to the canvas
    outputContext.drawImage(sourceImage, 0, 0);
  }
};