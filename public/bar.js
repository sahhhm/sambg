function Bar(player, row, column, numCheckers) {
  this.player = player;
  this.num = player;
  this.row = row;
  this.column = column;
  this.numCheckers = numCheckers;
  this.entry = this.player == 1 ? 0 : 25;
  this.isTop = function() { return row < 6; }
  this.isEmpty = function() { return this.numCheckers <= 0; }
  
  this.validMoveTo = function(to) {
    var isValid = false;
      if (to) {
        if (to.numCheckers == 0) isValid = true;
        if (to.numCheckers == 1) isValid = true;
        if (to.numCheckers >= 2) {
          if (this.player == to.player) isValid = true;
        }
      }
    return isValid;  
  }  
  /*
  this.validDiceMoveTo = function(to, d) {
    var isValid = false;
    if (this.player == d.playerTurn()) {
      var i;
      var potentials = d.findPotentialMoves(this);
      for  (i = 0; i < potentials.length; i++) {
       if (potentials[i][0].num == to.num) isValid = true;
      }
    } else {
      console.log("Incorrect player moving");
    }
    return isValid;
  }   
  */
/*
  this.update = function(to, onBoard) {
    var isValid = false;
  
    if (this.validDiceMoveTo(to, onBoard.dice)) {
      if (to.numCheckers == 0) {
	    isValid = true;
        to.player = this.player;
      } else if (to.numCheckers == 1) {
	    if (this.player == to.player) {
		  isValid = true;
	    } else {
	      //player hit
		  console.log("Player " + this.player + " hit Player " + to.player + " from the bar");
		  onBoard.gPlayers[to.player-1].bar.numCheckers += 1;
		  to.numCheckers -= 1;
		  to.player = this.player;
		  isValid = true;
	    }
	  } else {
	    if (this.player == to.player) {
		  isValid = true;
	    } else {
	      console.log("Player " + this.player + " cannot move form the bar to triangle " + to.num + " because Player " + to.player + " is occupying the triangle");
	    }
	  }
    } else {
      console.log("Player " + this.player + " tried to move from the bar to triangle " + to.num);
      onBoard.selectedBarNum = -1;
    }
  
    if (isValid) this.move(to, onBoard);
  }  
  */
/*
  this.move = function(to, onBoard) {
    this.numCheckers -= 1;
    to.numCheckers += 1;
    onBoard.selectedBarNum = -1;
    onBoard.selectedTriangleNum = -1;
    onBoard.dice.updateDiceOnMove(this, to)
    console.log("Moved from " + this.num + " to " + to.num);
  }
  */
}