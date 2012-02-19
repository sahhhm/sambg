var gCanvasElement;

var gSelectedTriNumber = -1;
var gSelectedBarNumber = -1;

var CONST_BAR = "bar";
var CONST_TRI = "tri";

var currentDiceElement;
var confirmButtonElement;
var playerTurnElement;

var DICE;
var DRAWER;
var BOARD;

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
  x -= gCanvasElement.offsetLeft;
  y -= gCanvasElement.offsetTop;
  x = Math.min(x, BOARD.specs.boardWidth * BOARD.specs.pieceWidth);
  y = Math.min(y, BOARD.specs.boardHeight * BOARD.specs.pieceHeight);

  var checker = new Checker(Math.floor(y/BOARD.specs.pieceHeight), Math.floor(x/BOARD.specs.pieceWidth));
  return [checker.findTriangleNum(BOARD), checker.findBarNum(BOARD)]
}

function bgOnClick(e) {
  var info = getCursorPosition(e);
  var triangle = BOARD.getTriangleByNum(info[0]);
  var bar = BOARD.getBarByNum(info[1]);
  var selectedBar = BOARD.getBarByNum(gSelectedBarNumber);
  
    if (bar.player >= 1) {
	  gSelectedBarNumber = bar.player;
	  selectedBar = BOARD.getBarByNum(gSelectedBarNumber);
	  console.log("Bar " + gSelectedBarNumber + " selected");
    }
  
    if (gSelectedBarNumber == -1) {
	  if (gSelectedTriNumber == -1 && triangle.isEmpty()) {
        console.log("Triangle " + triangle.num + " which is empty was selected"); 
      } else {
        if (gSelectedTriNumber == -1) {
          gSelectedTriNumber = triangle.num;
        } else {	    
		  BOARD.getTriangleByNum(gSelectedTriNumber).update(triangle);
        }
      }
	} else {
      if (selectedBar.isEmpty()) {
	    console.log("Bar " + gSelectedBarNumber + " which is empty was selected");
	    gSelectedBarNumber = -1;
	  } else {
	    if (triangle.num >= 1) BOARD.getBarByNum(gSelectedBarNumber).update(triangle);
	  }
	} 
    
	DRAWER.drawBoard(DICE);
	DICE.canConfirm(confirmButtonElement);
    DRAWER.updateText(DICE);
}

function newGame() {
	DICE.roll();
    DRAWER.drawBoard(DICE);
	DRAWER.updateText(DICE);
}

function confirmClick() {
  DICE.roll();
  DRAWER.updateText(DICE);	
}

function initGame(canvasElement) {
  // init game globals
  DRAWER = new Drawer();
  DICE = new Dice(); 
  BOARD = new Board();
  BOARD.initialize();

  if (!canvasElement) {
    canvasElement = document.createElement("canvas");
	canvasElement.id = "bg_canvas";
	document.body.appendChild(canvasElement);
  }
	
  gCanvasElement = canvasElement;
  gCanvasElement.width = BOARD.specs.pixelWidth;
  gCanvasElement.height = BOARD.specs.pixelHeight;
  gCanvasElement.addEventListener("click", bgOnClick, false);	
	
  DRAWER.drawingContext = gCanvasElement.getContext("2d");
	
  currentDiceElement = document.getElementById('current-dice');
	
  confirmButtonElement = document.getElementById('confirm');
  confirmButtonElement.addEventListener("click", confirmClick, false);
	
  playerTurnElement = document.getElementById('player-turn');	

  newGame();
}