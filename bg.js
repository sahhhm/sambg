var kBoardWidth = 13;
var kBoardHeight= 13;
var kPieceWidth = 40;
var kPieceHeight= 40;
var kHitPieceWidth = 50;
var kHitPieceHeight = 20;
var kPixelWidth = 1 + (kBoardWidth * kPieceWidth);
var kPixelHeight= 1 + (kBoardHeight * kPieceHeight);

var totalTriangles = 24;
var maxPiecesPerTriangle = 5;
var barColumn = 6;

var player1;
var player2;

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
//var gMoveCountElem;
var gGameInProgress;

var originalDiceElement;
var currentDiceElement;

var player1Color = "#ff0000";
var player2Color = "#0000ff";
var selectedColor = "#00ff00";

var barSelected = false;

var dice;

function Dice() {
  this.dice = new Array();
  this.diceCopy = new Array();
  this.roll = function() {
    // use a RNG eventually
	this.dice = new Array();
	this.diceCopy = new Array();
	this.dice.push(Math.floor(Math.random()*6) + 1);
	this.dice.push(Math.floor(Math.random()*6) + 1);
	if (this.isDouble()) {
      this.dice.push(this.dice[0]);
	  this.dice.push(this.dice[0]);
	}
	this.diceCopy = this.dice.slice(0);
	var text = "Dice Rolled: ";
	for (var i = 0; i < this.dice.length; i++) {
	  text += this.dice[i] + " - ";
	}
	console.log(text);
  }
  this.isDouble = function() { return this.dice[0] == this.dice[1]; }
  this.directMoves = new Array();
  this.combinedMoves = new Array();
  this.findPotentialMoves = function(from) {
    var temp;
	var i;
	var curSum;
	var curDie;
    var player = gPlayers[from.player-1];
	this.directMoves = new Array();
	this.combinedMoves = new Array();
	if (validMove(from, gTriangles[from.num + (this.dice[0] * player.direction)-1])) {
	  curDie = [this.dice[0]];	
	  this.directMoves.push([gTriangles[from.num + (this.dice[0] * player.direction)-1], curDie.slice(0)]);
	  curSum = this.dice[0];	  
      for (i = 0; i < this.dice.length; i++) {
	    if (i != 0) {
	      if (validMove(from, gTriangles[(from.num + ((curSum + this.dice[i]) * player.direction))-1])) {
		    curDie.push(this.dice[i]);
	        this.combinedMoves.push([gTriangles[(from.num + ((curSum + this.dice[i]) * player.direction))-1], curDie.slice(0)]);
			curSum += this.dice[i];			
	      } else {
            break;
          }	
        }		
	  }
	}
	if (validMove(from, gTriangles[from.num + (this.dice[1] * player.direction)-1])) {
	  curDie = [this.dice[1]];  
	  this.directMoves.push([gTriangles[from.num + (this.dice[1] * player.direction)-1], curDie.slice(0)]);
	  curSum = this.dice[1];	
      for (i = 0; i < this.dice.length; i++) {
	    if (i != 1) {
	      if (validMove(from, gTriangles[(from.num + ((curSum + this.dice[i]) * player.direction))-1])) {
		    curDie.push(this.dice[i]);			
	        this.combinedMoves.push([gTriangles[(from.num + ((curSum + this.dice[i]) * player.direction))-1], curDie.slice(0)]);
			curSum += this.dice[i];
	      } else {
            break;
          }
        }		
	  } 
	} 
	return this.directMoves.concat(this.combinedMoves);
  }
  this.updateDiceOnMove = function(from, to) {
    var i, j;
	var potentials = this.findPotentialMoves(from);
	for (i = 0; i < potentials.length; i++) {
	  if (potentials[i][0].num == to.num) {
	    for (j = 0; j < potentials[i][1].length; j++) {
	      console.log("**removing " + potentials[i][1][j]);
		  this.dice = removeSubsetFromArray(potentials[i][1], this.dice);
		}
		break;
	  }
	}
  }
}

