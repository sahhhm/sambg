//once cleaned up, this file needs to go into index.html
function getCursorPosition(e) {
  var x;
  var y;
  if (e.pageX != undefined && e.pageY != undefined) {
   x = e.pageX;
   y = e.pageY;
  } 
  else {
    x = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
    y = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
  }
  x -= bggame.board.drawer.canvasEls.canvas.offsetLeft;
  y -= bggame.board.drawer.canvasEls.canvas.offsetTop;
  //x = Math.min(x, bggame.board.specs.boardWidth * bggame.board.specs.pieceWidth);
  //y = Math.min(y, bggame.board.specs.boardHeight * bggame.board.specs.pieceHeight);
  x = Math.min(x, bggame.board.specs.boardPixelWidth);
  y = Math.min(y, bggame.board.specs.totalPixelHeight);
  
  // used for triangle and bar
  var checker = Object.create(Checker, { row : { value : Math.floor(y/bggame.board.specs.pieceHeight) }, column : { value : Math.floor(x/bggame.board.specs.pieceWidth) }, player : { value : 0 } });
  
  // check for double dice click
  var doubling = false;
  if ( x >= bggame.board.drawer.doublingDice.specs.startX && x <= bggame.board.drawer.doublingDice.specs.startX + bggame.board.drawer.doublingDice.specs.widthPix &&
       y >= bggame.board.drawer.doublingDice.specs.startY && y <= bggame.board.drawer.doublingDice.specs.startY + bggame.board.drawer.doublingDice.specs.heightPix)
  {
    doubling = true;
  }
  
  // if applicable, check if user clicked left/right button
  var leftButtonClicked = false;
  var rightButtonClicked = false;
  if ( bggame.board.drawer.messageArea.getStatus().buttons ) {
    // accept button
    if ( x >= bggame.board.drawer.messageArea.getLeftButtonStartX() && x <= bggame.board.drawer.messageArea.getLeftButtonStartX() + bggame.board.drawer.messageArea.specs.buttonWidth &&
         y >= bggame.board.drawer.messageArea.getButtonStartY() && y <= bggame.board.drawer.messageArea.getButtonStartY() + bggame.board.drawer.messageArea.specs.buttonHeight )
    {
      leftButtonClicked = true;
    }
    // deny button
    if ( x >= bggame.board.drawer.messageArea.getRightButtonStartX() && x <= bggame.board.drawer.messageArea.getRightButtonStartX() + bggame.board.drawer.messageArea.specs.buttonWidth &&
         y >= bggame.board.drawer.messageArea.getButtonStartY() && y <= bggame.board.drawer.messageArea.getButtonStartY() + bggame.board.drawer.messageArea.specs.buttonHeight )
    {
      rightButtonClicked = true;
    }
  }
  
  // check for regular dice click (either to confirm or to roll)
  var dice = false;
  if ( x >= bggame.board.drawer.dice.specs.startX && x <= bggame.board.drawer.dice.specs.startX + bggame.board.drawer.dice.specs.widthPix &&
       y >= bggame.board.drawer.dice.specs.startY && y <= bggame.board.drawer.dice.specs.startY + bggame.board.drawer.dice.specs.heightPix)
  {
    dice = true;
  }  
  
  var undoClick = false;
  if ( x >= bggame.board.drawer.infoMenu.specs.ubStartX && x <=  bggame.board.drawer.infoMenu.specs.ubStartX + bggame.board.drawer.infoMenu.specs.ubWidth &&
       y >= bggame.board.drawer.infoMenu.specs.ubStartY && y <=  bggame.board.drawer.infoMenu.specs.ubStartY + bggame.board.drawer.infoMenu.specs.ubHeight )
  {
    undoClick = true;
  }
  
  return { triangle: checker.findTriangleNum(bggame.board), 
           bar: checker.findBarNum(bggame.board), 
		   doublingDiceSend: doubling, 
		   regularDice: dice, 
		   messageAreaAccept: leftButtonClicked, 
		   messageAreaDeny: rightButtonClicked,
           undo: undoClick  }
}

