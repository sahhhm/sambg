var bggame;

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

  var checker = new Checker(Math.floor(y/bggame.board.specs.pieceHeight), Math.floor(x/bggame.board.specs.pieceWidth));
  return [checker.findTriangleNum(bggame.board), checker.findBarNum(bggame.board)]
}

function bgOnClick(e) {
  var info = getCursorPosition(e);
  var triangle = bggame.board.getTriangleByNum(info[0]);
  var bar = bggame.board.getBarByNum(info[1]);
  var selectedBar = bggame.board.getSelectedBar();
  
    if (bar.player >= 1) {
	  bggame.board.selectedBarNum = bar.player;
	  selectedBar = bggame.board.getSelectedBar();
	  console.log("Bar " + bggame.board.selectedBarNum + " selected");
    }
  
    if (!bggame.board.hasSelectedBar()) {
	  if (!bggame.board.hasSelectedTriangle() && triangle.isEmpty()) {
        console.log("Triangle " + triangle.num + " which is empty was selected"); 
      } else {
        if (!bggame.board.hasSelectedTriangle()) {
          bggame.board.selectedTriangleNum = triangle.num;
        } else {	    
		  bggame.board.updateTriangle(bggame.board.getSelectedTriangle(), triangle);
        }
      }
	} else {
      if (selectedBar.isEmpty()) {
	    console.log("Bar " + bggame.board.selectedBarNum + " which is empty was selected");
	    bggame.board.selectedBarNum = -1;
	  } else {
	    if (triangle.num >= 1) bggame.board.updateBar(bggame.board.getSelectedBar(), triangle);
	  }
	} 
    
	bggame.board.update({draw:true,confirm:true,text:true});
}

function newGame() {
  bggame.board.update({roll:true,confirm:true,draw:true,text:true});
}

function confirmClick() {
  bggame.board.update({roll:true,confirm:true,text:true});
}

function initGame(canvasElement) { 
  if (!canvasElement) {
    canvasElement = document.createElement("canvas");
	canvasElement.id = "bg_canvas";
	document.body.appendChild(canvasElement);
  }
	
  bggame = new Game();

  newGame();
}