function Board(opts) {

  this.selectedBarNum = -1;
  this.selectedTriangleNum = -1;
  
  this.canDouble = false;
  this.playerCanConfirm = false;
  this.playerCanRoll = false;
  this.waitingForNextTurn = false;
  this.numMoves = 0;
  this.gameOverValue = -1; // -1, not over; otherwise, multiplier for doubling dice

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
  
  Drawable.initialize(this.specs);
  this.drawer = createDrawer();	

  this.dice = createDice(); 
  this.doublingDice = createDoublingDice(); 
  
  this.turns = new TurnHistory();
  
  this.bPlayers = opts.players;
 
  this.gTriangles = 
    [createTriangle( 01, this.specs.boardWidth-01, 1, 2 ),
     createTriangle( 02 ,this.specs.boardWidth-02, 0, 0 ),
     createTriangle( 03, this.specs.boardWidth-03, 0, 0 ),
     createTriangle( 04, this.specs.boardWidth-04, 0, 0 ),
	 createTriangle( 05, this.specs.boardWidth-05, 0, 0 ),
	 createTriangle( 06, this.specs.boardWidth-06, 2, 5 ),
	 createTriangle( 07, this.specs.boardWidth-08, 0, 0 ),
	 createTriangle( 08, this.specs.boardWidth-09, 2, 3 ),
	 createTriangle( 09, this.specs.boardWidth-10, 0, 0 ),
	 createTriangle( 10, this.specs.boardWidth-11, 0, 0 ),
	 createTriangle( 11, this.specs.boardWidth-12, 0, 0 ),
	 createTriangle( 12, this.specs.boardWidth-13, 1, 5 ),
	 createTriangle( 13, this.specs.boardWidth-13, 2, 5 ),
	 createTriangle( 14, this.specs.boardWidth-12, 0, 0 ),
	 createTriangle( 15, this.specs.boardWidth-11, 0, 0 ),
	 createTriangle( 16, this.specs.boardWidth-10, 0, 0 ),
	 createTriangle( 17, this.specs.boardWidth-09, 1, 3 ),
	 createTriangle( 18, this.specs.boardWidth-08, 0, 0 ),
	 createTriangle( 19, this.specs.boardWidth-06, 1, 5 ),
	 createTriangle( 20, this.specs.boardWidth-05, 0, 0 ),
	 createTriangle( 21, this.specs.boardWidth-04, 0, 0 ),	
	 createTriangle( 22, this.specs.boardWidth-03, 0, 0 ),	
	 createTriangle( 23, this.specs.boardWidth-02, 0, 0 ),	
	 createTriangle( 24, this.specs.boardWidth-01, 2, 2 )];

  this.gBars = [ createBar( 1, 1, this.specs.barColumn, 0 ), createBar (2, 2, this.specs.barColumn, 0 ) ];

  this.gBearOffs = [ createBearoff( 1, 25, this.specs.bearOffColumn, 0 ), createBearoff( 2, 0, this.specs.bearOffColumn, 0 ) ];
     
  this.drawer.sets( this.gTriangles, this.gBars, this.gBearOffs, this.dice, this.doublingDice );	

  this.getBars = function() {
    return this.gBars;
  } 
  
  this.getBearOffs = function() {
    return this.gBearOffs;
  }
  
  this.getBearOffByPlayerNum = function(n) {
    var bearOff = Object.create(Bearoff);
    if (n > 0) {
      bearOff =  this.getBearOffs()[n-1];
    } 
    return bearOff;  
  } 
  
  this.getBarByNum = function(n) {
    var bar = Object.create(Bar);
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
    var tri = Object.create(Triangle);
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
  
  this.roll = function(opts) {
    this.dice.roll({die1 : opts.die1, die2 : opts.die2});
  }
 
  this.updateTurn = function() {
    this.turns.clearCurrentToHistory();
    this.dice.isRolled = false;
    this.numMoves += 1;
  }
  
  this.updateNakedBoard = function() {
    this.drawer.drawNakedBoard( this.getTriangles(), this.getBars(), this.getBearOffs() );
  }

  this.update = function(opts) {
    if (!opts.forPlayer) {
      opts.forPlayer = -1;
    }

    this.updateDraw();
	this.checkElements(opts.forPlayer);
    
  }
  
  this.checkElements = function(forPlayer) {
    this.turns.currentTurn.length ? this.drawer.undoButtonElement.disabled = false : this.drawer.undoButtonElement.disabled = true;
    this.canConfirm(forPlayer) ? this.playerCanConfirm = true : this.playerCanConfirm = false;
    this.canRoll(forPlayer) ? this.playerCanRoll = true : this.playerCanRoll = false;
    this.drawDice(forPlayer);
    this.drawDoublingDice(forPlayer);  
    this.gameOverValue = this.getGameOverCode(forPlayer);
  }

  this.drawDice = function(forPlayerNum) {
    //this.drawer.drawDice( { dice: this.dice, currentPlayer: this.getPlayerByNum(this.playerTurn()), mePlayer: this.getPlayerByNum(forPlayerNum), otherPlayer: this.getPlayerByNum((this.playerTurn() % 2 + 1)), pCanConfirm: this.canConfirm(forPlayerNum), pCanRoll: this.canRoll(forPlayerNum) }  );
    this.drawer.drawDice( this.getPlayerByNum(this.playerTurn()), this.getPlayerByNum(forPlayerNum), this.getPlayerByNum((this.playerTurn() % 2 + 1)), this.canConfirm(forPlayerNum), this.canRoll(forPlayerNum) );
  }    
  
  this.drawDoublingDice = function(playerNum) {
    this.canDouble = (playerNum == this.playerTurn() && !this.dice.isRolled && this.doublingDice.lastPlayerToDoubleNum != playerNum) ? true : false;
    //this.drawer.drawDoublingDice( { isActive: this.canDouble, value: this.doublingDice.value } );
	this.drawer.drawDoublingDice();
  }
  
  this.canConfirm = function(num) {
    // returns true if the user is able to confirm the move.
    // Either all dice moves have been played, or no valid
    // moves exist.
    return ( ( !this.dice.numUnusedDice() || !this.anyMovesLeft() ) && ( num == this.playerTurn() ) && this.dice.isRolled );
  }  

  this.canRoll = function(num) {
    // if it's the next players turn, let them request new dice.
    return ( (!this.dice.numUnusedDice() || !this.dice.isRolled) && num == this.playerTurn() );
    
  }
  
  this.updateDraw = function() {
    // highlight moves from either bar or triangle, when applicable
    var from;
    if (this.getSelectedTriangle().num != -1) {
      from = this.getSelectedTriangle();
    } else if (this.getSelectedBar().num != -1) {
      from = this.getSelectedBar();
    }

    var pots = [];
    if (from) {
      var tos = [];
      var playerCanBear = false;
      var potentials = this.findPotentialMoves(from);
      var fromPlayer = this.getPlayerByNum(from.player);

      // look for all the potential spaces the player can move to and highlight them
      for (var i = 0; i < potentials.length; i++) {
        for (var j = 0; j < potentials[i].moves.length; j++) {
          if (potentials[i].moves[j].toNo == fromPlayer.bearOffNum) {
            playerCanBear = true;
          } else {
            tos.push(this.getTriangleByNum(potentials[i].moves[j].toNo));
          }
        }
      }
      pots = tos;
      if (playerCanBear) {
        pots = tos.concat( [ this.getBearOffByPlayerNum( from.player ) ] );
      } 
    }
    this.drawer.drawPotentials(from, pots);
	//this.drawer.drawBoard(from, pots);
  }
  
  this.findPotentialMoves = function(from) {
    //Given a triangle or bar, finds all (direct and combined) valid moves for the given board.
    //returns a list with entries defined like: {moves : list of AMove's }

    var tnum; 
    var tempTo;
    var tempFrom; 
    var entry = from.entry();
    var directs = new Array();
    var combineds = new Array();
	var bears = new Array();
    var player = this.getPlayerByNum(from.player);
    var playerBar = this.getBarByNum(from.player);
    var curSum; // count of the number of spaces moved for the potential move
    var combinedFromTriangleNum; // for combined moves, this variable represents the current entry point

    
    for (var t = 0; t < this.dice.dice.length; t++) {
      if ( !this.dice.dice[t].isUsed ) {
      // ******************************
      // NORMAL, NON-BEAR MOVES *******
      // ******************************  
        // ******************************
        // ******* DIRECT MOVES SECTION
        // ******************************
        // ensure the direct moves are valid
        if (from.validMoveTo(this.getTriangleByNum(entry + (this.dice.dice[t].value * player.direction)))) {
          
          // add the direct move
          tnum = entry + (this.dice.dice[t].value * player.direction);
          tempTo = this.getTriangleByNum(tnum);
          directs.push( { moves : [new AMove( this.dice.confirmedRolls, from.player, from.num, from.type, tnum, tempTo.type, false, Math.abs( from.entry() - tempTo.entry() ) )] } );
          curSum = this.dice.dice[t].value;
    
          
          // ******************************
          // ******* COMBINED MOVES SECTION
          // ******************************
          
          // begin looking for combined moves only if the player has 1 or less chekers in their bar
          if (playerBar.numCheckers <= 1) {
          
            // add the initialial direct move
            var dircpy = directs[ directs.length - 1 ].moves.slice();
            combineds.push( { moves: dircpy  });
            //combineds.push( directs[ directs.length - 1 ] );
            tnum = entry + (this.dice.dice[t].value * player.direction);
            combinedFromTriangleNum = tnum;   
            
            for (var i = 0; i < this.dice.dice.length; i++) {
              if ( !this.dice.dice[i].isUsed ) {
                // make sure we don't try to move on the same dice twice
                if (i != t) {
                 
                  // make sure combined move is valid
                  if (from.validMoveTo(this.getTriangleByNum(entry + ((curSum + this.dice.dice[i].value) * player.direction)))) {
               
                    tnum = entry + ((curSum + this.dice.dice[i].value) * player.direction);
                    tempTo = this.getTriangleByNum( tnum );
                    tempFrom = this.getTriangleByNum( combinedFromTriangleNum );
                    // create a copy of the most recent combined move and build/add the combined move off of that
                    var movecpy = combineds[combineds.length-1].moves.slice();
                    combineds.push( { moves: movecpy });
                    combineds[combineds.length - 1].moves.push(new AMove(this.dice.confirmedRolls, from.player, tempFrom.num, tempFrom.type, tnum, tempTo.type, false, Math.abs ( tempFrom.entry() - tempTo.entry() ) ));
                    combinedFromTriangleNum = tnum;
                    curSum += this.dice.dice[i].value;	
                  
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
            if ( !this.dice.dice[t].isUsed ) {
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
              if ( this.dice.dice[t].value + from.num * player.direction  == 0 || this.dice.dice[t].value + from.num * player.direction == 25 ) { // CLEAN UP
                console.log("CAN BEAR OFF FROM", from.num);
                bears.push( { moves : [new AMove( this.dice.confirmedRolls, from.player, from.num, from.type, tempBear.num, tempBear.type, false, Math.abs( from.entry() - tempBear.entry() ) )] } );
              } else if (fromNormalized  == startNormalized && this.dice.dice[t].value > startNormalized) {
                console.log("CAN BEAR OFF due greater dice FROM", from.num);
                bears.push( { moves : [new AMove( this.dice.confirmedRolls, from.player, from.num, from.type, tempBear.num, tempBear.type, false, this.dice.dice[t].value )] } );
              }
            }		
          }      
        }
      }
    }
    //combine and return all potential moves
    directs = directs.concat(bears);
    return directs.concat(combineds);	
 
  }  
  
  this.updateSpace = function(from, to) {
    var foundPotential;
	var moves = [];
    
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
		    moves.push(foundPotential.moves[j]);
      }
    } else {
      this.selectedTriangleNum = -1;
      this.selectedBarNum = -1;
    }

	  this.move(moves);
  }  

  this.move = function(moves) {
    var aMove = moves[0];
	moves.shift();
	
	this.drawer.undoDecorations();
	
    // initialize the from and to areas
    if ( aMove.fromType == "triangle" ) {
      from = this.getTriangleByNum( aMove.fromNo );
    } else {
      from = this.getBarByNum( aMove.player );
    }
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
 
    this.drawer.animateMove(from, to);	
	
    // since we just moved, nothing should be active
    this.selectedBarNum = -1;
    this.selectedTriangleNum = -1;
    
    // update the dice based on the move + default to max dice (for bearOff specials)
    this.dice.updateDice( aMove.diceValue, false );
    
    // add the move to the history
    console.log("Moved from " + from.num + " to " + to.num);
    this.turns.addAMove(aMove);
	
	this.checkElements(from.player);
	
    if (moves.length) {
      var self = this;
	  setTimeout( function() { self.move(moves); }, 750 );
    } 
    
  }
  
  this.undoMove = function() {
    var otherPlayer;
    var theMove = this.turns.currentTurn.pop();
    
    if (theMove.fromType == "triangle") {
      to = this.getTriangleByNum( theMove.fromNo );
    } else {
      to = this.getBarByNum( theMove.player );
    }
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
      //from.numCheckers += 1;
      from.player = otherPlayer;
    }   

    this.drawer.animateMove(from, to);	
	// this moves for hit moves because by the time the drawer draws
	// the from space, the below incremement will have taken place
	if ( theMove.isToHit ) from.numCheckers += 1;
	
	
    // since we just moved, nothing should be active
    this.selectedBarNum = -1;
    this.selectedTriangleNum = -1;    
    
    // update the dice based on the move
    this.dice.updateDice( theMove.diceValue, true );
    console.log("undo move from " + from.entry() + " to " + to.entry());
  }
  
  this.anyMovesLeft = function() {
    var any = false;
    var player = this.playerTurn();
    
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
  
  this.getGameOverCode = function(forPlayerNum) {
    // returns -1 if the game is not over;
	// otherwise, returns number of points user won by
	var retval = -1;
	var factor = 1;
	var otherPlayerNum = forPlayerNum % 2 + 1;
	var bearForPlayer = this.getBearOffByPlayerNum( forPlayerNum ); 
	var bearOtherPlayer = this.getBearOffByPlayerNum( otherPlayerNum )
	if ( bearForPlayer.numCheckers == this.specs.totalPiecesPerPlayer ) {
	  if ( bearOtherPlayer.numCheckers <= 0 ) {
	    if ( this.inquireCheckerNotInAHome( this.getPlayerByNum( otherPlayerNum ), this.getPlayerByNum( forPlayerNum ) ) < this.specs.totalPiecesPerPlayer ) { 
		  factor = 3;        
        } else {
          factor = 2;
		}
	  }
	  retval = this.doublingDice.value * factor;
	} 
	return retval;
  }
  
  this.playerReadyToBearOff = function(p) {
    return this.inquireCheckerNotInAHome( p, p ) == 0;
  }  
  
  this.inquireCheckerNotInAHome = function(inquirePlayer, homePlayer) {
    // given an inquiring and home player object, returns the number of
    // checkers the inquriing player does not have in the home players home
    var numChecks = 0;
    for (var i = 1; i < this.getTriangles().length + 1; i++) {
	  // get the home start and finish in min,max order
      var end1 = Math.min(homePlayer.homeStartNum, homePlayer.homeEndNum);
      var end2 = Math.max(homePlayer.homeStartNum, homePlayer.homeEndNum);

      // sum up number of checkers that are not in players home
      if ( !(i >= end1 && i <= end2) ) { 
        var t =  this.getTriangleByNum(i);
        if (t.player == inquirePlayer.num && t.numCheckers > 0) {
          numChecks += t.numCheckers;
        }
      } 
    }
	numChecks += this.getBarByNum(inquirePlayer.num).numCheckers;
    return numChecks;	
  }
  
}
