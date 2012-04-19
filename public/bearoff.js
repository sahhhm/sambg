function BearOff(player, num, row, column, numCheckers) {
  this.player = player;
  this.num = num;
  this.row = row;
  this.entry = num;
  this.column = column;
  this.numCheckers = numCheckers;
  this.isTop = function() { return row < 6; };
  this.isFull = function() { return false; };
  this.isEmpty = function() { return this.numCheckers <= 0};
  this.type = "bearoff";
}
