function Checker(row, column, player) {
  this.row = row;
  this.column = column;
  this.player = player;
  
  this.findTriangleNum = function(b) {
    var x = this.column;
    var y = this.row;
    var tnum = -1;
    if (x != b.specs.barColumn) { 
      if (y < b.specs.maxPiecesPerTriangle) { // top 
        tnum = (b.specs.totalTriangles/2) - x + 1;
        if (x < b.specs.barColumn) tnum -= 1;
      } else if (y > b.specs.boardHeight - b.specs.maxPiecesPerTriangle - 1) { // bottom
        tnum = (b.specs.totalTriangles/2) + x + 1;
        if (x > b.specs.barColumn) tnum -=1;
      } else {
        tnum = -1;
      }  
    } else {
      tnum = -1;
    } 
    return tnum;  
  }

  this.findBarNum = function (b) {
    var x = this.column;
    var y = this.row;
    var bnum = -1;
    if (x == b.specs.barColumn) 
      if (y < b.specs.maxPiecesPerTriangle) bnum = 1;
      else if (y > b.specs.boardHeight - b.specs.maxPiecesPerTriangle - 1) bnum = 2;
      else bnum = -1;
    else bnum = -1;
    return bnum;	 
  }
  
}
