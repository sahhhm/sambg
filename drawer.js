function Drawer() {
  this.drawingContext = "";

  this.drawBoard = function(dice) {

    this.drawingContext.clearRect(0, 0, kPixelWidth, kPixelHeight);
    this.drawingContext.beginPath();
	this.drawingContext.lineWidth =  1;
    
    /* vertical lines */
    for (var x = 0; x <= kPixelWidth; x += kPieceWidth) {
      this.drawingContext.moveTo(0.5 + x, 0);
	  this.drawingContext.lineTo(0.5 + x, kPixelHeight);
    }
    
    /* horizontal lines */
    for (var y = 0; y <= kPixelHeight; y += kPieceHeight) {
	  this.drawingContext.moveTo(0, 0.5 + y);
	  this.drawingContext.lineTo(kPixelWidth, 0.5 +  y);
    }
    
    /* draw it! */
    this.drawingContext.strokeStyle = "#ccc";
    this.drawingContext.stroke();
    
	/* bar */
	this.drawingContext.fillStyle = "#ccc";
	for (var y = 0; y <= kPixelHeight; y += kPieceHeight) {
	  this.drawingContext.fillRect(kPieceWidth * Math.floor(kBoardWidth/2), y, kPieceWidth, kPieceHeight);
	}
	
	
	/* draw pieces in each triangle */
    for (var i = 0; i < gNumTriangles; i++) {
	  this.drawTriangle(gTriangles[i]);
    }

	/* draw hit pieces */
	for (var j = 0; j < gPlayers.length; j++) {
      this.drawBarForPlayer(gPlayers[j]);
	}

	/* highlight selected triangle */
	if (gSelectedTriNumber != -1) {
      this.highlight(gTriangles[gSelectedTriNumber-1], "#00ff00", 3, false);	
	  this.highlightPotentialTriMoves(dice);
	}
	
	/* highlight selected bar */
	if (gSelectedBarNumber != -1) {
      this.highlight(gPlayers[gSelectedBarNumber-1].bar, "#00ff00", 3, false);
	  this.highlightPotentialBarMoves(dice);
	}

  }

  this.highlight = function(tri, color, width, isPotential) {
	  var tx = tri.column * kPieceWidth;
	  var height = isPotential ? 0 : tri.numCheckers * kPieceHeight;
	  if (!tri.isTop()) height = kPixelHeight - height;
	  var base = tri.isTop() ? 0 : kPixelHeight;

	  this.drawingContext.beginPath();
	  this.drawingContext.moveTo(0.5 + tx, base);
	  this.drawingContext.lineTo(0.5 + tx, height);
	  this.drawingContext.lineTo(0.5 + tx + kPieceWidth, height);
	  this.drawingContext.lineTo(0.5 + tx + kPieceWidth, base);
  
	  this.drawingContext.lineWidth = width;
	  this.drawingContext.strokeStyle = color;
      this.drawingContext.stroke();      
  }
  
  this.highlightPotentialTriMoves = function(dice) {
    var potentials = dice.findPotentialMoves(gTriangles[gSelectedTriNumber-1]);
    for (var i = 0; i < potentials.length; i++) DRAWER.highlight(potentials[i][0], "#a020f0", 3, true)
  }  

  this.highlightPotentialBarMoves = function(dice) {
    var potentials = dice.findPotentialMoves(gPlayers[gSelectedBarNumber-1].bar);
    for (var i = 0; i < potentials.length; i++) DRAWER.highlight(potentials[i][0], "#a020f0", 3, true)
  }

  this.drawTriangle = function(t) {
    for (var i = 0; i < t.numCheckers; i++) 
	  t.isTop() ? this.drawPiece(new Checker(i, t.column, t.player), false) : this.drawPiece(new Checker(kBoardHeight - i - 1, t.column, t.player), false);
  }  

  this.drawBarForPlayer = function(p) {
    for (var k = 0; k < p.bar.numCheckers; k++) 
	  p.bar.isTop() ? this.drawPiece(new Checker(k, p.bar.column, p.num), false) : this.drawPiece(new Checker(kBoardHeight - k - 1, p.bar.column, p.num), false);	
  }  
  
  this.drawPiece = function(p, selected) {
    var x = (p.column * kPieceWidth) + (kPieceWidth/2);
    var y = (p.row * kPieceHeight) + (kPieceHeight/2);
    var radius = (kPieceWidth/2) - (kPieceWidth/9);
    this.drawingContext.beginPath();
    this.drawingContext.arc(x, y, radius, 0, Math.PI*2, false);
    this.drawingContext.closePath();
    this.drawingContext.strokeStyle = "#000";
    this.drawingContext.stroke();
	this.drawingContext.fillStyle = gPlayers[p.player-1].color;
	this.drawingContext.fill();   
  }  
  
}