function removeSubsetFromArray(subset, array) {
  var newArr = new Array();
  for (var i = 0; i < array.length; i++) {
    var flagged = false;
	for (var j = 0; j < subset.length; j++) {
	  if (subset[j] == array[i]) { flagged = true; break; }
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
}

function updateText() {
  var i;
  var text = "";
  for (var i = 0; i < dice.diceCopy.length; i++) {
    text += dice.diceCopy[i] + " - ";
  }
  originalDiceElement.innerHTML = text;
  text = "";  
  for (var i = 0; i < dice.dice.length; i++) {
    text += dice.dice[i] + " - ";
  }
  currentDiceElement.innerHTML = text;
}

function Bar(player, row, column, numCheckers) {
  this.player = player;
  this.row = row;
  this.column = column;
  this.numCheckers = numCheckers;
  this.isTop = function() { return row < maxPiecesPerTriangle; }
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
  } else {
    if (gPlayers[gSelectedBarNumber-1].bar.numCheckers <= 0) {
	  console.log("Bar " + gSelectedBarNumber + " which is empty was selected");
	  gSelectedBarNumber = -1;
	} else {
	  if (triangle.num >= 1) updateBar(triangle);
	}
  }
  
  drawBoard();
  updateText();
}

function updateBar(dumTriangle) {
  var isValid = false;
  var fromPlayer = gPlayers[gSelectedBarNumber-1];
  var fromBar = fromPlayer.bar;
  var to = gTriangles[dumTriangle.num-1];
  
  if (to.num >= fromPlayer.oppMinNum && to.num <= fromPlayer.oppMaxNum) {
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
  
  /* move if valid */
  if (isValid) move(fromBar, to);
}

function move(from, to) {
  from.numCheckers -= 1;
  to.numCheckers += 1;
  gSelectedBarNumber = -1;
  gSelectedTriNumber = -1;
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
	//if ((to.num == from.num + (dice.dice[0] * gPlayers[from.player-1].direction)) || (to.num == from.num + (dice.dice[1] * gPlayers[from.player-1].direction))) {
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
	      //alert("Player " + from.player + " needs to move off the bar");
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
  if (isValid) {
    move(from, to);
	dice.updateDiceOnMove(from, to);
  }  
}

function validDiceMove(from, to) {
  var isValid = false;
  var i;
  var potentials = dice.findPotentialMoves(from);
  for (i = 0; i < potentials.length; i++) {
    if (potentials[i][0].num == to.num) isValid = true;
  }
  return isValid;
}

function drawBoard() {
    //if (gGameInProgress && isTheGameOver()) {
	//endGame();
    //}

    gDrawingContext.clearRect(0, 0, kPixelWidth, kPixelHeight);
    gDrawingContext.beginPath();
	gDrawingContext.lineWidth =  1;
    
    /* vertical lines */
    for (var x = 0; x <= kPixelWidth; x += kPieceWidth) {
      gDrawingContext.moveTo(0.5 + x, 0);
	  gDrawingContext.lineTo(0.5 + x, kPixelHeight);
    }
    
    /* horizontal lines */
    for (var y = 0; y <= kPixelHeight; y += kPieceHeight) {
	  gDrawingContext.moveTo(0, 0.5 + y);
	  gDrawingContext.lineTo(kPixelWidth, 0.5 +  y);
    }
    
    /* draw it! */
    gDrawingContext.strokeStyle = "#ccc";
    gDrawingContext.stroke();
    
	/* bar */
	gDrawingContext.fillStyle = "#ccc";
	for (var y = 0; y <= kPixelHeight; y += kPieceHeight) {
	  gDrawingContext.fillRect(kPieceWidth * Math.floor(kBoardWidth/2), y, kPieceWidth, kPieceHeight);
	}
	
	
	/* draw pieces in each triangle */
    for (var i = 0; i < gNumTriangles; i++) {
	  drawTriangle(gTriangles[i]);
    }

	/* draw hit pieces */
	for (var j = 0; j < gPlayers.length; j++) {
      drawBarForPlayer(gPlayers[j]);
	}

	/* highlight selected triangle */
	if (gSelectedTriNumber != -1) {
	  var tri = gTriangles[gSelectedTriNumber-1];
	  var tx = tri.column * kPieceWidth;
	  var height = tri.numCheckers * kPieceHeight;
	  if (!tri.isTop()) height = kPixelHeight - height;
	  var base = tri.isTop() ? 0 : kPixelHeight;

	  gDrawingContext.beginPath();
	  gDrawingContext.moveTo(0.5 + tx, base);
	  gDrawingContext.lineTo(0.5 + tx, height);
	  gDrawingContext.lineTo(0.5 + tx + kPieceWidth, height);
	  gDrawingContext.lineTo(0.5 + tx + kPieceWidth, base);
  
	  gDrawingContext.lineWidth = 3;
	  gDrawingContext.strokeStyle = "#00ff00";
      gDrawingContext.stroke();
	  
	  highlightPotentialMoves();
	}
	
	/* highlight selected bar */
	if (gSelectedBarNumber != -1) {
	  var bar = gPlayers[gSelectedBarNumber-1].bar;
	  var tx = bar.column * kPieceWidth;
	  var height = bar.numCheckers * kPieceHeight;
	  if (!bar.isTop()) height = kPixelHeight - height;
	  var base = bar.isTop() ? 0 : kPixelHeight;


	  gDrawingContext.beginPath();
	  gDrawingContext.moveTo(0.5 + tx, base);
	  gDrawingContext.lineTo(0.5 + tx, height);
	  gDrawingContext.lineTo(0.5 + tx + kPieceWidth, height);
	  gDrawingContext.lineTo(0.5 + tx + kPieceWidth, base);	  
	  gDrawingContext.lineWidth = 3;
	  gDrawingContext.strokeStyle = "#00ff00";
      gDrawingContext.stroke();
	}

    saveGameState();
}

function highlightPotentialMoves() {
  dice.findPotentialMoves(gTriangles[gSelectedTriNumber-1]);
  var directs = dice.directMoves;
  var combined = dice.combinedMoves;
  var i;
  var text;
  text = "Directs: ";
  for (i = 0; i < directs.length; i++) {
    text += directs[i][0].num;
	text += "(";
	for (j=0; j < directs[i][1].length; j++) {
	  text += directs[i][1][j] + ",";
	}
	text += ")"
	text += " - ";
  }  
  console.log(text);
  text = "Combined: ";
  for (i = 0; i < combined.length; i++) {
    text += combined[i][0].num;
	text += "(";
	for (j=0; j < combined[i][1].length; j++) {
	  text += combined[i][1][j] + ",";
	}
	text += ")"
	text += " - ";
  }
  console.log(text);

  var potentials = directs.concat(combined);
  for (i = 0; i < potentials.length; i++) {
      //copy of highlight
	  var tri = potentials[i][0];
	  var tx = tri.column * kPieceWidth;
	  var height = 0;
	  if (!tri.isTop()) height = kPixelHeight - height;
	  var base = tri.isTop() ? 0 : kPixelHeight;

	  gDrawingContext.beginPath();
	  gDrawingContext.moveTo(0.5 + tx, base);
	  gDrawingContext.lineTo(0.5 + tx, height);
	  gDrawingContext.lineTo(0.5 + tx + kPieceWidth, height);
	  gDrawingContext.lineTo(0.5 + tx + kPieceWidth, base);
  
	  gDrawingContext.lineWidth = 3;
	  gDrawingContext.strokeStyle = "#a020f0";
      gDrawingContext.stroke();    
  }
}

function drawTriangle(t) {
    var column = t.column;
    var isTop = t.isTop();
	var numCheckers = t.numCheckers;
	var player = t.player;
	
	for (var i = 0; i < numCheckers; i++) {
	  if (isTop) {
	    drawPiece(new Checker(i, column, t.player), false);
	  } else {
	    drawPiece(new Checker(kBoardHeight - i - 1, column, t.player), false);
	  }
	}
}

function drawBarForPlayer(p) {
  for (var k = 0; k < p.bar.numCheckers; k++) {
    if (p.bar.isTop()) {
	  drawPiece(new Checker(k, p.bar.column, p.num), false);
    } else {
      drawPiece(new Checker(kBoardHeight - k - 1, p.bar.column, p.num), false);
    }
  }
}

function drawPiece(p, selected) {
    var column = p.column;
    var row = p.row;
    var x = (column * kPieceWidth) + (kPieceWidth/2);
    var y = (row * kPieceHeight) + (kPieceHeight/2);
    var radius = (kPieceWidth/2) - (kPieceWidth/10);
    gDrawingContext.beginPath();
    gDrawingContext.arc(x, y, radius, 0, Math.PI*2, false);
    gDrawingContext.closePath();
    gDrawingContext.strokeStyle = "#000";
    gDrawingContext.stroke();
    if (selected) gDrawingContext.fillStyle = selectedColor;
	else if (p.player == 1) gDrawingContext.fillStyle = player1Color;
	else if (p.player == 2) gDrawingContext.fillStyle = player2Color;
	else console.error("Invalid Player (" + p.player + ") at [" + row + ", " + column + "]");
	gDrawingContext.fill();   
}

if (typeof resumeGame != "function") {
    saveGameState = function() {
	return false;
    }
    resumeGame = function() {
	return false;
    }
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
	player1 = gPlayers[0]; 
	player2 = gPlayers[1];
	dice = new Dice(); dice.roll();
	gNumTriangles = gTriangles.length;
    gSelectedPieceHasMoved = false;
    gMoveCount = 0;
    gGameInProgress = true;
    drawBoard();
}

function endGame() {
  gGameInProgress = false;
}

function initGame(canvasElement) {
    if (!canvasElement) {
        canvasElement = document.createElement("canvas");
	canvasElement.id = "bg_canvas";
	document.body.appendChild(canvasElement);
    }
	
    originalDiceElement = document.getElementById('original-dice');
	currentDiceElement = document.getElementById('current-dice');

    gCanvasElement = canvasElement;
    gCanvasElement.width = kPixelWidth;
    gCanvasElement.height = kPixelHeight;
    gCanvasElement.addEventListener("click", bgOnClick, false);
    gDrawingContext = gCanvasElement.getContext("2d");
    if (!resumeGame()) {
	  newGame();
    }
}