function Board(opts) {

  this.gTriangles = [];
  this.selectedBarNum = -1;
  this.selectedTriangleNum = -1;
  
  this.dice;
  this.drawer;
  

	  this.specs = {
        boardWidth : 13,
        boardHeight : 12,
        pieceWidth : 50,
        pieceHeight : 45,
        hitPieceWidth : 50,
        hitPieceHeight : 20,
        totalTriangles : 24,
        maxPiecesPerTriangle : 5,
        barColumn : 6
	  };
	  this.specs.pixelWidth = this.specs.boardWidth * this.specs.pieceWidth + 1;
	  this.specs.pixelHeight = this.specs.boardHeight * this.specs.pieceHeight + 1;
	  this.specs.p1color = opts.p1color;
	  this.specs.p2color = opts.p2color;

	  this.dice = new Dice();
	  
	  this.drawer = new Drawer(this.specs);	  
	  
      this.drawer.canvasElement.width = this.specs.pixelWidth;
      this.drawer.canvasElement.height = this.specs.pixelHeight;
  
	  this.bPlayers = opts.players;
	  
      this.gTriangles = 
	    [new Triangle(1, this.specs.boardWidth-1,   1, 2),
         new Triangle(2, this.specs.boardWidth-2,   0, 0),
		 new Triangle(3, this.specs.boardWidth-3,   0, 0),
		 new Triangle(4, this.specs.boardWidth-4,   0, 0),
		 new Triangle(5, this.specs.boardWidth-5,   0, 0),
		 new Triangle(6, this.specs.boardWidth-6,   2, 5),
		 new Triangle(7, this.specs.boardWidth-8,   0, 0),
		 new Triangle(8, this.specs.boardWidth-9,   2, 3),
		 new Triangle(9, this.specs.boardWidth-10,  0, 0),
		 new Triangle(10, this.specs.boardWidth-11, 0, 0),
		 new Triangle(11, this.specs.boardWidth-12, 0, 0),
		 new Triangle(12, this.specs.boardWidth-13, 1, 5),
		 new Triangle(13, this.specs.boardWidth-13, 2, 5),
		 new Triangle(14, this.specs.boardWidth-12, 0, 0),
		 new Triangle(15, this.specs.boardWidth-11, 0, 0),
		 new Triangle(16, this.specs.boardWidth-10, 0, 0),
		 new Triangle(17, this.specs.boardWidth-9,  1, 3),
		 new Triangle(18, this.specs.boardWidth-8,  0, 0),
		 new Triangle(19, this.specs.boardWidth-6,  1, 5),
		 new Triangle(20, this.specs.boardWidth-5,  0, 0),
		 new Triangle(21, this.specs.boardWidth-4,  0, 0),
		 new Triangle(22, this.specs.boardWidth-3,  0, 0),
		 new Triangle(23, this.specs.boardWidth-2,  0, 0),
		 new Triangle(24, this.specs.boardWidth-1,  2, 2)];
	  
	  this.gBars = [new Bar(1, 0, this.specs.barColumn, 0), 
	                new Bar(2, this.specs.boardHeight - 1, this.specs.barColumn, 0)];
	  
  
  
  this.getBarByNum = function(n) {
    var bar = new Bar(-1, -1, -1, -1);
    if (n > 0) {
	  bar =  this.gBars[n-1];
	} 
	return bar;
  }

  this.getSelectedBar = function() {
    return this.getBarByNum(this.selectedBarNum);
  }  
  
  this.hasSelectedBar = function() {
    return this.selectedBarNum > 0;
  }
  
  this.getTriangleByNum = function(n) {
    var tri = new Triangle(-1, -1, -1, -1)
    if (n > 0) {
	  tri = this.gTriangles[n-1];
	} 
	return tri;
  }  
  
  this.getSelectedTriangle = function() {
    return this.getTriangleByNum(this.selectedTriangleNum);
  }
  
  this.hasSelectedTriangle = function() {
    return this.selectedTriangleNum > 0;
  }  
  
  this.update = function(opts) {
    if (opts.roll) {
	  this.dice.roll();
	}
	if (opts.draw) {
	  this.drawer.drawBoard();
	  this.drawer.drawTriangles(this.gTriangles, this.bPlayers);
	  this.drawer.drawBars(this.gBars, this.bPlayers);
	  
	  if (this.getSelectedTriangle().num != -1) {
	    this.drawer.highlightTriangles(this.getSelectedTriangle(), this.findPotentialMoves(this.getSelectedTriangle()));	
	  } else if (this.getSelectedBar().player != -1) {
	    this.drawer.highlightBars(this.getSelectedBar(), this.findPotentialMoves(this.getSelectedBar()));
	  }
	  
	}
	if (opts.text) {
	  this.updateText();
	}
	if (opts.confirm) {
	  this.canConfirm();
	}
  
  }

  this.updateText = function() {
    var i;
    var text = "";
    text += " [ ";
    for (var i = 0; i < this.dice.diceCopy.length; i++) 
      i == this.dice.diceCopy.length -1 ? text += this.dice.diceCopy[i]  : text += this.dice.diceCopy[i] + " - ";
    text += " ] ";
    for (var i = 0; i < this.dice.dice.length; i++)
      i == this.dice.dice.length -1 ? text += this.dice.dice[i]  : text += this.dice.dice[i] + " - ";
    this.drawer.currentDiceElement.innerHTML = text;
    this.drawer.playerTurnElement.innerHTML = this.playerTurn();
  }    
  
  this.canConfirm = function() {
    (!this.dice.dice.length || !this.anyMovesLeft()) ? this.drawer.confirmButtonElement.disabled = false : this.drawer.confirmButtonElement.disabled = true;   
  }  

  this.findPotentialMoves = function(from) {
    var temp, i, curSum, curDie, directs, combineds;
    var player = this.bPlayers[from.player-1];
    var entry = from.entry;
	var directs = new Array();
	var combineds = new Array();
	
	for (var t = 0; t < 2; t++) {
	  if (from.validMoveTo(this.gTriangles[entry + (this.dice.dice[t] * player.direction) - 1])) {
        curDie = [this.dice.dice[t]];	
        directs.push([this.gTriangles[entry + (this.dice.dice[t] * player.direction) - 1], curDie.slice(0)]);
        curSum = this.dice.dice[t];
        for (i = 0; i < this.dice.dice.length; i++) {
	      if (i != t) {
			if (from.validMoveTo(this.gTriangles[entry + ((curSum + this.dice.dice[i]) * player.direction) - 1])) {
		      curDie.push(this.dice.dice[i]);
	          combineds.push([this.gTriangles[entry + ((curSum + this.dice.dice[i]) * player.direction) - 1], curDie.slice(0)]);
			  curSum += this.dice.dice[i];			
	        } else {
              break;
            }
          }
	    }
  	  }
	}
    return directs.concat(combineds);	
  }  
  
  this.updateTriangle = function(from, to) {
    var isValid = false;
    if (this.validDiceMoveTo(from, to)) {	  
	  // try to move 
	    if (from.numCheckers) {
	      //make sure player is moving in the right direction 
	      if (from.player == 1 && from.num > to.num) {
	        console.log("Player 1 trying to move backwards from " + from.num + " to " + to.num);
	        this.selectedTriangleNum = -1;
	      } else if (from.player == 2 && from.num < to.num) {
	        console.log("Player 2 trying to move backwards from " + from.num + " to " + to.num);	  
	        this.selectedTriangleNum = -1;
	      } else if (!this.gBars[from.player-1].isEmpty()) {
		    console.log("Player " + from.player + " needs to move off the bar");
		    this.selectedTriangleNum = -1;
	      } else if (from.num == to.num) {
            console.log("Clicked on the same triangle");
          } else {
	        if (to.numCheckers == 0) {
	          // need to assign new player to empty triangle 
	          console.log("Moving from " + this.selectedTriangleNum + " to " + to.num + " (an empty triangle)");
	          to.player = from.player;
		      isValid = true;
	        } else if (to.numCheckers == 1) {
		      isValid = true;		  
		      if (from.player != to.player) {
		        // player has been hit 
			    to.numCheckers -= 1;
			    this.gBars[to.player-1].numCheckers += 1;
			    console.log("Player " + to.player + " hit at Triangle " + to.num);		
			    to.player = from.player;
		      }
		    } else if (to.numCheckers > 1) {
		      if (from.player != to.player) {
		        console.error("Trying to move to a triangle occupied by another player - from " + from.num + " to " + to.num + "(" + to.numCheckers + " checkers)");              
		      } else {
		        isValid = true;
		      }  
		    }
	      }
	    } else {
	      this.selectedTriangleNum = -1;
	      console.log("ERROR - Trying to move from triangle with no checkers");
	    }
	  } else {
	    console.log("not proper dice");
	    this.selectedTriangleNum = -1;
	  }

    if (isValid) this.move(from, to);  
  }

  this.updateBar = function(from, to) {
    var isValid = false;
  
    if (this.validDiceMoveTo(from, to)) {
      if (to.numCheckers == 0) {
	    isValid = true;
        to.player = from.player;
      } else if (to.numCheckers == 1) {
	    if (from.player == to.player) {
		  isValid = true;
	    } else {
	      //player hit
		  console.log("Player " + from.player + " hit Player " + to.player + " from the bar");
		  this.gBars[to.player-1].numCheckers += 1;
		  to.numCheckers -= 1;
		  to.player = from.player;
		  isValid = true;
	    }
	  } else {
	    if (from.player == to.player) {
		  isValid = true;
	    } else {
	      console.log("Player " + from.player + " cannot move form the bar to triangle " + to.num + " because Player " + to.player + " is occupying the triangle");
	    }
	  }
    } else {
      console.log("Player " + from.player + " tried to move from the bar to triangle " + to.num);
      this.selectedBarNum = -1;
    }
  
    if (isValid) this.move(from, to);
  }    
  
  
  this.validDiceMoveTo = function(from, to) {
    var isValid = false;
    if (from.player == this.playerTurn()) {
      var i;
      var potentials = this.findPotentialMoves(from);
      for  (i = 0; i < potentials.length; i++) {
       if (potentials[i][0].num == to.num) isValid = true;
      }
    } else {
      console.log("Incorrect player moving");
    }
    return isValid;
  }  

  this.move = function(from, to) {
    from.numCheckers -= 1;
    to.numCheckers += 1;
    this.selectedBarNum = -1;
    this.selectedTriangleNum = -1;
    this.dice.updateDiceOnMove(from, to, this.findPotentialMoves(from))
    console.log("Moved from " + from.num + " to " + to.num);
  }  
  
  this.anyMovesLeft = function() {
    var any = false;
    var player = this.playerTurn();
	
	if (this.gBars[player - 1].isEmpty()) {
      for (var i = 0 ; i < this.gTriangles.length; i++) {
        if (this.gTriangles[i].player == player && !this.gTriangles[i].isEmpty()) {
	      if (this.findPotentialMoves(this.gTriangles[i]).length) {
	        any = true;
	        break;
	      }
	    }
      }	
	} else {
	  if (this.findPotentialMoves(this.gBars[player-1]).length) {
	    any = true;
	  }	
	}
    return any;
  }  
  
  
  this.playerTurn = function() {
    return this.dice.confirmedRolls % 2 ? 1: 2;
  }  
}	  