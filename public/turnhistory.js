function AMove(confirmedRolls, player, from, fromType, to, isToHit, diceRoll) {
  this.turnNo = confirmedRolls
  this.player = player;
  this.fromNo = from;
  this.fromType = fromType;
  this.toNo = to;
  this.isToHit = isToHit;
  this.diceRoll = diceRoll; 
}

function TurnHistory() {
  // array of moves made during all completed terms turns. 
  // each index contains list of moves for that specific turn starting with 1
  this.history = [[]];
  
  // array of moves made during this turn
  this.currentTurn = [];
  
  this.addAMove = function(m) {
    this.currentTurn.push(m);
  }
  
  this.clearCurrentToHistory = function() {
    this.history.push(this.currentTurn);
	this.currentTurn = [];
  }
  
  this.getTurnsByNo = function(turnNo) {
    return this.history[turnNo];
  }


}