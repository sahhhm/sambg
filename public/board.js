function Board(opts) {

  this.gTriangles = [];
  this.selectedBarNum = -1;
  this.selectedTriangleNum = -1;
  
  this.canDouble = false;
  this.playerCanConfirm = false;
  this.playerCanRoll = false;
  this.numMoves = 0;
  
  this.dice;
  this.drawer;
  
  this.turns;

  this.specs = {
    boardWidth : 13,
    boardHeight : 12,
    pieceWidth : 50,
    pieceHeight : 45,
    hitPieceWidth : 50,
    hitPieceHeight : 20,
    totalTriangles : 24,
    totalPiecesPerPlayer : 15,
    maxPiecesPerTriangle : 5,
    barColumn : 6,
    bearOffColumn : 13,
    bearOffWidth : 65,
    bearOffHeight: 15,
  };

  this.specs.pixelWidth = this.specs.boardWidth * this.specs.pieceWidth + 1 + this.specs.bearOffWidth;
  this.specs.pixelHeight = this.specs.boardHeight * this.specs.pieceHeight + 1;
  this.specs.p1color = opts.p1color;
  this.specs.p2color = opts.p2color;

  this.dice = new Dice();
  this.doublingDice = new DoublingDice();
    
  this.turns = new TurnHistory();

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
	 /*
	             [new Triangle(1, this.specs.boardWidth-1,   2, 2), // player 2 home begins
             new Triangle(2, this.specs.boardWidth-2,   2, 2),
             new Triangle(3, this.specs.boardWidth-3,   2, 2),
             new Triangle(4, this.specs.boardWidth-4,   2, 2),
             new Triangle(5, this.specs.boardWidth-5,   2, 2),
             new Triangle(6, this.specs.boardWidth-6,   2, 5), // player 2 home ends
             new Triangle(7, this.specs.boardWidth-8,   0, 0),
             new Triangle(8, this.specs.boardWidth-9,   2, 0),
             new Triangle(9, this.specs.boardWidth-10,  0, 0),
             new Triangle(10, this.specs.boardWidth-11, 0, 0),
             new Triangle(11, this.specs.boardWidth-12, 0, 0),
             new Triangle(12, this.specs.boardWidth-13, 1, 0),
             new Triangle(13, this.specs.boardWidth-13, 2, 0),
             new Triangle(14, this.specs.boardWidth-12, 0, 0),
             new Triangle(15, this.specs.boardWidth-11, 0, 0),
             new Triangle(16, this.specs.boardWidth-10, 0, 0),
             new Triangle(17, this.specs.boardWidth-9,  1, 0),
             new Triangle(18, this.specs.boardWidth-8,  0, 0),
             new Triangle(19, this.specs.boardWidth-6,  1, 3), // player 1 home begins
             new Triangle(20, this.specs.boardWidth-5,  1, 1),
             new Triangle(21, this.specs.boardWidth-4,  1, 5),
             new Triangle(22, this.specs.boardWidth-3,  1, 3),
             new Triangle(23, this.specs.boardWidth-2,  1, 3),
             new Triangle(24, this.specs.boardWidth-1,  1, 0)]; // player 1 home ends
      */
  this.gBars = [new Bar(1, 0, this.specs.barColumn, 0), 
                new Bar(2, this.specs.boardHeight - 1, this.specs.barColumn, 0)];
  
  this.gBearOffs = [new BearOff(1, 25, this.specs.boardHeight - 1, this.specs.bearOffColumn, 0),
                    new BearOff(2, 0, 0, this.specs.bearOffColumn, 0)]; 
                    
  this.getBars = function() {
    return this.gBars;
  } 
  
  this.getBearOffs = function() {
    return this.gBearOffs;
  }
  
  this.getBearOffByPlayerNum = function(n) {
    var bearOff = new BearOff(-1, -1, -1, -1);
    if (n > 0) {
      bearOff =  this.getBearOffs()[n-1];
    } 
    return bearOff;  
  } 
  
  this.getBarByNum = function(n) {
    var bar = new Bar(-1, -1, -1, -1);
    if (n > 0) {
      bar =  this.getBars()[n-1];
    } 
    return bar;
  }

  this.getSelectedBar = function() {
    return this.getBarByNum(this.selectedBarNum);
  }  
  
  this.getTriangles = function() {
    return this.gTriangles;
  }
  
  this.getTriangleByNum = function(n) {
    var tri = new Triangle(-1, -1, -1, -1)
    if (n >=1  && n <= 24) {
      tri = this.getTriangles()[n-1];
    } 
    return tri;
  }  
  
  this.getSelectedTriangle = function() {
    return this.getTriangleByNum(this.selectedTriangleNum);
  }
  
  this.getPlayers = function() {
    return this.bPlayers;
  }
  
  this.getPlayerByNum = function(n) {
    return this.getPlayers()[n-1];
  }
  
  this.update = function(opts) {
    if (!opts.forPlayer) {
      opts.forPlayer = -1;
    }
    if (opts.updateTurn) {
      this.turns.clearCurrentToHistory();
      this.dice.isRolled = false;
      this.numMoves += 1;    
    }
    if (opts.roll) {
      this.dice.roll({die1 : opts.die1, die2 : opts.die2});
    }
    if (opts.draw) {
      this.updateDraw();
    }
    if (opts.drawDice) {
      this.drawDice(opts.forPlayer);
    }
    if (opts.drawDoublingDice) {
      this.drawDoublingDice(opts.forPlayer);
    }
    if (opts.undo) {
      this.turns.currentTurn.length ? this.drawer.undoButtonElement.disabled = false : this.drawer.undoButtonElement.disabled = true;
    }
    if (opts.confirm) {
      this.canConfirm(opts.forPlayer) ? this.playerCanConfirm = true : this.playerCanConfirm = false;
    }
    if (opts.canRoll) {
      // canRoll data format ==> {num : playerNum}
      this.canRoll(opts.forPlayer) ? this.playerCanRoll = true : this.playerCanRoll = false;
    }
  }

  this.drawDice = function(forPlayerNum) {
    this.drawer.drawDice( { diceCopy : this.dice.diceCopy, dice: this.dice, currentPlayer: this.getPlayerByNum(this.playerTurn()), mePlayer: this.getPlayerByNum(forPlayerNum), otherPlayer: this.getPlayerByNum((this.playerTurn() % 2 + 1)), pCanConfirm: this.canConfirm(forPlayerNum), pCanRoll: this.canRoll(forPlayerNum) }  );
  }    
  
  
  this.drawDoublingDice = function(playerNum) {
    if (playerNum == this.playerTurn() && !this.dice.isRolled && this.doublingDice.lastPlayerToDoubleNum != playerNum) {
      this.canDouble = true;
      this.drawer.drawDoublingDice( { isActive: this.canDouble, value: this.doublingDice.value } );
    } else {
      this.canDouble = false;
      this.drawer.drawDoublingDice( { isActive: this.canDouble, value: this.doublingDice.value } );
    }
  }
  
  this.canConfirm = function(num) {
    // returns true if the user is able to confirm the move.
    // Either all dice moves have been played, or no valid
    // moves exist.
    return ( ( !this.dice.dice.length || !this.anyMovesLeft() ) && ( num == this.playerTurn() ) && this.dice.isRolled );
  }  

  this.canRoll = function(num) {
    // if it's the next players turn, let them request new dice.
    return ( (!this.dice.dice.length || !this.dice.isRolled) && num == this.playerTurn() );
    
  }
  
  this.updateDraw = function() {
    this.drawer.drawBoard();
    this.drawer.drawTriangles(this.getTriangles());
    this.drawer.drawBars(this.getBars());
    this.drawer.drawBearOffs(this.getBearOffs());
    
    // highlight moves from either bar or triangle, when applicable
    var from;
    if (this.getSelectedTriangle().num != -1) {
      from = this.getSelectedTriangle();
    } else if (this.getSelectedBar().num != -1) {
      from = this.getSelectedBar();
    }

    if (from) {
      fromPlayer = this.getPlayerByNum(from.player);
      var playerCanBear = false;
      var tos = [];
      var potentials = this.findPotentialMoves(from);
      for (var i = 0; i < potentials.length; i++) {
        for (var j = 0; j < potentials[i].moves.length; j++) {
          if (potentials[i].moves[j].toNo == fromPlayer.bearOffNum) {
            playerCanBear = true;
          } else {
            tos.push(this.getTriangleByNum(potentials[i].moves[j].toNo));
          }
        }
      }
      if (tos.length) this.drawer.highlightTriangles(from, tos);
      if (playerCanBear) this.drawer.highlightBearOff(this.getBearOffByPlayerNum(from.player));
    }  
  }
  
  this.findPotentialMoves = function(from) {
    //Given a triangle or bar, finds all (direct and combined) valid moves for the given board.
    //returns a list with entries defined like: {moves : list of AMove's }

    var tnum; 
    var tempTo;
    var tempFrom; 
    var entry = from.entry;
    var directs = new Array();
    var combineds = new Array();
	  var bears = new Array();
    var player = this.getPlayerByNum(from.player);
    var playerBar = this.getBarByNum(from.player);
    var curSum; // count of the number of spaces moved for the potential move
    var combinedFromTriangleNum; // for combined moves, this variable represents the current entry point

    
    for (var t = 0; t < 2; t++) {
    // ******************************
    // NORMAL, NON-BEAR MOVES *******
    // ******************************  
      // ******************************
      // ******* DIRECT MOVES SECTION
      // ******************************
      // ensure the direct moves are valid
      if (from.validMoveTo(this.getTriangleByNum(entry + (this.dice.dice[t] * player.direction)))) {
        
        // add the direct move
        tnum = entry + (this.dice.dice[t] * player.direction);
        tempTo = this.getTriangleByNum(tnum);
        directs.push( { moves : [new AMove( this.dice.confirmedRolls, from.player, from.num, from.type, tnum, tempTo.type, false, Math.abs( from.entry - tempTo.entry ) )] } );
        curSum = this.dice.dice[t];
      
      
        // now begin to look at any potential combined moves after this initial direct move
        combinedFromTriangleNum = entry;
        tnum = combinedFromTriangleNum + (this.dice.dice[t] * player.direction);
        
        // begin looking for combined moves only if the player has 1 or less chekers in their bar
        if (playerBar.numCheckers <= 1) {
        // ******************************
        // ******* COMBINED MOVES SECTION
        // ******************************
          // add the initialial direct move
          tempTo = this.getTriangleByNum( tnum );
          tempFrom = this.getTriangleByNum( combinedFromTriangleNum );
          combineds.push( { moves : [new AMove(this.dice.confirmedRolls, from.player, tempFrom.num, tempFrom.type, tnum, tempTo.type, false, Math.abs( tempFrom.entry - tempTo.entry ) )] } );
          combinedFromTriangleNum = tnum;   
          for (var i = 0; i < this.dice.dice.length; i++) {
        
            // make sure we don't try to move on the same dice twice
            if (i != t) {
             
              // make sure combined move is valid
              if (from.validMoveTo(this.getTriangleByNum(entry + ((curSum + this.dice.dice[i]) * player.direction)))) {
           
                tnum = entry + ((curSum + this.dice.dice[i]) * player.direction);
                tempTo = this.getTriangleByNum( tnum );
                tempFrom = this.getTriangleByNum( combinedFromTriangleNum );
                // create a copy of the most recent combined move and build/add the combined move off of that
                var movecpy = combineds[combineds.length-1].moves.slice();
                combineds.push( { moves: movecpy });
                combineds[combineds.length - 1].moves.push(new AMove(this.dice.confirmedRolls, from.player, tempFrom.num, tempFrom.type, tnum, tempTo.type, false, Math.abs ( tempFrom.entry - tempTo.entry ) ));
                combinedFromTriangleNum = tnum;
                curSum += this.dice.dice[i];	
              
              } else {
                break;
              }
            }
          }
        }
      }
    }
	
    // ******************************
    // ******* BEAR OFF MOVES SECTION
    // ****************************** 
    if (this.playerReadyToBearOff(player)) {
      for (var t = 0; t < this.dice.dice.length; t++) {
	      var start = -1;
	      //determine the first space from where the player can bar off from
	      for (var i = 0; i < 6; i++) {
		    var tr = this.getTriangleByNum(player.homeStartNum + (i * player.direction))
          if (tr.numCheckers > 0 && tr.player == player.num) {
		        start = tr.num;
			      //console.log("potential bear off start", start);
			      break;
		      }
        }	

	      // check to see if the player can directly bear off
	      var fromNormalized = ( Math.abs( from.num - player.homeEndNum ) + 1 );
	      var startNormalized = ( Math.abs(start - player.homeEndNum) + 1 );
        var tempBear = this.getBearOffByPlayerNum( player.num );
	      if ( this.dice.dice[t] + from.num * player.direction  == 0 || this.dice.dice[t] + from.num * player.direction == 25 ) {
	        console.log("CAN BEAR OFF FROM", from.num);
	        bears.push( { moves : [new AMove( this.dice.confirmedRolls, from.player, from.num, from.type, tempBear.num, tempBear.type, false, Math.abs( from.entry - tempBear.entry ) )] } );
	      } else if (fromNormalized  == startNormalized && this.dice.dice[t] > startNormalized) {
	        console.log("CAN BEAR OFF due greater dice FROM", from.num);
	        bears.push( { moves : [new AMove( this.dice.confirmedRolls, from.player, from.num, from.type, tempBear.num, tempBear.type, false, this.dice.dice[t] )] } );
	      }
      }		  
    } else {
      console.log("player not ready to bear off yet");
    }
	
    //combine and return all potential moves
    directs = directs.concat(bears);
    return directs.concat(combineds);	
  }  
  
  this.playerReadyToBearOff = function(p) {
    var numChecks = 0;
    
    for (var i = 1; i < this.getTriangles().length + 1; i++) {
	
	  // get the home start and finish in min,max order
      var min = Math.min(p.homeStartNum, p.homeEndNum);
      var max = Math.max(p.homeStartNum, p.homeEndNum);

      if ( !(i >= min && i <= max) ) { 
        var t =  this.getTriangleByNum(i);
        if (t.player == p.num && t.numCheckers > 0) {
          numChecks += t.numCheckers;
        }
      } 
    }
	numChecks += this.getBarByNum(p.num).numCheckers;
	
    //console.log(numChecks, "not in home court.... need 0");
    return numChecks == 0;
  }
  
  this.updateSpace = function(from, to) {
    var foundPotential;
    
    // search potential moves to find the move that ends at to.num
    var potentials = this.findPotentialMoves(from);
    for (var i = 0; i < potentials.length; i++ ) {
      if (potentials[i].moves[potentials[i].moves.length -1].toNo == to.num) {
        // found it!
        foundPotential = potentials[i];
        break;
      }   
    } 
	
    if (foundPotential) {
      for (var j = 0; j < foundPotential.moves.length; j++) {
        this.move(foundPotential.moves[j]);
      }
    } else {
      this.selectedTriangleNum = -1;
      this.selectedBarNum = -1;
    } 
  }  

  
  this.move = function(aMove) {
    // initialize the from and to areas
    if ( aMove.fromType == "triangle" ) {
      from = this.getTriangleByNum( aMove.fromNo );
    } else {
      from = this.getBarByNum( aMove.player );
    }
    //if (aMove.toNo == 0 || aMove.toNo == 25) {
    if ( aMove.toType == "bearoff" ) {
      to = this.getBearOffByPlayerNum( from.player );
    } else {
      to = this.getTriangleByNum( aMove.toNo );
    }
    
    // update the move information as needed
    if (to.numCheckers == 1 && to.player != from.player) {
      aMove.isToHit = true;
    }
    
    // adjust triangle checker counts
    from.numCheckers -= 1;
    to.numCheckers += 1;

    // if the to player is hit, update accordingly
    if (aMove.isToHit) {
      this.getBarByNum(to.player).numCheckers += 1;
      to.numCheckers -= 1;
    }
    
    // ensure player type is correct
    to.player = from.player;    
    
    // since we just moved, nothing should be active
    this.selectedBarNum = -1;
    this.selectedTriangleNum = -1;
    
    // update the dice based on the move + default to max dice (for bearOff specials)
    this.dice.updateDiceOnMove( aMove.diceValue );
    
    // add the move to the history
    console.log("Moved from " + from.num + " to " + to.num);
    this.turns.addAMove(aMove);
  }
  
  this.undoMove = function() {
    var otherPlayer;
    var theMove = this.turns.currentTurn.pop();
    
    if (theMove.fromType == "triangle") {
      to = this.getTriangleByNum( theMove.fromNo );
    } else {
      to = this.getBarByNum( theMove.player );
    }
    //if (theMove.toNo == 0 || theMove.toNo == 25) {
    if ( theMove.toType == "bearoff" ) {
	    from = this.getBearOffByPlayerNum( to.player );
	  } else {
	    from = this.getTriangleByNum( theMove.toNo );
	  }

    from.numCheckers -= 1;
    to.numCheckers += 1;

    // if the to player was hit, update accordingly
    if (theMove.isToHit) {
      from.player == 1 ? otherPlayer = 2 : otherPlayer = 1;
      this.getBarByNum(otherPlayer).numCheckers -= 1;
      from.numCheckers += 1;
      from.player = otherPlayer;
    }   

    // since we just moved, nothing should be active
    this.selectedBarNum = -1;
    this.selectedTriangleNum = -1;    
    
    // update the dice based on the move
    this.dice.replaceDiceOnUndo( theMove.diceValue );
    console.log("undo move from " + from.entry + " to " + to.entry);
  }
  
  this.anyMovesLeft = function(forPlayer) {
    var any = false;
    if (forPlayer) {
      var player = forPlayer;
    } else {
      var player = this.playerTurn();
    }
    if (this.getBarByNum(player).isEmpty()) {
      for (var i = 1 ; i < this.getTriangles().length + 1; i++) {
        var curTri = this.getTriangleByNum(i);
        if (curTri.player == player && !curTri.isEmpty()) {
          if (this.findPotentialMoves(curTri).length) {
            any = true;
            break;
          }
        }
      }	
    } else {
      if (this.findPotentialMoves(this.getBarByNum(player)).length) {
        any = true;
      }	
    }
    return any;
  }  
  
  this.playerTurn = function() {
    return bggame.board.numMoves % 2 + 1
  }  
  
}