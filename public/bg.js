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
  x -= bggame.board.drawer.canvasElement.offsetLeft;
  y -= bggame.board.drawer.canvasElement.offsetTop;
  x = Math.min(x, bggame.board.specs.boardWidth * bggame.board.specs.pieceWidth);
  y = Math.min(y, bggame.board.specs.boardHeight * bggame.board.specs.pieceHeight);
  
  // used for triangle and bar
  var checker = Object.create(Checker, { row : { value : Math.floor(y/bggame.board.specs.pieceHeight) }, column : { value : Math.floor(x/bggame.board.specs.pieceWidth) }, player : { value : 0 } });
  
  // check for double dice click
  var doubling = false;
  if ( x >= bggame.board.drawer.interact.doubling.startX && x <= bggame.board.drawer.interact.doubling.startX + bggame.board.drawer.interact.doubling.widthPix &&
       y >= bggame.board.drawer.interact.doubling.startY && y <= bggame.board.drawer.interact.doubling.startY + bggame.board.drawer.interact.doubling.heightPix)
  {
    doubling = true;
  }
  
  // check for regular dice click (either to confirm or to roll)
  var dice = false;
  if ( x >= bggame.board.drawer.interact.dice.startX && x <= bggame.board.drawer.interact.dice.startX + bggame.board.drawer.interact.dice.widthPix &&
       y >= bggame.board.drawer.interact.dice.startY && y <= bggame.board.drawer.interact.dice.startY + bggame.board.drawer.interact.dice.heightPix)
  {
    dice = true;
  }  
  
  return { triangle: checker.findTriangleNum(bggame.board), bar: checker.findBarNum(bggame.board), doublingDiceSend: doubling, regularDice: dice }
}

function bgOnClick(e) {
  // all info on the user's click
  var info = getCursorPosition(e);
  
  if (me.num == bggame.board.playerTurn()) {
    // check to see if user doubled
    if (info.doublingDiceSend) {
      if (bggame.board.canDouble) {
        socket.emit( 'double sent', { room: selectedRoom, requestingPlayer: me.num } );
      }
    }
  
    // check to see if uesr clicked on dice area
    if (info.regularDice) {
      if (bggame.board.playerCanConfirm) {
        console.log("confirming move...");
        socket.emit('moved', { room: selectedRoom, moves:bggame.board.turns.currentTurn});
        bggame.board.playerCanConfirm = false;
      } else if (bggame.board.playerCanRoll) {
        console.log("rolling dice...");
        socket.emit( 'dice request', { room: selectedRoom } );
        bggame.board.playerCanRoll = false;
      }
    }
  }

  if (me.num == bggame.board.playerTurn() && bggame.board.dice.isRolled) {
    var meBar = bggame.board.getBarByNum(me.num);
    var triangle = bggame.board.getTriangleByNum(info.triangle); 
  
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
    //bggame.board.update({ forPlayer : me.num });
  } 
}

function newGame() {
  bggame.board.update({ forPlayer : me.num });
}

function initGame(canvasElement, nakedCanvasElement, data) { 
  if (!canvasElement) {
    canvasElement = document.createElement("canvas");
    canvasElement.id = "bg_canvas";
    
    $("#game_area").append("<div id='game_area_input'></div>");
    $("#game_area").append("<div id='doubling-area'></div>");
    
    $("#game_area_input").append( '<p id="iam">I am Player: <span id="iam-player">null</span></p>' + 
                                  '<div id="u-button"><button id="undo">undo move</button></div>' +
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