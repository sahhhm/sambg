function Drawer(s, triangles, bars, bearoffs) {
  this.specs = s;

  this.triangles = triangles;
  this.bars = bars;
  this.bearoffs = bearoffs;
  
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
  
  // initialize interacting row
  this.interact =
    {
      row: 6,
      columns: 13,
      doubling: 
      {
        column: 6
      },
      dice:
      {
        column: 8,
        columns: 4
      }
    }
  this.interact.pieceWidthPix = this.specs.pieceWidth;
  this.interact.pieceHeightPix = this.specs.pieceHeight;
  this.interact.startX = 0;
  this.interact.startY = this.interact.row * this.interact.pieceHeightPix  - this.interact.pieceHeightPix/2;
  this.interact.totalWidthPix = this.interact.pieceWidthPix * this.interact.columns;
  this.interact.totalHeightPix = this.interact.pieceHeightPix;
  this.interact.padding = 7;
  this.interact.doubling.startX = this.interact.doubling.column * this.interact.pieceWidthPix +this.interact.padding
  this.interact.doubling.startY = this.interact.startY + this.interact.padding;
  this.interact.doubling.widthPix = this.interact.pieceWidthPix - this.interact.padding * 2;
  this.interact.doubling.heightPix =  this.interact.pieceHeightPix - this.interact.padding * 2;
  this.interact.doubling.activeColor = "rgba(238, 213, 210, 1)";
  this.interact.doubling.inactiveColor = "rgba(238, 213, 210, 0.1)"; 
  
  this.interact.dice.startX = this.interact.dice.column * this.interact.pieceWidthPix +this.interact.padding
  this.interact.dice.startY = this.interact.startY + this.interact.padding;
  this.interact.dice.widthPix = this.interact.dice.columns * this.interact.pieceWidthPix - this.interact.padding * 2;
  this.interact.dice.heightPix =  this.interact.pieceHeightPix - this.interact.padding * 2;
  this.interact.dice.pieceWidth = this.interact.dice.heightPix 
  this.interact.dice.pieceHeight = this.interact.dice.heightPix;
  this.interact.dice.piecePadding = Math.abs((this.interact.dice.widthPix - 4*this.interact.dice.pieceWidth) / 5);
  this.interact.dice.alphaUsed = 0.2;
  this.interact.dice.alphaUnused = 0.8;

  this.db = Object.create(DrawableBoard); 
  
  Drawable.drawInfo = { pieceWidth : this.specs.pieceWidth,
                                 pieceHeight: this.specs.pieceHeight,
                                 p1color: this.specs.p1color,
                                 p2color: this.specs.p2color,
                                 bearOffWidth : this.specs.bearOffWidth,
                                 bearOffHeight : this.specs.bearOffHeight,
                                 boardHeight: this.specs.boardHeight,
                                 pixelHeight: this.specs.pixelHeight,
                                 barColumn : this.specs.barColumn,
                                 bearOffColumn : this.specs.bearOffColumn,
                                 maxPiecesPerTriangle : this.specs.maxPiecesPerTriangle,
								 pixelHeight : this.specs.pixelHeight,
								 pixelWidth : this.specs.pixelWidth
                       };
  
  this.drawNakedBoard = function() {
    this.nakedCtx.clearRect(0, 0, this.specs.pixelWidth, this.specs.pixelHeight);
	this.db.drawBoard(this.nakedCtx, this.triangles, this.bars, this.bearoffs);
  }
  
  this.drawBoard = function() {
    this.drawingContext.clearRect(0, 0, this.specs.pixelWidth, this.specs.pixelHeight);
	this.db.drawBoard(this.drawingContext, this.triangles, this.bars, this.bearoffs);
  }
  
  this.drawPotentials = function(from, pots) {
    if ( from ) {
      from.select( this.drawingContext );
      for (var i = 0; i < pots.length; i++) pots[i].highlight( this.drawingContext );
    }  
  }
  
  this.undoDecorations = function() {
    // function unselects and unhighlights 
    // any selecteed or highlighted spaces
    var spaces = this.triangles.concat( this.bars ).concat( this.bearoffs );
    for ( var i = 0; i < spaces.length; i++ ) {
      if ( spaces[i].selected ) {
        spaces[i].selected = false;
        spaces[i].draw(this.drawingContext);	  
      }
      if ( spaces[i].highlighted ) {
        spaces[i].highlighted = false;
        spaces[i].draw(this.drawingContext);	  
      }
    }	
  }
  
  this.animateMove = function(from, to) {
    this.drawNakedBoard();

    var rowStart, checksStart,  chStart, xStart, yStart; 
    var rowEnd, checksEnd, chEnd, xEnd, yEnd; 
    
    checksStart = from.numCheckers > this.specs.maxPiecesPerTriangle ? this.specs.maxPiecesPerTriangle : from.numCheckers;
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
  
  this.drawDoublingDice = function(opts) {
    var fs = opts.isActive ? this.interact.doubling.activeColor : this.interact.doubling.inactiveColor;
    this.drawingContext.fillStyle = fs;
    this.drawingContext.clearRect(this.interact.doubling.startX, this.interact.doubling.startY, this.interact.doubling.widthPix,  this.interact.doubling.heightPix); 
    this.drawingContext.fillRect(this.interact.doubling.startX, this.interact.doubling.startY, this.interact.doubling.widthPix,  this.interact.doubling.heightPix);    
    this.drawingContext.font = "15pt Arial";
    this.drawingContext.fillStyle = "rgba(0, 0, 0, .3)";
    this.drawingContext.fillText(opts.value, this.interact.doubling.startX + this.interact.doubling.widthPix/2 - this.interact.padding, this.interact.doubling.startY + this.interact.doubling.heightPix/2 + this.interact.padding);
  }

  this.drawDice = function(opts) {
    // { dice: Dice (array of DicePieces), currentPlayer: Player, mePlayer: Player, otherPlayer: Player, pCanConfirm: boolean, pCanRoll: boolean } 
    
    this.drawingContext.save();    
    
    // clear entire dice area
	var off = 3;
    this.drawingContext.clearRect(this.interact.dice.startX - off, this.interact.dice.startY - off, this.interact.dice.widthPix + off,  this.interact.dice.heightPix + off); 
    this.drawingContext.drawImage(this.nakedCanvasElement, this.interact.dice.startX - off, this.interact.dice.startY - off, this.interact.dice.widthPix + off, this.interact.dice.widthPix + off, this.interact.dice.startX - off, this.interact.dice.startY - off, this.interact.dice.widthPix + off, this.interact.dice.widthPix + off);
	
    // draw each individual dice
    var fs  = ( opts.dice.isRolled ) ? opts.currentPlayer.color : opts.otherPlayer.color;
    for ( var d = 0; d < opts.dice.dice.length; d++ ) {
      var pos = ( d + 1 ) % 4; // center the dice when there are only two... current looks funny when you have doubles and you move one at a time...

      this.drawingContext.globalAlpha = ( opts.dice.dice[d].isUsed ) ? this.interact.dice.alphaUsed : this.interact.dice.alphaUnused;
      this.drawingContext.fillStyle = fs;
      this.drawingContext.fillRect(this.interact.dice.startX + this.interact.dice.piecePadding +  pos * (this.interact.dice.pieceWidth  + this.interact.dice.piecePadding), 
                                   this.interact.dice.startY, 
                                   this.interact.dice.pieceWidth, this.interact.dice.pieceHeight);
      var ss = opts.currentPlayer.color;
	  if ( opts.pCanConfirm && opts.mePlayer.num == opts.otherPlayer.num ) ss = opts.otherPlayer.color;
	  if ( opts.pCanRoll ) ss = opts.currentPlayer.color;
	  if (opts.pCanConfirm || opts.pCanRoll) {
	    this.drawingContext.globalAlpha = .5; //( dice.dice[d].isUsed ) ? this.interact.dice.alphaUsed : this.interact.dice.alphaUnused;
		this.drawingContext.lineWidth = 3;
        this.drawingContext.strokeStyle =  ss;
        this.drawingContext.strokeRect(this.interact.dice.startX + this.interact.dice.piecePadding +  pos * (this.interact.dice.pieceWidth  + this.interact.dice.piecePadding), 
                                       this.interact.dice.startY, 
                                       this.interact.dice.pieceWidth, this.interact.dice.pieceHeight);
	  }
	  
      // display dice value
      this.drawingContext.fillStyle = "#FF4040";
      this.drawingContext.globalAlpha += .2;
      this.drawingContext.font = "15pt Arial";
      this.drawingContext.fillText(opts.dice.dice[d].value, 
                                  this.interact.dice.startX + this.interact.dice.piecePadding +  pos * (this.interact.dice.pieceWidth  + this.interact.dice.piecePadding) + ((this.interact.dice.pieceWidth - this.interact.dice.piecePadding )/2) , 
                                  this.interact.dice.startY + ( (this.interact.dice.pieceHeight + this.interact.padding) / 2 ));       
    }
    this.drawingContext.restore();
  }
  
  this.highlightDice = function(dice) {
    
    this.drawingContext.save();    
    
	 for ( var d = 0; d < dice.dice.length; d++ ) {
	       var pos = ( d + 1 ) % 4; // center the dice when there are only two... current looks funny when you have doubles and you move one at a time...

	    this.drawingContext.globalAlpha = .8; //( dice.dice[d].isUsed ) ? this.interact.dice.alphaUsed : this.interact.dice.alphaUnused;
		this.drawingContext.lineWidth = 3;
        this.drawingContext.strokeStyle =  "cyan";
        this.drawingContext.strokeRect(this.interact.dice.startX + this.interact.dice.piecePadding +  pos * (this.interact.dice.pieceWidth  + this.interact.dice.piecePadding), 
                                       this.interact.dice.startY, 
                                       this.interact.dice.pieceWidth, this.interact.dice.pieceHeight);
	 }
    
    this.drawingContext.restore();  
  }
  
  this.movePiece = function(x, dx, y, dy, off, side, playerNum, from, to, count) {
    var tx, ty;
	tx = x - off < 0 ? 0 : x - off; 
	ty = y - off < 0 ? 0 : y - off;
	if ( ty + side > this.specs.pixelHeight ) ty = this.specs.pixelHeight - side;
	
	//this.drawingContext.clearRect(tx, ty, side, side );
    this.drawingContext.drawImage(this.nakedCanvasElement, tx, ty, side, side, tx, ty, side, side);        	
    xAnim = x + dx;
    yAnim = y + dy;
    drawCh = Object.create(CheckerXY, { x : { value : xAnim }, y : { value : yAnim }, player : { value : playerNum } });
    drawCh.draw(this.drawingContext, false);
    if (++count == 15) {
      // piece moving is over... handle stuff here!
	  for ( var i = 0; i < this.bars.length; i++ ) {
	    if ( this.bars[i].player != from.player ) this.bars[i].draw( this.drawingContext );
	  }
    } else {
      var self = this;
      setTimeout( function() { 
        self.movePiece(xAnim, dx, yAnim, dy, off, side, from.player, from, to, count); 
      }, 15);
    }	
  }
}
