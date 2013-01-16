/*
* -------------------------------------------
* GAME CLASS
* -------------------------------------------
*/
var Game = Class.extend({
    init: function(gameData) {
      this.roomId = gameData.room;
      this.type = gameData.type;
 
      this.players = new Array();
      if (this.type == "multi") {
        this.players.push(new HumanPlayer(gameData.player1, 1));
        this.players.push(new HumanPlayer(gameData.player2, 2));
      } else {
        this.players.push(new HumanPlayer(gameData.player1, 1));
        this.players.push(new RobotPlayer(gameData.player2, 2));	
      }
      this.board = new Board(this.players);      
    },
    gameHasRobotPlayer: function() {
      return this.type == "single";
    },
});
