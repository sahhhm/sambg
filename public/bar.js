function Bar(player, row, column, numCheckers) {
  this.player = player;
  this.num = player;
  this.row = row;
  this.column = column;
  this.numCheckers = numCheckers;
  this.entry = this.player == 1 ? 0 : 25;
  this.isTop = function() { return row < 6; };
  this.isEmpty = function() { return this.numCheckers <= 0; };
  this.type = "bar";
  
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
  
}
