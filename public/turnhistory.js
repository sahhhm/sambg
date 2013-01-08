function AMove( confirmedRolls, player, from, fromType, to, toType, isToHit, diceValue ) {
  this.turnNo = confirmedRolls
  this.player = player;
  this.fromNo = from;
  this.fromType = fromType;
  this.toNo = to;
  this.toType = toType;
  this.isToHit = isToHit;
  this.diceValue = diceValue; // great for when user bearsOff (and then tries to undo it...)
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
  
  this.cloneCurrentTurn = function() {
    var cloned = [];
	for (var i = 0; i < this.currentTurn.length; i++) {
	  var temp = this.currentTurn[i];
	  cloned.push(new AMove(temp.turnNo, temp.player, temp.fromNo, temp.fromType, temp.toNo, temp.toType, temp.isToHit, temp.diceValue));
	}
	return cloned;
  }
  
  this.clearCurrentToHistory = function() {
    this.history.push(this.currentTurn);
    this.currentTurn = [];
  }
  
  this.getTurnsByNo = function(turnNo) {
    return this.history[turnNo];
  }
}