function BearOff(player, row, column, numCheckers) {
  this.player = player;
  this.num = player;
  this.row = row;
  this.column = column;
  this.numCheckers = numCheckers;
  this.isTop = function() { return row < 6; };
  this.isFull = function() { return false; };
  this.type = "bearoff";
}
