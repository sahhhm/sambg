function createDrawer() {
  var draw = Object.create(Drawer);  
  
  draw.undoButtonElement = document.getElementById('undo');
  draw.db = Object.create(DrawableBoard); 
  	 
  return draw;
}

var Drawer = Object.create(Drawable);    

Drawer.sets = function( tri, bars, bears, dice, ddice ) {
  this.triangles = tri;
  this.bars = bars;
  this.bearoffs = bears;
  this.dice = dice;
  this.doublingDice = ddice;
}

Drawer.setDoublingDice = function( dd ) {
  this.doublingDice = dd;
}		

Drawer.drawNakedBoard = function() {
  this.ctxs.nctx.clearRect(0, 0, this.drawInfo.pixelWidth, this.drawInfo.pixelHeight);
  this.db.drawBoard(this.ctxs.nctx, this.triangles, this.bars, this.bearoffs);
}
  
Drawer.drawBoard = function() {
  this.ctxs.ctx.clearRect(0, 0, this.drawInfo.pixelWidth, this.drawInfo.pixelHeight);
  this.db.drawBoard(this.ctxs.ctx, this.triangles, this.bars, this.bearoffs);
}

Drawer.drawPotentials = function(from, pots) {
  if ( from ) {
    from.select( this.ctxs.ctx );
    for (var i = 0; i < pots.length; i++) pots[i].highlight( this.ctxs.ctx );
  }  
}

Drawer.undoDecorations = function() {
  // function unselects and unhighlights 
  // any selecteed or highlighted spaces
  var spaces = this.triangles.concat( this.bars ).concat( this.bearoffs );
  for ( var i = 0; i < spaces.length; i++ ) {
    if ( spaces[i].selected ) {
	  spaces[i].selected = false;
	  spaces[i].draw( this.ctxs.ctx );	  
    }
    if ( spaces[i].highlighted ) {
      spaces[i].highlighted = false;
      spaces[i].draw( this.ctxs.ctx );	  
    }
  }	
}

Drawer.animateMove = function(from, to) {
  // from/to has already been inremented/decremented 

  this.drawNakedBoard();

  var rowStart, checksStart,  chStart, xStart, yStart; 
  var rowEnd, checksEnd, chEnd, xEnd, yEnd; 

  checksStart = from.numCheckers >= this.drawInfo.maxPiecesPerTriangle - 1 ? this.drawInfo.maxPiecesPerTriangle -1 : from.numCheckers;
  rowStart = from.isTop() ? checksStart  : this.drawInfo.boardHeight - checksStart - 1;
  chStart = Object.create(Checker, { row : { value : rowStart }, column : { value : from.column }, player : { value : from.player } });
  xStart = chStart.getX();
  yStart = chStart.getY();

  checksEnd = to.numCheckers > this.drawInfo.maxPiecesPerTriangle ? this.drawInfo.maxPiecesPerTriangle : to.numCheckers;
  rowEnd = to.isTop() ? checksEnd - 1 : this.drawInfo.boardHeight - checksEnd;
  chEnd = Object.create(Checker, { row : { value : rowEnd }, column : { value : to.column }, player : { value : to.player } });
  xEnd = chEnd.getX();
  yEnd = chEnd.getY();  

  var rise = yEnd - yStart;
  var run = xEnd - xStart;

  var dx = run / 15;
  var dy = rise / 15;

  var off = (this.drawInfo.pieceWidth/2) - (this.drawInfo.pieceWidth/9) + 15;
  var side = this.drawInfo.pieceWidth + 10;

  var xAnim = xStart;
  var yAnim = yStart;
  var self = this;

  setTimeout( function() { 
    self.movePiece(xAnim, dx, yAnim, dy, off, side, from.player, from, to, 0); 
  }, 15);

}

Drawer.drawDoublingDice = function() {
  this.doublingDice.draw( this.ctxs.ctx );
}

Drawer.drawDice = function( currentPlayer, mePlayer, otherPlayer, pCanConfirm, pCanRoll, anyMovesLeft ) {
  // TO-DO: refactor control of dice color selecting here? 
  this.dice.draw( this.ctxs.ctx, currentPlayer, mePlayer, otherPlayer, pCanConfirm, pCanRoll, anyMovesLeft );
}
 
Drawer.movePiece = function(x, dx, y, dy, off, side, playerNum, from, to, count) {
  var tx, ty;
  tx = x - off < 0 ? 0 : x - off; 
  ty = y - off < 0 ? 0 : y - off;
  if ( ty + side > this.drawInfo.pixelHeight ) ty = this.drawInfo.pixelHeight - side;

  this.ctxs.ctx.drawImage(this.canvasEls.nakedCanvas, tx, ty, side, side, tx, ty, side, side);        	
  xAnim = x + dx;
  yAnim = y + dy;
  drawCh = Object.create(CheckerXY, { x : { value : xAnim }, y : { value : yAnim }, player : { value : playerNum } });
  drawCh.draw(Drawable.ctxs.ctx, false);
  if (++count == 15) {
    // piece moving is over... handle stuff here!
    for ( var i = 0; i < this.bars.length; i++ ) { 
	  this.bars[i].draw( Drawable.ctxs.ctx );
	  to.draw( Drawable.ctxs.ctx );
	  from.draw( Drawable.ctxs.ctx );
    }
  } else {
    var self = this;
    setTimeout( function() { 
	  self.movePiece(xAnim, dx, yAnim, dy, off, side, from.player, from, to, count); 
    }, 15);
  }	
}