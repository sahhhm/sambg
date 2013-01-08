function Game(gameData) {
  this.roomId = gameData.room;
  this.type = gameData.type;
 
  this.players = new Array();
  if (this.type == "multi") {
    this.players.push(createHumanPlayer(gameData.player1, 1));
    this.players.push(createHumanPlayer(gameData.player2, 2)); 
  } else {
    this.players.push(createHumanPlayer(gameData.player1, 1));
    this.players.push(createRobotPlayer(gameData.player2));   
  }

  this.gameHasRobotPlayer = function() {
    return this.type == "single";
  }
  
  console.log("game room:", this.roomId, "game type:", this.type, "player1:", this.players[0].id, "player2:", this.players[1].id);				  
  var boardOpts = {players: this.players, p1color: "#FFFFF0", p2color: "#262626"};
  this.board = new Board(boardOpts);
}
