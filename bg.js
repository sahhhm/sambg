var kBoardWidth = 13;
var kBoardHeight= 12;
var kPieceWidth = 50;
var kPieceHeight= 45;
var kHitPieceWidth = 50;
var kHitPieceHeight = 20;
var kPixelWidth = 1 + (kBoardWidth * kPieceWidth);
var kPixelHeight= 1 + (kBoardHeight * kPieceHeight);

var totalTriangles = 24;
var maxPiecesPerTriangle = 5;
var barColumn = 6;

var gCanvasElement;
var gDrawingContext;

var gTriangles;
var gPlayers;
var gNumPieces;
var gNumTriangles;
var gSelectedTriNumber = -1;
var gSelectedBarNumber = -1;
var gSelectedPieceHasMoved;
var gMoveCount;
var gGameInProgress;

var confirmedRolls;

var CONST_BAR = "bar";
var CONST_TRI = "tri";

var currentDiceElement;
var confirmButtonElement;
var playerTurnElement;

var DICE;
var DRAWER;

function removeSubsetFromArray(subset, array) {
  var newArr = new Array();
  var limit = DICE.isDouble() ? subset.length : subset.length + 1;
  for (var i = 0; i < array.length; i++) {
    var flagged = false;
	if (i < limit) {
	  for (var j = 0; j < subset.length; j++) {
	    if (subset[j] == array[i]) { 
		  flagged = true; 
		  break; 
	    }
	  }
	}
	if (!flagged) newArr.push(array[i]);
  }
  return newArr;
}

function validMove(from, to) {
  var isValid = false;
  if (to) {
    if (to.numCheckers == 0) isValid = true;
    if (to.numCheckers == 1) isValid = true;
    if (to.numCheckers >= 2) {
      if (from.player == to.player) isValid = true;
    }
  }
  return isValid;
}

function Player(num, color, bRow, bColumn, homeMinNum, homeMaxNum, oppMinNum, oppMaxNum, direction) {
  this.num = num;
  this.color = color;
  this.bar = new Bar(num, bRow, bColumn, 0); 
  this.isHit = function() { return this.bar.numCheckers > 0; }
  this.homeMinNum = homeMinNum;
  this.homeMaxNum = homeMaxNum;
  this.oppMinNum = oppMinNum;
  this.oppMaxNum = oppMaxNum;
  this.direction = direction;
}

function Triangle(num, column, player, numCheckers) {
  /* num - triangle number relative to bg game. Starts at top right (1) and goes CC (24)
     row - row number relative to board layout.
     player - the player that currently controls the triangle */
  this.num = num;
  this.column = column;
  this.numCheckers = numCheckers;
  this.player = player;
  this.isTop = function() { return this.num <= 12; }
  this.type = CONST_TRI;
}

function updateText() {
  var i;
  var text = "";
  text += " [ ";
  for (var i = 0; i < DICE.diceCopy.length; i++) 
    i == DICE.diceCopy.length -1 ? text += DICE.diceCopy[i]  : text += DICE.diceCopy[i] + " - ";
  text += " ] ";
    for (var i = 0; i < DICE.dice.length; i++)
    i == DICE.dice.length -1 ? text += DICE.dice[i]  : text += DICE.dice[i] + " - ";
  currentDiceElement.innerHTML = text;
  playerTurnElement.innerHTML = playerTurn();
}

function Bar(player, row, column, numCheckers) {
  this.player = player;
  this.row = row;
  this.column = column;
  this.numCheckers = numCheckers;
  this.entry = this.player == 1 ? 0 : 25;
  this.isTop = function() { return row < maxPiecesPerTriangle; }
  this.type = CONST_BAR;
}

function Checker(row, column, player) {
  this.row = row;
  this.column = column;
  this.player = player;
}

function getCursorPosition(e) {
   /* returns Triangle with .num and .column properties */
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
  x -= gCanvasElement.offsetLeft;
  y -= gCanvasElement.offsetTop;
  x = Math.min(x, kBoardWidth * kPieceWidth);
  y = Math.min(y, kBoardHeight * kPieceHeight);

  var checker = new Checker(Math.floor(y/kPieceHeight), Math.floor(x/kPieceWidth));
  var triangle = new Triangle(findTriangle(checker), Math.floor(x/kPieceWidth), 0, -1);
  var bar = new Bar(findBar(checker), Math.floor(y/kPieceHeight), Math.floor(x/kPieceWidth), 0);
  return [triangle, bar];
}

