function Triangle(num, column, player, numCheckers) {
  /* num - triangle number relative to bg game. Starts at top right (1) and goes CC (24)
     row - row number relative to board layout.
     player - the player that currently controls the triangle */
  this.num = num;
  this.column = column;
  this.numCheckers = numCheckers;
  this.player = player;
  this.isTop = function() { return this.num <= 12; }
  this.isEmpty = function() { return this.numCheckers <= 0; }
  this.type = CONST_TRI;
}