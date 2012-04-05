
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
  // move logic to check for correct player in here!
  // this should eliminate ALL player hcecking in updates
  if (me.num == bggame.board.playerTurn()) {
    var info = getCursorPosition(e);
    var triangle = bggame.board.getTriangleByNum(info[0]);
    var bar = bggame.board.getBarByNum(info[1]);
    var selectedBar = bggame.board.getSelectedBar();
  
    if (bar.player == me.num) {
      bggame.board.selectedBarNum = bar.player;
      selectedBar = bggame.board.getSelectedBar();
      console.log("Bar " + bggame.board.selectedBarNum + " selected");
    }
  
    if (bggame.board.getSelectedBar().num == -1) {
      if (bggame.board.getSelectedTriangle().num == -1 && triangle.isEmpty()) {
        console.log("Triangle " + triangle.num + " which is empty was selected"); 
      } else {
          if (bggame.board.getSelectedTriangle().num == -1 && triangle.player == me.num) {
            bggame.board.selectedTriangleNum = triangle.num;
          } else if (triangle.player == me.num || triangle.numCheckers < 2) { //eh....    
            bggame.board.updateTriangle(bggame.board.getSelectedTriangle(), triangle);
          }
      }
    } else {
      if (bggame.board.getSelectedBar().player == me.num) {
        if (selectedBar.isEmpty()) {
          console.log("Bar " + bggame.board.selectedBarNum + " which is empty was selected");
          bggame.board.selectedBarNum = -1;
        } else // need something {
          if (triangle.num >= 1) bggame.board.updateBar(bggame.board.getSelectedBar(), triangle);
        }
      }
    } 
    
    bggame.board.update({draw:true,confirm:true,text:true});
    
}

function newGame() {
  bggame.board.update({roll:false,confirm:true,draw:true,text:true});
}


function initGame(canvasElement, data) { 
  if (!canvasElement) {
    canvasElement = document.createElement("canvas");
    canvasElement.id = "bg_canvas";

    $("#game_area").append( '<p id="iam">I am Player: <span id="iam-player">null</span></p>' + 
                            '<p id="player">Current Player: <span id="player-turn">null</span></p>' + 
                            '<p id="c-dice">Current Dice: <span id="current-dice">null</span></p>' +
                            '<div id="c-button"><button id="confirm">confirm roll</button></div>' );
    $("#game_area").append(canvasElement);
  }
    
  bggame = new Game(data);
}