function findTriangle(aChecker) {
  /* given a checker (row, column) find the appropriate triangle number 
     returns -1 if not appropriate selection */
  var x = aChecker.column;
  var y = aChecker.row;
  var tnum = -1;
  if (x != barColumn) { 
    if (y < maxPiecesPerTriangle) { /* top */
	  tnum = (gNumTriangles/2) - x + 1;
	  if (x < barColumn) tnum -= 1;
	} else if (y > kBoardHeight - maxPiecesPerTriangle - 1) { /* bottom */
	  tnum = (gNumTriangles/2) + x + 1;
	  if (x > barColumn) tnum -=1;
	} else {
	  tnum = -1;
	} 
  } else {
	tnum = -1;
  } 
  return tnum;	
}

function findBar(aChecker) {
  var x = aChecker.column;
  var y = aChecker.row;
  var bnum = -1;
  if (x == barColumn) 
    if (y < maxPiecesPerTriangle) bnum = 1;
	else if (y > kBoardHeight - maxPiecesPerTriangle - 1) bnum = 2;
	else bnum = -1;
  else bnum = -1;
  return bnum;	 
}

function resetInfo() {
  gSelectedTriNumber = -1;
  gSelectedBarNumber = -1;
}

function bgOnClick(e) {
  var info = getCursorPosition(e);
  var triangle = info[0];
  var bar = info[1];
  
  var fTriangle = gTriangles[triangle.num-1];  

    if (bar.player >= 1) {
	  gSelectedBarNumber = bar.player;
	  console.log("Bar " + gSelectedBarNumber + " selected");
    }
  
    if (gSelectedBarNumber == -1) {
	  if (gSelectedTriNumber == -1 && gTriangles[triangle.num-1].numCheckers <= 0) {
        console.log("Triangle " + triangle.num + " which is empty was selected"); 
      } else {
        updateTriangle(triangle);
      }
	}
    else {
      if (gPlayers[gSelectedBarNumber-1].bar.numCheckers <= 0) {
	    console.log("Bar " + gSelectedBarNumber + " which is empty was selected");
	    gSelectedBarNumber = -1;
	  } else {
	    if (triangle.num >= 1) updateBar(triangle);
	  }
	} 
    
	DRAWER.drawBoard(DICE);

  updateText();
}

function updateBar(dumTriangle) {
  var isValid = false;
  var fromPlayer = gPlayers[gSelectedBarNumber-1];
  var fromBar = fromPlayer.bar;
  var to = gTriangles[dumTriangle.num-1];
  
  if (validDiceMove(fromBar, to)) {
    if (to.numCheckers == 0) {
	  isValid = true;
      to.player = fromBar.player;
    } else if (to.numCheckers == 1) {
	  if (fromBar.player == to.player) {
		isValid = true;
	  } else {
	    /* player hit */
		console.log("Player " + fromBar.player + " hit Player " + to.player + " from the bar");
		gPlayers[to.player-1].bar.numCheckers += 1;
		to.numCheckers -= 1;
		to.player = fromBar.player;
		isValid = true;
	  }
	} else {
	  if (fromBar.player == to.player) {
		isValid = true;
	  } else {
	    console.log("Player " + fromBar.player + " cannot move form the bar to triangle " + to.num + " because Player " + to.player + " is occupying the triangle");
	  }
	}
  } else {
    console.log("Player " + fromBar.player + " tried to move from the bar to triangle " + to.num);
    gSelectedBarNumber = -1;
  }
  
  if (isValid) move(fromBar, to);
}

function move(from, to) {
    from.numCheckers -= 1;
    to.numCheckers += 1;
    gSelectedBarNumber = -1;
    gSelectedTriNumber = -1;
    DICE.updateDiceOnMove(from, to)
    console.log("Moved from " + from.num + " to " + to.num);

}

