function Board() {
  this.init = false;
  this.specs = {};
  this.gTriangles = [];
  
  this.initialize = function() {
    if (!this.init) {
	  this.specs = {
        boardWidth : 13,
        boardHeight : 12,
        pieceWidth : 50,
        pieceHeight : 45,
        hitPieceWidth : 50,
        hitPieceHeight : 20,
        totalTriangles : 24,
        maxPiecesPerTriangle : 5,
        barColumn : 6
	  };
	  this.specs.pixelWidth = this.specs.boardWidth * this.specs.pieceWidth + 1;
	  this.specs.pixelHeight = this.specs.boardHeight * this.specs.pieceHeight + 1;

      this.gTriangles = 
	    [new Triangle(1, this.specs.boardWidth-1,   1, 2),
         new Triangle(2, this.specs.boardWidth-2,   0, 0),
		 new Triangle(3, this.specs.boardWidth-3,   0, 0),
		 new Triangle(4, this.specs.boardWidth-4,   0, 0),
		 new Triangle(5, this.specs.boardWidth-5,   0, 0),
		 new Triangle(6, this.specs.boardWidth-6,   2, 5),
		 new Triangle(7, this.specs.boardWidth-8,   0, 0),
		 new Triangle(8, this.specs.boardWidth-9,   2, 3),
		 new Triangle(9, this.specs.boardWidth-10,  0, 0),
		 new Triangle(10, this.specs.boardWidth-11, 0, 0),
		 new Triangle(11, this.specs.boardWidth-12, 0, 0),
		 new Triangle(12, this.specs.boardWidth-13, 1, 5),
		 new Triangle(13, this.specs.boardWidth-13, 2, 5),
		 new Triangle(14, this.specs.boardWidth-12, 0, 0),
		 new Triangle(15, this.specs.boardWidth-11, 0, 0),
		 new Triangle(16, this.specs.boardWidth-10, 0, 0),
		 new Triangle(17, this.specs.boardWidth-9,  1, 3),
		 new Triangle(18, this.specs.boardWidth-8,  0, 0),
		 new Triangle(19, this.specs.boardWidth-6,  1, 5),
		 new Triangle(20, this.specs.boardWidth-5,  0, 0),
		 new Triangle(21, this.specs.boardWidth-4,  0, 0),
		 new Triangle(22, this.specs.boardWidth-3,  0, 0),
		 new Triangle(23, this.specs.boardWidth-2,  0, 0),
		 new Triangle(24, this.specs.boardWidth-1,  2, 2)];

      this.gPlayers = 
	     [new Player(1, "#ff0000", 0, BOARD.specs.barColumn, 19, 24, 1, 6, 1),
	     new Player(2, "#0000ff", BOARD.specs.boardHeight - 1, BOARD.specs.barColumn, 1, 6, 19, 24, -1)]		 
		 
      this.init = true;
    }
	
	
  }

}	  