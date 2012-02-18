function Bar(player, row, column, numCheckers) {
  this.player = player;
  this.row = row;
  this.column = column;
  this.numCheckers = numCheckers;
  this.entry = this.player == 1 ? 0 : 25;
  this.isTop = function() { return row < BOARD.specs.maxPiecesPerTriangle; }
  this.isEmpty = function() { return this.numCheckers <= 0; }
  this.type = CONST_BAR;
  
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
  
  this.validDiceMoveTo = function(to, d) {
    var isValid = false;
    if (this.player == d.playerTurn()) {
      var i;
      var potentials = d.findPotentialMoves(this);
      for  (i = 0; i < potentials.length; i++) {
       if (potentials[i][0].num == to.num) isValid = true;
      }
    } else {
      console.log("Incorrect player moving");
    }
    return isValid;
  }    
}