function updateTriangle(triangle) {
  var isValid = false;
  if (gSelectedTriNumber == -1) {
    /* about to make a move */
    gSelectedTriNumber = triangle.num;
  } else {
    var from = gTriangles[gSelectedTriNumber-1];
	var to = gTriangles[triangle.num-1];
      if (validDiceMove(from, to)) {    
	  /* try to move */
	    if (from.numCheckers) {
	      /* make sure player is moving in the right direction */
	      if (from.player == 1 && from.num > to.num) {
	        console.log("Player 1 trying to move backwards from " + from.num + " to " + to.num);
	        gSelectedTriNumber = -1;
	      } else if (from.player == 2 && from.num < to.num) {
	        console.log("Player 2 trying to move backwards from " + from.num + " to " + to.num);	  
	        gSelectedTriNumber = -1;
	      } else if (gPlayers[from.player-1].isHit()) {
		    console.log("Player " + from.player + " needs to move off the bar");
		    gSelectedTriNumber = -1;
	      } else if (from.num == to.num) {
            console.log("Clicked on the same triangle");
          } else {
	        if (to.numCheckers == 0) {
	          /* need to assign new player to empty triangle */
	          console.log("Moving from " + gSelectedTriNumber + " to " + triangle.num + " (an empty triangle)");
	          to.player = from.player;
		      isValid = true;
	        } else if (to.numCheckers == 1) {
		      isValid = true;		  
		      if (from.player != to.player) {
		        /* player has been hit */
			    to.numCheckers -= 1;
			    gPlayers[to.player-1].bar.numCheckers += 1;
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
	      gSelectedTriNumber = -1;
	      console.log("ERROR - Trying to move from triangle with no checkers");
	    }
	  } else {
	    console.log("not proper dice");
	    gSelectedTriNumber = -1;
	  }
  }
  if (isValid) move(from, to);

}

function validDiceMove(from, to) {
  var isValid = false;
  if (from.player == playerTurn()) {
    var i;
    var potentials = DICE.findPotentialMoves(from);
    for  (i = 0; i < potentials.length; i++) {
     if (potentials[i][0].num == to.num) isValid = true;
    }
  } else {
    console.log("Incorrect player moving");
  }
  return isValid;
}

function newGame() {
    gTriangles = [new Triangle(1, kBoardWidth-1,   1, 2),
                  new Triangle(2, kBoardWidth-2,   0, 0),
				  new Triangle(3, kBoardWidth-3,   0, 0),
				  new Triangle(4, kBoardWidth-4,   0, 0),
				  new Triangle(5, kBoardWidth-5,   0, 0),
				  new Triangle(6, kBoardWidth-6,   2, 5),
				  new Triangle(7, kBoardWidth-8,   0, 0),
				  new Triangle(8, kBoardWidth-9,   2, 3),
				  new Triangle(9, kBoardWidth-10,  0, 0),
				  new Triangle(10, kBoardWidth-11, 0, 0),
				  new Triangle(11, kBoardWidth-12, 0, 0),
				  new Triangle(12, kBoardWidth-13, 1, 5),
				  new Triangle(13, kBoardWidth-13, 2, 5),
				  new Triangle(14, kBoardWidth-12, 0, 0),
				  new Triangle(15, kBoardWidth-11, 0, 0),
				  new Triangle(16, kBoardWidth-10, 0, 0),
				  new Triangle(17, kBoardWidth-9,  1, 3),
				  new Triangle(18, kBoardWidth-8,  0, 0),
				  new Triangle(19, kBoardWidth-6,  1, 5),
				  new Triangle(20, kBoardWidth-5,  0, 0),
				  new Triangle(21, kBoardWidth-4,  0, 0),
				  new Triangle(22, kBoardWidth-3,  0, 0),
				  new Triangle(23, kBoardWidth-2,  0, 0),
				  new Triangle(24, kBoardWidth-1,  2, 2)];
    gPlayers = [new Player(1, "#ff0000", 0, barColumn, 19, 24, 1, 6, 1),
	            new Player(2, "#0000ff", kBoardHeight - 1, barColumn, 1, 6, 19, 24, -1)]
	DICE.roll();
	gNumTriangles = gTriangles.length;
    gSelectedPieceHasMoved = false;
    gMoveCount = 0;
	confirmedRolls = 1;
    gGameInProgress = true;
    DRAWER.drawBoard(DICE);
	updateText();
}

function confirmClick() {
  if (!DICE.dice.length) { //need to also check whether or not there is a feasible move 
    console.log("No more moves... rolling again");  
    DICE.roll();
	confirmedRolls += 1;
    updateText();	
  } else { 
	console.log("There are still moves to be played with the dice");
  }
}

function playerTurn() {
  return confirmedRolls % 2 ? 1: 2;
}

function initGame(canvasElement) {
  // init game globals
  DRAWER = new Drawer();
  DICE = new Dice(); 

  if (!canvasElement) {
    canvasElement = document.createElement("canvas");
	canvasElement.id = "bg_canvas";
	document.body.appendChild(canvasElement);
  }
	
  gCanvasElement = canvasElement;
  gCanvasElement.width = kPixelWidth;
  gCanvasElement.height = kPixelHeight;
  gCanvasElement.addEventListener("click", bgOnClick, false);	
	
  DRAWER.drawingContext = gCanvasElement.getContext("2d");
	
  currentDiceElement = document.getElementById('current-dice');
	
  confirmButtonElement = document.getElementById('confirm');
  confirmButtonElement.addEventListener("click", confirmClick, false);
	
  playerTurnElement = document.getElementById('player-turn');	

  newGame();
}