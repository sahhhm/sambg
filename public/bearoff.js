function BearOff(player, num, column, numCheckers) {
  this.player = player;
  this.num = num;
  this.entry = num;
  this.column = column;
  this.numCheckers = numCheckers;
  this.isTop = function() { return this.player == 2; };
  this.isFull = function() { return false; };
  this.isEmpty = function() { return this.numCheckers <= 0};
  this.type = "bearoff";
  
  this.draw = function(ctx) { 
    var ch;

    this.drawShape(ctx);
    for (var i = 0; i <= this.numCheckers - 1; i++) {
      ch = this.isTop() ? 
           new Checker(i * this.drawInfo.bearOffHeight, this.column, this.player) : 
           new Checker((this.drawInfo.boardHeight * this.drawInfo.pieceHeight) - ((i+1) * this.drawInfo.bearOffHeight) - 1, this.column, this.player);
      ch.drawBear(ctx);
    }
  }

  this.drawShape = function(ctx) {
    ctx.fillStyle = "#0f0";
    var top = this.isTop() ? 0 : this.drawInfo.pixelHeight/2;
    ctx.fillRect(this.drawInfo.pieceWidth * this.drawInfo.bearOffColumn , top, this.drawInfo.bearOffWidth, this.drawInfo.pixelHeight / 2);
  }  
  
  this.highlight = function(ctx) {
    // same for bar, triange... different for bearOff
    var base, x;
    x = this.column * this.drawInfo.pieceWidth;
    base = this.isTop() ? 0 : this.drawInfo.pixelHeight;

    ctx.beginPath();
    ctx.moveTo(x, base);
    ctx.lineTo(x + this.drawInfo.pieceWidth/2, Math.abs(base - (this.drawInfo.maxPiecesPerTriangle * this.drawInfo.pieceHeight)));
    ctx.lineTo(x + this.drawInfo.pieceWidth, base);
    ctx.lineTo(x, base);
    ctx.stroke();

    ctx.lineWidth = 3;
    ctx.strokeStyle = "#a020f0";
    ctx.stroke();      
  }
    
  
}