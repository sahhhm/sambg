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
  this.entry = num;
  
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
  
  this.update = function(to, onBoard) {
    var isValid = false;
    if (this.validDiceMoveTo(to, onBoard.dice)) {	  
	  // try to move 
	    if (this.numCheckers) {
	      //make sure player is moving in the right direction 
	      if (this.player == 1 && this.num > to.num) {
	        console.log("Player 1 trying to move backwards from " + this.num + " to " + to.num);
	        onBoard.selectedTriangleNum = -1;
	      } else if (this.player == 2 && this.num < to.num) {
	        console.log("Player 2 trying to move backwards from " + this.num + " to " + to.num);	  
	        onBoard.selectedTriangleNum = -1;
	      } else if (onBoard.gPlayers[this.player-1].isHit()) {
		    console.log("Player " + this.player + " needs to move off the bar");
		    onBoard.selectedTriangleNum = -1;
	      } else if (this.num == to.num) {
            console.log("Clicked on the same triangle");
          } else {
	        if (to.numCheckers == 0) {
	          // need to assign new player to empty triangle 
	          console.log("Moving from " + onBoard.selectedTriangleNum + " to " + to.num + " (an empty triangle)");
	          to.player = this.player;
		      isValid = true;
	        } else if (to.numCheckers == 1) {
		      isValid = true;		  
		      if (this.player != to.player) {
		        // player has been hit 
			    to.numCheckers -= 1;
			    onBoard.gPlayers[to.player-1].bar.numCheckers += 1;
			    console.log("Player " + to.player + " hit at Triangle " + to.num);		
			    to.player = this.player;
		      }
		    } else if (to.numCheckers > 1) {
		      if (this.player != to.player) {
		        console.error("Trying to move to a triangle occupied by another player - from " + this.num + " to " + to.num + "(" + to.numCheckers + " checkers)");              
		      } else {
		        isValid = true;
		      }  
		    }
	      }
	    } else {
	      onBoard.selectedTriangleNum = -1;
	      console.log("ERROR - Trying to move from triangle with no checkers");
	    }
	  } else {
	    console.log("not proper dice");
	    onBoard.selectedTriangleNum = -1;
	  }

    if (isValid) this.move(to, onBoard);  
  }
  
  this.move = function(to, onBoard) {
    this.numCheckers -= 1;
    to.numCheckers += 1;
    onBoard.selectedBarNum = -1;
    onBoard.selectedTriangleNum = -1;
    onBoard.dice.updateDiceOnMove(this, to)
    console.log("Moved from " + this.num + " to " + to.num);
  }
  
}
