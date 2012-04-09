function Game(gameData) {
  this.roomId = gameData.room;
  this.players = [new Player(gameData.player1, 1, "#ff0000", 19, 24, 1, 6, 1),
                  new Player(gameData.player2, 2, "#0000ff", 1, 6, 19, 24, -1)];

  console.log("game room:", this.roomId, "player1: ", this.players[0].id, "player2: ", this.players[1].id);				  
  var boardOpts = {players: this.players, p1color: "#ff0000", p2color: "#0000ff"};
  this.board = new Board(boardOpts);
  
  this.setRoll = function(d1, d2) {
    this.board.update({roll:true, text:true, confirm:true, die1: d1, die2: d2, undo:false});
  }
  
}
