function createDrawer() {
  var draw = Object.create(Drawer);  
  
  draw.db = Object.create(DrawableBoard); 
  draw.messageArea = createMessageArea();
  draw.infoMenu = createInfoMenu();
  
  // settings that should eventually be customizable by palyer
  draw.settings.animationTimeout = 8;

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
  this.ctxs.nctx.clearRect(0, 0, this.drawInfo.boardPixelWidth, this.drawInfo.totalPixelHeight);
  this.db.drawBoard(this.ctxs.nctx, this.triangles, this.bars, this.bearoffs);
}
  
Drawer.drawBoard = function(forPlayer) {
  this.ctxs.ctx.clearRect(0, 0, this.drawInfo.boardPixelWidth, this.drawInfo.totalPixelHeight);
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

  var dx = run / this.settings.animationTimeout;
  var dy = rise / this.settings.animationTimeout;

  var off = (this.drawInfo.pieceWidth/2) - (this.drawInfo.pieceWidth/9) + this.settings.animationTimeout;
  var side = this.drawInfo.pieceWidth + 10;

  var xAnim = xStart;
  var yAnim = yStart;
  var self = this;

  setTimeout( function() { 
    self.movePiece(xAnim, dx, yAnim, dy, off, side, from.player, from, to, 0); 
  }, this.settings.animationTimeout );

}

Drawer.drawDoublingDice = function() {
  this.doublingDice.draw( this.ctxs.ctx );
}

Drawer.drawDice = function( currentPlayer, mePlayer, otherPlayer, pCanConfirm, pCanRoll, anyMovesLeft ) {  
  // remove any remaining messages
  if ( this.messageArea.messagesDrawn || this.messageArea.buttonsDrawn ){ 
    this.messageArea.clearArea( this.ctxs.ctx );
  }  

  // TO-DO: refactor control of dice color selecting here?   
  this.dice.draw( this.ctxs.ctx, currentPlayer, mePlayer, otherPlayer, pCanConfirm, pCanRoll, anyMovesLeft );
}
 
Drawer.movePiece = function(x, dx, y, dy, off, side, playerNum, from, to, count) {
  var tx, ty;
  tx = x - off < 0 ? 0 : x - off; 
  ty = y - off < 0 ? 0 : y - off;
  if ( ty + side > this.drawInfo.boardPixelHeight ) ty = this.drawInfo.boardPixelHeight - side;

  this.ctxs.ctx.drawImage(this.canvasEls.nakedCanvas, tx, ty, side, side, tx, ty, side, side);        	
  xAnim = x + dx;
  yAnim = y + dy;
  drawCh = Object.create(CheckerXY, { x : { value : xAnim }, y : { value : yAnim }, player : { value : playerNum } });
  drawCh.draw(Drawable.ctxs.ctx, false);
  if ( ++count == this.settings.animationTimeout ) {
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
    }, this.settings.animationTimeout );
  }	
}

function createInfoMenu() {
  var im = Object.create(InfoMenu);
  
  im.specs.startX = 0; 
  im.specs.startY = im.drawInfo.boardPixelHeight;
  im.specs.width = im.drawInfo.boardPixelWidth
  im.specs.height = im.drawInfo.infoMenuPixelHeight;

  // undo botton
  im.specs.ub = {};
  im.specs.ub.margin = 5;
  im.specs.ub.width = 55;
  im.specs.ub.height = im.specs.height - im.specs.ub.margin * 2;
  im.specs.ub.startX = im.specs.width - im.specs.ub.width - im.specs.ub.margin;
  im.specs.ub.startY = im.specs.startY + im.specs.ub.margin;

  // player text
  im.specs.pt = {};
  im.specs.pt.startX = 5;
  im.specs.pt.startY = im.specs.startY + im.specs.height/2;
  return im;
}




function createMessageArea() {
  var ma = Object.create(MessageArea);
  
  //initializations
  ma.messagesDrawn = false;
  ma.buttonsDrawn = false;

  ma.specs.fontSize = 16;
  ma.specs.fontStyle = "sans-serif";
  ma.specs.offset = 4;
  
  ma.specs.buttonWidth = 80;
  ma.specs.buttonHeight = 20;  
  
  ma.specs.baseY = ma.interact.row * ma.drawInfo.pieceHeight  - ma.drawInfo.pieceHeight/2
  ma.specs.startX = ma.interact.messageColumn * ma.drawInfo.pieceWidth + ma.interact.padding;
  ma.specs.startY = ma.specs.baseY + ma.interact.padding;
  ma.specs.widthPix = ma.drawInfo.pieceWidth * ma.interact.messageColumns - ma.interact.padding * 2;
  ma.specs.heightPix =  ma.drawInfo.pieceHeight - ma.interact.padding * 2;
  ma.specs.maxRows = 3;
  ma.specs.maxWidth = ma.drawInfo.pieceWidth * 6;
  ma.specs.maxHeight = ( ma.specs.maxRows + 1 ) * ma.specs.fontSize;
  
  return ma;
}

