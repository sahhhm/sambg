function Bar(player, row, column, numCheckers) {
  this.player = player;
  this.row = row;
  this.column = column;
  this.numCheckers = numCheckers;
  this.entry = this.player == 1 ? 0 : 25;
  this.isTop = function() { return row < BOARD.maxPiecesPerTriangle; }
  this.isEmpty = function() { return this.numCheckers <= 0; }
  this.type = CONST_BAR;
}