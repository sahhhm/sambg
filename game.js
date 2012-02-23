function Game() {
  this.players = [new Player(1, "#ff0000", 19, 24, 1, 6, 1),
	              new Player(2, "#0000ff", 1, 6, 19, 24, -1)];

  var boardOpts = {players: this.players, p1color: "#ff0000", p2color: "#0000ff"};
  this.board = new Board(boardOpts);
  
}