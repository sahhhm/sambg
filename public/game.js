function Game(gameData) {
  this.roomId = gameData.room;
  this.players = [new Player(gameData.player1, 1, "#FFFFF0", 19, 24, 1, 6, 1, 25),
                  new Player(gameData.player2, 2, "#262626", 6, 1, 19, 24, -1, 0)];

  console.log("game room:", this.roomId, "player1: ", this.players[0].id, "player2: ", this.players[1].id);				  
  var boardOpts = {players: this.players, p1color: "#FFFFF0", p2color: "#262626"};
  this.board = new Board(boardOpts);
}