function bgOnClick(e) {
  // all info on the user's click
  var info = getCursorPosition(e);
  
	// check to see if user made a decision on game over
	if ( bggame.board.isGameOver() ) {
	  if ( info.messageAreaAccept ) {
		socket.emit('rejoin room', {room: selectedRoom, playerNum: me.num});
		socket.emit('join room', {room: selectedRoom});
	  } else if ( info.messageAreaDeny ) {
		socket.emit('exit game', {room: selectedRoom});
	  }
	}  
  
  if (me.num == bggame.board.playerTurn()) {	
    // check to see if user doubled
    if (info.doublingDiceSend) {
      if (bggame.board.canDouble) {
        socket.emit( 'double sent', { room: selectedRoom, requestingPlayer: me.num } );
      }
    }
  
    // check to see if uesr clicked on dice area
    if (info.regularDice && !bggame.board.waitingForNextTurn) {
      if (bggame.board.playerCanConfirm) {
        console.log("confirming move...");
        socket.emit('moved', { room: selectedRoom, moves:bggame.board.turns.currentTurn});
        bggame.board.playerCanConfirm = false;
		bggame.board.waitingForNextTurn = true;
		if ( bggame.board.gameOverValue != -1 ) {
          var pointsWon = bggame.board.gameOverValue * bggame.board.doublingDice.value;
          socket.emit('game end', { room: selectedRoom, winnerNum: me.num, points: pointsWon });
		} 
      } else if (bggame.board.playerCanRoll) {
        console.log("rolling dice...");
        socket.emit( 'dice request', { room: selectedRoom } );
        bggame.board.playerCanRoll = false;
      }
    }
  } else {
    // actions that may be performed by the
	// user whose turn it currently is not
	
	// check to see if user responded to double
	if ( bggame.board.doubleRequested ) {
	  if ( info.messageAreaAccept ) {
		socket.emit( 'double chosen', { room: selectedRoom, choosingPlayer: me.num, action: "accept" } );
	  } else if ( info.messageAreaDeny ) {
		socket.emit( 'double chosen', { room: selectedRoom, choosingPlayer: me.num, action: "reject" } );
	  }
	}
	
  }

  if (me.num == bggame.board.playerTurn() && bggame.board.dice.isRolled) {
    var meBar = bggame.board.getBarByNum(me.num);
    var triangle = bggame.board.getTriangleByNum(info.triangle); 
  
    if (info.undo && bggame.board.playerCanUndo) {
      bggame.board.undoMove();
      bggame.board.update({forPlayer : me.num});	
	}
  
    if (meBar.isEmpty()) {
      if (bggame.board.getSelectedTriangle().num == -1 && triangle.isEmpty()) {
        console.log("Triangle " + triangle.num + " which is empty was selected"); 
		bggame.board.update({ forPlayer : me.num });
      } else {
        if (bggame.board.getSelectedTriangle().num == -1 && triangle.player == me.num) {
          bggame.board.selectedTriangleNum = triangle.num;
          bggame.board.update({ forPlayer : me.num });
        } else if (bggame.board.getSelectedTriangle().num != -1 && triangle.num != -1) {
          bggame.board.updateSpace(bggame.board.getSelectedTriangle(), triangle);
        } else if (bggame.board.getSelectedTriangle().num != -1) {
          bggame.board.updateSpace(bggame.board.getSelectedTriangle(), bggame.board.getBearOffByPlayerNum(me.num));
        } else {
          bggame.board.update({ forPlayer : me.num });
        }
      }
    } else {
      if (bggame.board.getSelectedBar().num == -1) {
        bggame.board.selectedBarNum = me.num;
		bggame.board.update({ forPlayer : me.num });
      } else if (bggame.board.getSelectedBar().num != -1 && triangle.num >= 1) {
        bggame.board.updateSpace(bggame.board.getSelectedBar(), triangle);
      } else {
	    bggame.board.update({ forPlayer : me.num });
	  }
    } 
  } 
}

function newGame() {
  bggame.board.update({ forPlayer : me.num });
}

function initGame(canvasElement, nakedCanvasElement, data) { 
  if (!canvasElement) {
    canvasElement = document.createElement("canvas");
    canvasElement.id = "bg_canvas";
    
	$('#game_area').html('');
    $("#game_area").append("<div id='game_area_input'></div>");
    
    $("#game_area_input").append( '<p id="iam">I am Player: <span id="iam-player">null</span></p>' + 
                                  '<input type="text" id="f-inp" value="00" size="2"/><div id="force-dice"><button id="force-sub">force roll</button></div>');//for debugging only
                               
    $("#game_area").append(canvasElement);
    
  }
  
  if (!nakedCanvasElement) {
    nakedCanvasElement = document.createElement("canvas");
    nakedCanvasElement.id = "bg_naked";
    //nakedCanvasElement.style.visibility = "visible";
	nakedCanvasElement.style.visibility = "hidden";
    $("#game_area").append(nakedCanvasElement);
  }
    
  bggame = new Game(data);
}