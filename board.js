function Board() {
  this.boardWidth =  13;
  this.boardHeight = 12;
  this.pieceWidth = 50;
  this.pieceHeight = 45;
  this.hitPieceWidth = 50;
  this.hitPieceHeight = 20;
  this.pixelWidth = function() { return 1 + (this.boardWidth * this.pieceWidth); };
  this.pixelHeight = function() { return 1 + (this.boardHeight * this.pieceHeight); }; 
  this.totalTriangles = 24;
  this.maxPiecesPerTriangle = 5;
  this.barColumn = 6;
}	  