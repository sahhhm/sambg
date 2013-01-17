

/*
* -------------------------------------------
* BOARD CLASS
* -------------------------------------------
*/
var Board = Drawable.extend({
    init: function(players) {
      this.selectedBarNum = -1;
      this.selectedTriangleNum = -1;
  
      this.boardPlayerNum = -1;
      this.canDouble = false;
      this.playerCanConfirm = false;
      this.playerCanRoll = false;
      this.waitingForNextTurn = false;
      this.anyMovesLeft = false;
      this.doubleRequested = false;
      this.playerCanUndo = false;
      this.numMoves = 0;
      this.gameOverValue = -1; // -1, not over; otherwise, multiplier for doubling dice

      this._super();
      
      /** get rid of this **/
      this.drawer = new Drawer();	

      this.dice = new Dice();
      this.doublingDice = new DoublingDice(); 
  
      this.turns = new TurnHistory();
  
      this.bPlayers = players;
 
      this.gTriangles = 
        [createTriangle(01, CONSTANT_SPECS.boardWidth-01, 1, 2 ),
        createTriangle( 02 ,CONSTANT_SPECS.boardWidth-02, 0, 0 ),
        createTriangle( 03, CONSTANT_SPECS.boardWidth-03, 0, 0 ),
        createTriangle( 04, CONSTANT_SPECS.boardWidth-04, 0, 0 ),
        createTriangle( 05, CONSTANT_SPECS.boardWidth-05, 0, 0 ),
        createTriangle( 06, CONSTANT_SPECS.boardWidth-06, 2, 5 ),
        createTriangle( 07, CONSTANT_SPECS.boardWidth-08, 0, 0 ),
        createTriangle( 08, CONSTANT_SPECS.boardWidth-09, 2, 3 ),
        createTriangle( 09, CONSTANT_SPECS.boardWidth-10, 0, 0 ),
        createTriangle( 10, CONSTANT_SPECS.boardWidth-11, 0, 0 ),
        createTriangle( 11, CONSTANT_SPECS.boardWidth-12, 0, 0 ),
        createTriangle( 12, CONSTANT_SPECS.boardWidth-13, 1, 5 ),
        createTriangle( 13, CONSTANT_SPECS.boardWidth-13, 2, 5 ),
        createTriangle( 14, CONSTANT_SPECS.boardWidth-12, 0, 0 ),
        createTriangle( 15, CONSTANT_SPECS.boardWidth-11, 0, 0 ),
        createTriangle( 16, CONSTANT_SPECS.boardWidth-10, 0, 0 ),
        createTriangle( 17, CONSTANT_SPECS.boardWidth-09, 1, 3 ),
        createTriangle( 18, CONSTANT_SPECS.boardWidth-08, 0, 0 ),
        createTriangle( 19, CONSTANT_SPECS.boardWidth-06, 1, 5 ),
        createTriangle( 20, CONSTANT_SPECS.boardWidth-05, 0, 0 ),
        createTriangle( 21, CONSTANT_SPECS.boardWidth-04, 0, 0 ),	
        createTriangle( 22, CONSTANT_SPECS.boardWidth-03, 0, 0 ),	
        createTriangle( 23, CONSTANT_SPECS.boardWidth-02, 0, 0 ),	
        createTriangle( 24, CONSTANT_SPECS.boardWidth-01, 2, 2 )];

      this.gBars = [ createBar( 1, 1, CONSTANT_SPECS.barColumn, 0 ), createBar (2, 2, CONSTANT_SPECS.barColumn, 0 ) ];

      this.gBearOffs = [ createBearoff( 1, 25, CONSTANT_SPECS.bearOffColumn, 0 ), createBearoff( 2, 0, CONSTANT_SPECS.bearOffColumn, 0 ) ];
     
      this.drawer.sets( this.gTriangles, this.gBars, this.gBearOffs, this.dice, this.doublingDice, this );	

    },

    getBars: function() {
      return this.gBars;
    }, 
  
    getBearOffs: function() {
      return this.gBearOffs;
    },
  
    getBearOffByPlayerNum: function(n) {
      var bearOff = new Bearoff( -1, -1, 0, -1, false);
      if (n > 0) {
        bearOff =  this.getBearOffs()[n-1];
      } 
      return bearOff;  
    },
  
    getBarByNum: function(n) {
      var bar = new Bar( -1, -1, 0, -1, false );
      if (n > 0) {
        bar =  this.getBars()[n-1];
      } 
      return bar;
    },

    getSelectedBar: function() {
      return this.getBarByNum(this.selectedBarNum);
    },  
  
    getTriangles: function() {
      return this.gTriangles;
    },
  
    getTriangleByNum: function(n) {
      var tri = new Triangle(-1, -1, 0, -1, false); 
      if (n >=1  && n <= 24) {
        tri = this.getTriangles()[n-1];
      } 
      return tri;
    },  
  
    getSelectedTriangle: function() {
      return this.getTriangleByNum(this.selectedTriangleNum);
    },
  
    getPlayers: function() {
      return this.bPlayers;
    },
  
    getPlayerByNum: function(n) {
      return this.getPlayers()[n-1];
    },
  
    roll: function(opts) {
      this.dice.roll({die1 : opts.die1, die2 : opts.die2});
    },
 
    updateTurn: function() {
      this.turns.clearCurrentToHistory();
      this.dice.isRolled = false;
      this.numMoves += 1;
    },
  
    updateNakedBoard: function() {
      this.drawer.drawNakedBoard( this.getTriangles(), this.getBars(), this.getBearOffs() );
    },

    update: function(opts) {
      if (!opts.forPlayer) {
        opts.forPlayer = -1;
      }

      this.updateDraw();
      this.checkElements(opts.forPlayer);
    },
  
    checkElements: function(forPlayer) {
      this.playerCanUndo = this.canPlayerUndo(forPlayer);
      this.checkAnyMovesLeft();
      this.canConfirm(forPlayer) ? this.playerCanConfirm = true : this.playerCanConfirm = false;
      this.canRoll(forPlayer) ? this.playerCanRoll = true : this.playerCanRoll = false;
      this.drawDice(forPlayer);
      this.drawDoublingDice(forPlayer);  
      this.drawInfoMenu(this.boardPlayerNum);
    },
  
    canPlayerUndo: function( forPlayerNum ) {
      // need to update to prevent from returning true when
      // the player is just watching the moves
      return this.turns.currentTurn.length > 0 && this.boardPlayerNum == this.playerTurn();
    },

    drawInfoMenu: function(forPlayerNum) {
      this.drawer.drawInfoMenu( this.getPlayerByNum(forPlayerNum), this.calculatePipCounts(), this.playerCanUndo );
    },
  
    drawDice: function(forPlayerNum) {
      this.drawer.drawDice( this.getPlayerByNum(this.playerTurn()), this.getPlayerByNum(forPlayerNum), this.getPlayerByNum((this.playerTurn() % 2 + 1)), this.canConfirm(forPlayerNum), this.canRoll(forPlayerNum), this.anyMovesLeft );
    },    
  
    drawDoublingDice: function(playerNum) {
      this.canDouble = (playerNum == this.playerTurn() && !this.dice.isRolled && this.doublingDice.lastPlayerToDoubleNum != playerNum) ? true : false;
      this.drawer.drawDoublingDice();
    },
  
    canConfirm: function(num) {
      // returns true if the user is able to confirm the move.
      // Either all dice moves have been played, or no valid
      // moves exist.
      return ( ( !this.dice.numUnusedDice() || !this.anyMovesLeft ) && ( num == this.playerTurn() ) && this.dice.isRolled );
    },  

    canRoll: function(num) {
      // if it's the next players turn, let them request new dice.
      return ( (!this.dice.numUnusedDice() || !this.dice.isRolled) && num == this.playerTurn() ); 
    },
  
    updateDraw: function() {
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
    },
  
    findAllPotentialMoves: function(pNum) {
      var from;
      var allTheMoves = new Array();
      var playerBar = this.getBarByNum(pNum);

      if ( playerBar.isEmpty() ) {
        for (var i = 0; i < this.getTriangles().length; i++) {
          from = this.gTriangles[i];
          if ( from.player == pNum && !from.isEmpty() ){ 
            allTheMoves = allTheMoves.concat(this.findPotentialMoves(from));
          }	  
        }
      } else {
        allTheMoves = this.findPotentialMoves(playerBar);
      }
      return allTheMoves;
    },
  
    findPotentialMoves: function(from) {
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
    },  
  
    move: function(moves, draw) {
      console.log("!! board.move " + moves.length + " moves");
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
    
      if (draw) {
        this.drawer.animateMove(from, to);
      }
	
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
        var time = draw ? ( ( this.drawer.settings.animationTimeout * 100 ) /2 ) : 0;
        if ( draw ) {
          setTimeout( function() { self.move(moves, draw); }, time );	  
        } else {
          self.move(moves, draw);
        }
      } else {
        // determine number of points if game is over
        if ( this.getBearOffByPlayerNum( aMove.player ).numCheckers == CONSTANT_SPECS.totalPiecesPerPlayer ) {
          this.gameOverValue = this.getGameOverCode( aMove.player )
        }
      }	 
    },
  
    undoMove: function(draw) {
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
     
      if (draw) {
        this.drawer.animateMove(from, to);	
      }
	
      // this moves for hit moves because by the time the drawer draws
      // the from space, the below incremement will have taken place
      if ( theMove.isToHit ) from.numCheckers += 1;
	
	
      // since we just moved, nothing should be active
      this.selectedBarNum = -1;
      this.selectedTriangleNum = -1;    
    
      // update the dice based on the move
      this.dice.updateDice( theMove.diceValue, true );
      console.log("undo move from " + from.entry() + " to " + to.entry());
    },

    checkAnyMovesLeft: function() {
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
      this.anyMovesLeft = any;
    },  
    
    playerTurn: function() {
      return bggame.board.numMoves % 2 + 1
    },

    getGameOverCode: function(forPlayerNum) {
      // returns -1 if the game is not over;
      // otherwise, returns number of points user won by
      var retval = -1;
      var factor = 1;
      var otherPlayerNum = forPlayerNum % 2 + 1;
      var bearForPlayer = this.getBearOffByPlayerNum( forPlayerNum ); 
      var bearOtherPlayer = this.getBearOffByPlayerNum( otherPlayerNum )
      if ( bearOtherPlayer.numCheckers <= 0 ) {
        if ( this.inquireCheckerNotInAHome( this.getPlayerByNum( otherPlayerNum ), this.getPlayerByNum( forPlayerNum ) ) < CONSTANT_SPECS.totalPiecesPerPlayer ) { 
          factor = 3;        
        } else {
          factor = 2;
        }
      }
      retval = this.doublingDice.value * factor;
      return retval;
    },
  
    playerReadyToBearOff: function(p) {
      return this.inquireCheckerNotInAHome( p, p ) == 0;
    },  
  
    inquireCheckerNotInAHome: function(inquirePlayer, homePlayer) {
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
    },
  
    doubleRequest: function( currentPlayer, requestingPlayer ) {
      // function called when a double is requested
      // currentPlayer (int) - player.num of the game player 
      // requestingPlayer (int) - player.num of the double requester
      this.doubleRequested = true;
	
      if ( currentPlayer == requestingPlayer ) {
        this.drawer.drawMessage("Waiting on player to confirm/deny double",
                                { button: false });
      } else {
        this.drawer.drawMessage("Double Requested!", 
                                { button: true, acceptText: "accept", denyText: "resign" });
      }
    },
  
    doubleResponse: function( response, choosingPlayerNum ) {
      this.doubleRequested = false;
      if ( response == "accept" ) {
        this.drawer.drawMessage("Double Accepted",
                                { button: false }); 
      } else {
        this.gameOverValue = 1;
        this.drawer.drawMessage("Double Declined",
                                { button: false });
      }
    },  
  
    gameEnded: function ( winningPlayer, pointsWon ) {
      this.drawer.drawMessage("Game Over! Player " + winningPlayer + " won with " + pointsWon + " points",
                              { button: true, acceptText: "rematch", denyText: "lobby" });    
    },
  
    isGameOver: function() {
      // returns true if game is over; false otherwise
      return this.gameOverValue > 0;
    },
  
    calculatePipCounts: function() {
      // function to iterate against all board spaces 
      // and calculate the number of pips left per player
      // in addition, make sure all checkers are accounted for
      // returns: { pip1: integer, pip2: integer }
      var pip1count = 0;
      var pip2count = 0;
      var checkersCounted = 0;
	
      var spaces = this.getTriangles().concat( this.getBars() ).concat( this.getBearOffs() );
      for ( var s = 0; s < spaces.length; s++ ) {
        if ( spaces[s].player == 1 ) {
          pip1count += spaces[s].pipCount();
        } else if ( spaces[s].player == 2 ) {
          pip2count += spaces[s].pipCount();
        }
        checkersCounted += spaces[s].numCheckers;
      }
	
      // sanity check
      if ( checkersCounted != CONSTANT_SPECS.totalPiecesPerPlayer * 2 ) {
        console.log("not all checkers accounted for in pipcount");
      }
	
      return { pip1: pip1count, 
               pip2: pip2count }
    },   
    drawBoard: function(ctx) {
      ctx.fillStyle = ctx.createPattern(IMAGES.bg.image,'repeat');
      ctx.fillRect(0, 0, this.drawInfo.boardPixelWidth, this.drawInfo.boardPixelHeight);	      
		
      var spaces = this.gTriangles.concat( this.gBars ).concat( this.gBearOffs );
      for ( var i = 0; i < spaces.length; i++ ) {
        spaces[i].draw(ctx);
      }
    },     
});

