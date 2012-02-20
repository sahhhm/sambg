var BOARD;

function removeSubsetFromArray(subset, array) {
  var newArr = new Array();
  var limit = BOARD.dice.isDouble() ? subset.length : subset.length + 1;
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
  x -= BOARD.drawer.canvasElement.offsetLeft;
  y -= BOARD.drawer.canvasElement.offsetTop;
  x = Math.min(x, BOARD.specs.boardWidth * BOARD.specs.pieceWidth);
  y = Math.min(y, BOARD.specs.boardHeight * BOARD.specs.pieceHeight);

  var checker = new Checker(Math.floor(y/BOARD.specs.pieceHeight), Math.floor(x/BOARD.specs.pieceWidth));
  return [checker.findTriangleNum(BOARD), checker.findBarNum(BOARD)]
}

function bgOnClick(e) {
  var info = getCursorPosition(e);
  var triangle = BOARD.getTriangleByNum(info[0]);
  var bar = BOARD.getBarByNum(info[1]);
  var selectedBar = BOARD.getSelectedBar();
  
    if (bar.player >= 1) {
	  BOARD.selectedBarNum = bar.player;
	  selectedBar = BOARD.getSelectedBar();
	  console.log("Bar " + BOARD.selectedBarNum + " selected");
    }
  
    if (!BOARD.hasSelectedBar()) {
	  if (!BOARD.hasSelectedTriangle() && triangle.isEmpty()) {
        console.log("Triangle " + triangle.num + " which is empty was selected"); 
      } else {
        if (!BOARD.hasSelectedTriangle()) {
          BOARD.selectedTriangleNum = triangle.num;
        } else {	    
		  BOARD.getSelectedTriangle().update(triangle, BOARD);
        }
      }
	} else {
      if (selectedBar.isEmpty()) {
	    console.log("Bar " + BOARD.selectedBarNum + " which is empty was selected");
	    BOARD.selectedBarNum = -1;
	  } else {
	    if (triangle.num >= 1) BOARD.getSelectedBar().update(triangle, BOARD);
	  }
	} 
    
	BOARD.drawer.drawBoard();
	BOARD.drawer.canConfirm();
    BOARD.drawer.updateText();
}

function newGame() {
	BOARD.dice.roll();
	BOARD.drawer.canConfirm();
    BOARD.drawer.drawBoard();
	BOARD.drawer.updateText();
}

function confirmClick() {
  BOARD.dice.roll();
  BOARD.drawer.canConfirm();  
  BOARD.drawer.updateText();	
}

function initGame(canvasElement) { 
  if (!canvasElement) {
    canvasElement = document.createElement("canvas");
	canvasElement.id = "bg_canvas";
	document.body.appendChild(canvasElement);
  }
	
  BOARD = new Board();
  BOARD.initialize();	

  newGame();
}