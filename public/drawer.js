function Drawer(s, triangles, bars, bearoffs, dice, doublingDice) {
  this.specs = s;

  this.triangles = triangles;
  this.bars = bars;
  this.bearoffs = bearoffs;
  this.dice = dice;
  this.doublingDice = doublingDice;
  
  this.canvasElement = document.getElementById('bg_canvas');
  this.canvasElement.addEventListener("click", bgOnClick, false);  
  this.drawingContext = this.canvasElement.getContext("2d");
  
  this.nakedCanvasElement = document.getElementById('bg_naked');
  this.nakedCtx = this.nakedCanvasElement.getContext("2d")

  this.canvasElement.width = this.specs.pixelWidth;
  this.canvasElement.height = this.specs.pixelHeight;
  this.nakedCanvasElement.width = this.specs.pixelWidth;
  this.nakedCanvasElement.height = this.specs.pixelHeight;
  
  this.undoButtonElement = document.getElementById('undo');
  
  this.db = Object.create(DrawableBoard); 
  
  Drawable.drawInfo = { pieceWidth : this.specs.pieceWidth,
                        pieceHeight: this.specs.pieceHeight,
                        p1color: this.specs.p1color,
                        p2color: this.specs.p2color,
                        bearOffWidth : this.specs.bearOffWidth,
                        bearOffHeight : this.specs.bearOffHeight,
                        boardHeight: this.specs.boardHeight,
                        barColumn : this.specs.barColumn,
                        bearOffColumn : this.specs.bearOffColumn,
                        maxPiecesPerTriangle : this.specs.maxPiecesPerTriangle,
					    pixelHeight : this.specs.pixelHeight,
					    pixelWidth : this.specs.pixelWidth       
                       };

  Drawable.ctxs = { ctx  : this.drawingContext,
                    nctx : this.nakedCtx }
					
  Drawable.canvasEls = { canvas: this.canvasElement,
                         nakedCanvas: this.nakedCanvasElement }

  Interactable.init();	
  this.dice.initInteractable();
  this.doublingDice.initInteractable();

  

  
  this.drawNakedBoard = function() {
    Drawable.ctxs.nctx.clearRect(0, 0, this.specs.pixelWidth, this.specs.pixelHeight);
	this.db.drawBoard(Drawable.ctxs.nctx, this.triangles, this.bars, this.bearoffs);
  }
  
  this.drawBoard = function() {
    Drawable.ctxs.ctx.clearRect(0, 0, this.specs.pixelWidth, this.specs.pixelHeight);
	this.db.drawBoard(Drawable.ctxs.ctx, this.triangles, this.bars, this.bearoffs);
  }
  
  this.drawPotentials = function(from, pots) {
    if ( from ) {
      from.select( Drawable.ctxs.ctx );
      for (var i = 0; i < pots.length; i++) pots[i].highlight( Drawable.ctxs.ctx );
    }  
  }
  
  this.undoDecorations = function() {
    // function unselects and unhighlights 
    // any selecteed or highlighted spaces
    var spaces = this.triangles.concat( this.bars ).concat( this.bearoffs );
    for ( var i = 0; i < spaces.length; i++ ) {
      if ( spaces[i].selected ) {
        spaces[i].selected = false;
        spaces[i].draw( Drawable.ctxs.ctx );	  
      }
      if ( spaces[i].highlighted ) {
        spaces[i].highlighted = false;
        spaces[i].draw( Drawable.ctxs.ctx );	  
      }
    }	
  }
  
  this.animateMove = function(from, to) {
    // from/to has already been inremented/decremented 
	
    this.drawNakedBoard();

    var rowStart, checksStart,  chStart, xStart, yStart; 
    var rowEnd, checksEnd, chEnd, xEnd, yEnd; 
    
    checksStart = from.numCheckers >= this.specs.maxPiecesPerTriangle - 1 ? this.specs.maxPiecesPerTriangle -1 : from.numCheckers;
    rowStart = from.isTop() ? checksStart  : this.specs.boardHeight - checksStart - 1;
    chStart = Object.create(Checker, { row : { value : rowStart }, column : { value : from.column }, player : { value : from.player } });
    xStart = chStart.getX();
    yStart = chStart.getY();
    
    checksEnd = to.numCheckers > this.specs.maxPiecesPerTriangle ? this.specs.maxPiecesPerTriangle : to.numCheckers;
    rowEnd = to.isTop() ? checksEnd - 1 : this.specs.boardHeight - checksEnd;
    chEnd = Object.create(Checker, { row : { value : rowEnd }, column : { value : to.column }, player : { value : to.player } });
    xEnd = chEnd.getX();
    yEnd = chEnd.getY();  

    var rise = yEnd - yStart;
    var run = xEnd - xStart;
  
    var dx = run / 15;
    var dy = rise / 15;

    var off = (this.specs.pieceWidth/2) - (this.specs.pieceWidth/9) + 15;
    var side = this.specs.pieceWidth + 10;

    var xAnim = xStart;
    var yAnim = yStart;
    var self = this;
  
    setTimeout( function() { 
      self.movePiece(xAnim, dx, yAnim, dy, off, side, from.player, from, to, 0); 
    }, 15);
    
  }
  
  this.drawDoublingDice = function() {
    this.doublingDice.draw( Drawable.ctxs.ctx );
  }

  this.drawDice = function(currentPlayer, mePlayer, otherPlayer, pCanConfirm, pCanRoll) {
    // TO-DO: refactor control of dice color selecting here? 
    this.dice.draw( Drawable.ctxs.ctx, currentPlayer, mePlayer, otherPlayer, pCanConfirm, pCanRoll );
  }
  
  this.movePiece = function(x, dx, y, dy, off, side, playerNum, from, to, count) {
    var tx, ty;
	tx = x - off < 0 ? 0 : x - off; 
	ty = y - off < 0 ? 0 : y - off;
	if ( ty + side > this.specs.pixelHeight ) ty = this.specs.pixelHeight - side;
	
    Drawable.ctxs.ctx.drawImage(Drawable.canvasEls.nakedCanvas, tx, ty, side, side, tx, ty, side, side);        	
    xAnim = x + dx;
    yAnim = y + dy;
    drawCh = Object.create(CheckerXY, { x : { value : xAnim }, y : { value : yAnim }, player : { value : playerNum } });
    drawCh.draw(Drawable.ctxs.ctx, false);
    if (++count == 15) {
      // piece moving is over... handle stuff here!
	  for ( var i = 0; i < this.bars.length; i++ ) {
	    if ( this.bars[i].player != from.player ) this.bars[i].draw( Drawable.ctxs.ctx );
		to.draw( Drawable.ctxs.ctx );
	  }
    } else {
      var self = this;
      setTimeout( function() { 
        self.movePiece(xAnim, dx, yAnim, dy, off, side, from.player, from, to, count); 
      }, 15);
    }	
  }
}