Drawer.drawMessage = function( aMessage, buttonInfo ) {
  // function that takes in a message and an array of options
  // pertaining to whether or not buttons are needed or not
  // aMessage - string - containing the message to be displayed 
  //                     max of 40 characters for now
  // buttonInfo - array - button: boolean - represents whether or not buttons need to be drawn
  //                      acceptText: string - required if button is true. contains text to display on the accept button
  //                      denyText: string - required if button is true. contains text to display on the deny button
  this.messageArea.clearArea( this.ctxs.ctx );
  this.messageArea.drawMessage( this.ctxs.ctx, aMessage );
  if ( buttonInfo.button ) {
    this.messageArea.drawButtons( this.ctxs.ctx, buttonInfo.acceptText, buttonInfo.denyText );
  }
}

Drawer.drawInfoMenu = function( forPlayer, canUndo ) {
  // function that takes in a message and an array of options
  // pertaining to whether or not buttons are needed or not
  // forPlayer  - player - player object                    
  // canUndo - boolean - true if the player can undo, false otherwise
  this.infoMenu.drawFirst( this.ctxs.ctx, forPlayer );
  this.infoMenu.drawUndo( this.ctxs.ctx, canUndo );
}


var InfoMenu = Object.create( Drawable, { specs  : { value: {}, enumerable: true, writable: true } } );


InfoMenu.drawFirst = function( aCtx, player ) {
  
  aCtx.save();

  // info menu bar 
  aCtx.fillStyle = "brown";
  aCtx.fillRect(this.specs.startX, this.specs.startY, this.specs.width, this.specs.height);
  
  if (player) {
    aCtx.fillStyle = player.color;
    aCtx.font = '15px Calibri';
    aCtx.textBaseline = "middle";
    aCtx.textAlign = "left";	
    aCtx.fillText( "PLAYER " + player.num, 
                 this.specs.pt.startX, 
				 this.specs.pt.startY );  
  }
  aCtx.restore();

}

InfoMenu.drawUndo = function ( aCtx, canUndo ) {

  aCtx.save();

  if ( canUndo ) { 
    aCtx.gloabAlpha = 1;
  } else {
    aCtx.globalAlpha = .5;
  }
  
  aCtx.fillStyle = "white";
  aCtx.fillRect(this.specs.ub.startX , this.specs.ub.startY, this.specs.ub.width, this.specs.ub.height); 

  aCtx.fillStyle = "black";
  aCtx.font = '15px Calibri';
  aCtx.textBaseline = "middle";
  aCtx.textAlign = "center";
  aCtx.fillText( "UNDO", 
                 this.specs.ub.startX + this.specs.ub.width/2, 
				 this.specs.ub.startY + this.specs.ub.height/2 );    

  aCtx.restore();

} 

var MessageArea = Object.create( Interactable, { specs  : { value: {}, enumerable: true, writable: true } } );

MessageArea.drawMessage = function(aCtx, message) {
  this.messagesDrawn = true;
  
  aCtx.save();
  
  aCtx.fillStyle = "#347C17";
  aCtx.font = this.specs.fontSize + "px " + this.specs.fontStyle;
  aCtx.textBaseline = "top";
  aCtx.textAlign = "center";
  aCtx.fillText( message, 
                 this.specs.startX + this.specs.widthPix/2, 
				 this.specs.startY );
  //aCtx.fillText( message, this.specs.startX + this.specs.widthPix/2, this.specs.startY + this.specs.fontSize);

  aCtx.restore();
}

MessageArea.clearArea = function(aCtx) {
  
  aCtx.drawImage(this.canvasEls.nakedCanvas, 
	             0, this.specs.startY, this.specs.maxWidth, this.specs.maxHeight, 
	             0, this.specs.startY, this.specs.maxWidth, this.specs.maxHeight);        	 
  this.buttonsDrawn = false;
  this.messagesDrawn = false;

}

MessageArea.getStatus = function() { 
  return { messages : this.messagesDrawn,
           buttons  : this.buttonsDrawn
		 };
}
  

MessageArea.drawButtons = function( aCtx, acceptText, denyText ) {
  this.buttonsDrawn = true;
  
  aCtx.save();
  
  // draw button boxes
  aCtx.fillStyle = "#347C17";  
  aCtx.fillRect( this.getLeftButtonStartX(), 
                 this.getButtonStartY(), 
				 this.specs.buttonWidth, 
				 this.specs.buttonHeight );
  aCtx.fillRect( this.getRightButtonStartX(), 
                 this.getButtonStartY(), 
				 this.specs.buttonWidth, 
				 this.specs.buttonHeight );

  // populate text	
  aCtx.fillStyle = "#fff";    
  aCtx.font = this.specs.fontSize + "px " + this.specs.fontStyle;
  aCtx.textBaseline = "top";
  aCtx.textAlign = "center";
  aCtx.fillText( acceptText, 
                 this.getLeftButtonStartX() + ( this.specs.buttonWidth / 2 ), 
				 this.getButtonStartY() );
  aCtx.fillText( denyText, 
                 this.getRightButtonStartX() + ( this.specs.buttonWidth / 2 ), 
				 this.getButtonStartY() );  
  aCtx.restore();
}

MessageArea.getLeftButtonStartX = function () {
  return this.specs.startX;
}

MessageArea.getRightButtonStartX = function () {
  return this.specs.startX + this.specs.fontSize + this.specs.buttonWidth
}

MessageArea.getButtonStartY = function () {
  return this.specs.startY + this.specs.fontSize * 2 + this.specs.offset;
}