/*
* -------------------------------------------
* DRAWER CLASS
* -------------------------------------------
*/
var Drawer = Drawable.extend({
    init: function() {
      this._super();
      this.messageArea = new MessageArea();
      this.infoMenu = new InfoMenu();
      this.settings.animationTimeout = 8;
    },
    sets: function( tri, bars, bears, dice, ddice, board ) {
      this.triangles = tri;
      this.bars = bars;
      this.bearoffs = bears;
      this.dice = dice;
      this.doublingDice = ddice;
      this.brd = board;
    },
    setDoublingDice: function( dd ) {
      this.doublingDice = dd;
    },		
    drawNakedBoard: function() {
      this.ctxs.nctx.clearRect(0, 0, this.drawInfo.boardPixelWidth, this.drawInfo.totalPixelHeight);
      this.brd.drawBoard(this.ctxs.nctx);
    },     
    drawBoard: function() {
      this.ctxs.ctx.clearRect(0, 0, this.drawInfo.boardPixelWidth, this.drawInfo.totalPixelHeight);
      this.brd.drawBoard(this.ctxs.ctx);
    },
    drawPotentials: function(from, pots) {
      if ( from ) {
        from.select( this.ctxs.ctx );
        for (var i = 0; i < pots.length; i++) pots[i].highlight( this.ctxs.ctx );
      }  
    },
    undoDecorations: function() {
      // function unselects and unhighlights 
      // any selecteed or highlighted spaces
      var spaces = this.triangles.concat( this.bars ).concat( this.bearoffs );
      for ( var i = 0; i < spaces.length; i++ ) {
        if ( spaces[i].selected ) {
        spaces[i].selected = false;
        spaces[i].draw( this.ctxs.ctx );	  
        }
        if ( spaces[i].highlighted ) {
          spaces[i].highlighted = false;
          spaces[i].draw( this.ctxs.ctx );	  
        }
      }	
    },
    animateMove: function(from, to) {
      // from/to has already been inremented/decremented 

      this.drawNakedBoard();
      
      var rowStart, checksStart,  chStart, xStart, yStart; 
      var rowEnd, checksEnd, chEnd, xEnd, yEnd; 

      checksStart = from.numCheckers >= this.drawInfo.maxPiecesPerTriangle - 1 ? this.drawInfo.maxPiecesPerTriangle -1 : from.numCheckers;
      rowStart = from.isTop() ? checksStart  : this.drawInfo.boardHeight - checksStart - 1;
      chStart = new Checker( rowStart, from.column, from.player );
      xStart = chStart.getX();
      yStart = chStart.getY();

      checksEnd = to.numCheckers > this.drawInfo.maxPiecesPerTriangle ? this.drawInfo.maxPiecesPerTriangle : to.numCheckers;
      rowEnd = to.isTop() ? checksEnd - 1 : this.drawInfo.boardHeight - checksEnd;
      chEnd = new Checker( rowEnd, to.column,  to.player );
      xEnd = chEnd.getX();
      yEnd = chEnd.getY();  

      var rise = yEnd - yStart;
      var run = xEnd - xStart;

      var dx = run / this.settings.animationTimeout;
      var dy = rise / this.settings.animationTimeout;

      var off = (this.drawInfo.pieceWidth/2) - (this.drawInfo.pieceWidth/9) + this.settings.animationTimeout;
      var side = this.drawInfo.pieceWidth + 10;

      var xAnim = xStart;
      var yAnim = yStart;
      var self = this;

      setTimeout( function() { 
        self.movePiece(xAnim, dx, yAnim, dy, off, side, from.player, from, to, 0); 
      }, this.settings.animationTimeout );

    },
    drawDoublingDice: function() {
      this.doublingDice.draw( this.ctxs.ctx );
    },
    drawDice: function( currentPlayer, mePlayer, otherPlayer, pCanConfirm, pCanRoll, anyMovesLeft ) {  
      // remove any remaining messages
      if ( this.messageArea.messagesDrawn || this.messageArea.buttonsDrawn ){ 
        this.messageArea.clearArea( this.ctxs.ctx );
      }  

      // TO-DO: refactor control of dice color selecting here?   
      this.dice.draw( this.ctxs.ctx, currentPlayer, mePlayer, otherPlayer, pCanConfirm, pCanRoll, anyMovesLeft );
    },     
    movePiece: function(x, dx, y, dy, off, side, playerNum, from, to, count) {
      var tx, ty;
      tx = x - off < 0 ? 0 : x - off; 
      ty = y - off < 0 ? 0 : y - off;
      if ( ty + side > this.drawInfo.boardPixelHeight ) ty = this.drawInfo.boardPixelHeight - side;

      this.ctxs.ctx.drawImage(this.canvasEls.nakedCanvas, tx, ty, side, side, tx, ty, side, side);        	
      xAnim = x + dx;
      yAnim = y + dy;
      drawCh = new CheckerXY( xAnim, yAnim, playerNum);
      drawCh.draw(this.ctxs.ctx, false);
      if ( ++count == this.settings.animationTimeout ) {
        // piece moving is over... handle stuff here!
        for ( var i = 0; i < this.bars.length; i++ ) { 
          this.bars[i].draw( this.ctxs.ctx );
          to.draw( this.ctxs.ctx );
          from.draw( this.ctxs.ctx );        
        }
      } else {
        var self = this;
        setTimeout( function() { 
        self.movePiece(xAnim, dx, yAnim, dy, off, side, from.player, from, to, count); 
        }, this.settings.animationTimeout );
      }	
    },
    drawMessage: function( aMessage, buttonInfo ) {
      // function that takes in a message and an array of options
      // pertaining to whether or not buttons are needed or not
      // aMessage - string - containing the message to be displayed 
      //                     max of 40 characters for now
      // buttonInfo - array - button: boolean - represents whether or not buttons need to be drawn
      //                      acceptText: string - required if button is true. contains text to display on the accept button
      //                      denyText: string - required if button is true. contains text to display on the deny button
      this.messageArea.clearArea( this.ctxs.ctx );
      this.messageArea.drawMessage( this.ctxs.ctx, aMessage );
      if ( buttonInfo.button ) {
        this.messageArea.drawButtons( this.ctxs.ctx, buttonInfo.acceptText, buttonInfo.denyText );
      }
    },
    drawInfoMenu: function( forPlayer, pipCounts, canUndo ) {
      // function that takes in a message and an array of options
      // pertaining to whether or not buttons are needed or not
      // forPlayer  - player - player object                    
      // canUndo - boolean - true if the player can undo, false otherwise
      this.infoMenu.drawFirst( this.ctxs.ctx, forPlayer, pipCounts );
      this.infoMenu.drawUndo( this.ctxs.ctx, canUndo );
    },
});