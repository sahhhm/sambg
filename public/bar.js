function Bar(player, row, column, numCheckers) {
  this.player = player;
  this.num = player;
  this.row = row;
  this.column = column;
  this.numCheckers = numCheckers;
  this.entry = this.player == 1 ? 0 : 25;
  this.isTop = function() { return row < 6; }
  this.isEmpty = function() { return this.numCheckers <= 0; }
  
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
}
