function Triangle(num, column, player, numCheckers) {
  this.num = num;
  this.column = column;
  this.numCheckers = numCheckers;
  this.player = player;
  this.isTop = function() { return this.num <= 12; };
  this.isEmpty = function() { return this.numCheckers <= 0; };
  this.entry = num;
  this.type = "triangle";
  
  this.validMoveTo = function(to) {
    var isValid = false;
      if (to) {
        if (to.numCheckers == 0) isValid = true;
        if (to.numCheckers == 1) isValid = true;
        if (to.numCheckers >= 2) {
          if (this.player == to.player) isValid = true;
        }
      }
    return isValid;  
  }
  
  this.draw = function(ctx) { 
    var ch;
    var thresh = this.drawInfo.maxPiecesPerTriangle; // limit number of actual checkers drawn
    var num = (this.numCheckers <= thresh) ? this.numCheckers : thresh;
    
    this.drawShape(ctx);
   
   // make this a common method
    for (var i = 0; i <= num - 1; i++) {
      this.isTop() ? ch = new Checker(i, this.column, this.player) : ch = new Checker(this.drawInfo.boardHeight - i - 1, this.column, this.player);
      ch.draw(ctx, false);
    }
    
    if ( this.numCheckers > thresh ) {
      var row = this.isTop() ? thresh - 1 : this.drawInfo.boardHeight - thresh;
      var x = (this.column * this.drawInfo.pieceWidth) + (this.drawInfo.pieceWidth/2) - 5;
      var y = (this.row * this.drawInfo.pieceHeight) + (this.drawInfo.pieceHeight/2) + 5;  
      ctx.font = "15pt Arial";
      ctx.fillStyle = "white";
      ctx.fillText(this.numCheckers, x, y);
    }
  }  
  
  this.drawShape = function(ctx) {
    // draw board part of the traingle
    ctx.save();
    var x = this.column * this.drawInfo.pieceWidth;
    var base = this.isTop() ? 0 : this.drawInfo.pixelHeight;
    ctx.globalAlpha = .3;
    ctx.strokeStyle = "black";
    ctx.beginPath();
    ctx.moveTo(x, base);
    ctx.lineTo(x + this.drawInfo.pieceWidth/2, Math.abs( base - (this.drawInfo.maxPiecesPerTriangle * this.drawInfo.pieceHeight) ));
    ctx.lineTo(x + this.drawInfo.pieceWidth, base);
    ctx.lineTo(x, base);
    ctx.stroke();
    ctx.restore();  
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
  
  this.select = function(ctx) {
    // same for all (triangle, bar)
    var row, col, player;
    row = this.isTop() ? this.numCheckers - 1 : pos = this.drawInfo.boardHeight - this.numCheckers;
    col = this.column
    player = this.player
    ch = new Checker( row, col, player );
    ch.draw( ctx, true );
  }   
}
