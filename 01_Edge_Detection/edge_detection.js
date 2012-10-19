document.getElementById('file-select').addEventListener('change', function(){
  utilities.loadImage('images/' + this.value);
});

utilities.loadImage('images/train.png');