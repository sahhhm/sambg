function Drawer(d) {
  this.dice = d;
  
  this.canvasElement = document.getElementById('bg_canvas');
  this.canvasElement.addEventListener("click", bgOnClick, false);		  
  this.drawingContext = this.canvasElement.getContext("2d")
  this.currentDiceElement = document.getElementById('current-dice');
  this.playerTurnElement = document.getElementById('player-turn');	
  this.confirmButtonElement = document.getElementById('confirm');
  this.confirmButtonElement.addEventListener("click", confirmClick, false);
  
  this.drawBoard = function() {

    this.drawingContext.clearRect(0, 0, BOARD.specs.pixelWidth, BOARD.specs.pixelHeight);
    this.drawingContext.beginPath();
	this.drawingContext.lineWidth =  1;
    
    /* vertical lines */
    for (var x = 0; x <= BOARD.specs.pixelWidth; x += BOARD.specs.pieceWidth) {
      this.drawingContext.moveTo(0.5 + x, 0);
	  this.drawingContext.lineTo(0.5 + x, BOARD.specs.pixelHeight);
    }
    
    /* horizontal lines */
    for (var y = 0; y <= BOARD.specs.pixelHeight; y += BOARD.specs.pieceHeight) {
	  this.drawingContext.moveTo(0, 0.5 + y);
	  this.drawingContext.lineTo(BOARD.specs.pixelWidth, 0.5 +  y);
    }
    
    /* draw it! */
    this.drawingContext.strokeStyle = "#ccc";
    this.drawingContext.stroke();
    
	/* bar */
	this.drawingContext.fillStyle = "#ccc";
	for (var y = 0; y <= BOARD.specs.pixelHeight; y += BOARD.specs.pieceHeight) {
	  this.drawingContext.fillRect(BOARD.specs.pieceWidth * Math.floor(BOARD.specs.boardWidth/2), y, BOARD.specs.pieceWidth, BOARD.specs.pieceHeight);
	}
	
	
	/* draw pieces in each triangle */
    for (var i = 0; i < BOARD.specs.totalTriangles; i++) {
	  this.drawTriangle(BOARD.gTriangles[i]);
    }

	/* draw hit pieces */
	for (var j = 0; j < BOARD.gPlayers.length; j++) {
      this.drawBarForPlayer(BOARD.gPlayers[j]);
	}

	/* highlight selected triangle */
	if (BOARD.hasSelectedTriangle()) {
      this.highlight(BOARD.getSelectedTriangle(), "#00ff00", 3, false);	
	  this.highlightPotentialTriMoves();
	}
	
	/* highlight selected bar */
	if (BOARD.hasSelectedBar()) {
      this.highlight(BOARD.getSelectedBar(), "#00ff00", 3, false);
	  this.highlightPotentialBarMoves();
	}
  }

  this.highlight = function(tri, color, width, isPotential) {
	  var tx = tri.column * BOARD.specs.pieceWidth;
	  var height = isPotential ? 0 : tri.numCheckers * BOARD.specs.pieceHeight;
	  if (!tri.isTop()) height = BOARD.specs.pixelHeight - height;
	  var base = tri.isTop() ? 0 : BOARD.specs.pixelHeight;

	  this.drawingContext.beginPath();
	  this.drawingContext.moveTo(0.5 + tx, base);
	  this.drawingContext.lineTo(0.5 + tx, height);
	  this.drawingContext.lineTo(0.5 + tx + BOARD.specs.pieceWidth, height);
	  this.drawingContext.lineTo(0.5 + tx + BOARD.specs.pieceWidth, base);
  
	  this.drawingContext.lineWidth = width;
	  this.drawingContext.strokeStyle = color;
      this.drawingContext.stroke();      
  }
  
  this.highlightPotentialTriMoves = function() {
    var potentials = this.dice.findPotentialMoves(BOARD.getSelectedTriangle());
    for (var i = 0; i < potentials.length; i++) this.highlight(potentials[i][0], "#a020f0", 3, true)
  }  

  this.highlightPotentialBarMoves = function() {
    var potentials = this.dice.findPotentialMoves(BOARD.getSelectedBar());
    for (var i = 0; i < potentials.length; i++) this.highlight(potentials[i][0], "#a020f0", 3, true)
  }

  this.drawTriangle = function(t) {
    for (var i = 0; i < t.numCheckers; i++) 
	  t.isTop() ? this.drawPiece(new Checker(i, t.column, t.player), false) : this.drawPiece(new Checker(BOARD.specs.boardHeight - i - 1, t.column, t.player), false);
  }  

  this.drawBarForPlayer = function(p) {
    for (var k = 0; k < p.bar.numCheckers; k++) 
	  p.bar.isTop() ? this.drawPiece(new Checker(k, p.bar.column, p.num), false) : this.drawPiece(new Checker(BOARD.specs.boardHeight - k - 1, p.bar.column, p.num), false);	
  }  
  
  this.drawPiece = function(p, selected) {
    var x = (p.column * BOARD.specs.pieceWidth) + (BOARD.specs.pieceWidth/2);
    var y = (p.row * BOARD.specs.pieceHeight) + (BOARD.specs.pieceHeight/2);
    var radius = (BOARD.specs.pieceWidth/2) - (BOARD.specs.pieceWidth/9);
    this.drawingContext.beginPath();
    this.drawingContext.arc(x, y, radius, 0, Math.PI*2, false);
    this.drawingContext.closePath();
    this.drawingContext.strokeStyle = "#000";
    this.drawingContext.stroke();
	this.drawingContext.fillStyle = BOARD.gPlayers[p.player-1].color;
	this.drawingContext.fill();   
  } 

  this.updateText = function() {
    var i;
    var text = "";
    text += " [ ";
    for (var i = 0; i < this.dice.diceCopy.length; i++) 
      i == this.dice.diceCopy.length -1 ? text += this.dice.diceCopy[i]  : text += this.dice.diceCopy[i] + " - ";
    text += " ] ";
    for (var i = 0; i < d.dice.length; i++)
      i == this.dice.dice.length -1 ? text += this.dice.dice[i]  : text += this.dice.dice[i] + " - ";
    this.currentDiceElement.innerHTML = text;
    this.playerTurnElement.innerHTML = this.dice.playerTurn();
  }  
  
  this.canConfirm = function() {
    (!this.dice.dice.length || !this.dice.anyMovesLeft()) ? this.confirmButtonElement.disabled = false : this.confirmButtonElement.disabled = true;   
  }  
}