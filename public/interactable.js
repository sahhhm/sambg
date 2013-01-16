/*
* -------------------------------------------
* INTERACTABLE CLASS
* -------------------------------------------
*/
var Interactable = Drawable.extend({
    init: function() {
      this._super();
      this.interact = { row: 6,
												columns: 13,
												padding: 7,
                        doublingColumn: 6,
												diceColumn: 8, 
												diceColumns: 4,
												messageColumn: 1,
												messageColumns: 4
										  };      
    },
    getBaseX: function() {
      return 0;
    },
    getBaseY: function() {
      return this.interact.row * this.drawInfo.pieceHeight  - this.drawInfo.pieceHeight/2;
    },
    getTotalWidthPix: function() {
      return this.drawInfo.pieceWidth * 13;
    },
    getTotalHeightPix: function() {
      return this.drawInfo.pieceHeight;
    },
});


/*
* -------------------------------------------
* DICEPIECE CLASS
* -------------------------------------------
*/
var DicePiece = Class.extend({
    init: function(aNum) {
      this.value = aNum;
      this.isUsed = false;
    },
});

/*
* -------------------------------------------
* DICE CLASS
* -------------------------------------------
*/
var Dice = Interactable.extend({
    init: function(id, num) {
      this._super();
      this.dice = [];
      this.isRolled = false;
      this.confirmedRolls = 0;
      this.specs = {};
      this.specs.baseY = this.interact.row * this.drawInfo.pieceHeight  - this.drawInfo.pieceHeight/2
      this.specs.startX = this.interact.diceColumn * this.drawInfo.pieceWidth + this.interact.padding
      this.specs.startY = this.specs.baseY + this.interact.padding;
      this.specs.widthPix = this.interact.diceColumns * this.drawInfo.pieceWidth - this.interact.padding * 2;
      this.specs.heightPix =  this.drawInfo.pieceHeight - this.interact.padding * 2;
      this.specs.pieceWidth = this.specs.heightPix 
      this.specs.pieceHeight = this.specs.heightPix;
      this.specs.piecePadding = Math.abs((this.specs.widthPix - 4*this.specs.pieceWidth) / 5);
      this.specs.alphaUsed = 0.2;
      this.specs.alphaUnused = 0.8;        
    },
    getDice: function() { 
      return this.dice; 
    },
    isDouble: function() { 
      return this.dice[0].value == this.dice[1].value; 
    },
    froll: function(theRoll) {
      // for debugging purposes only....
      // take in a roll and update the dice based off of that
      this.dice = new Array();
      this.dice.push( new DicePiece( theRoll.die1 ));
      this.dice.push( new DicePiece( theRoll.die2 ));
      
      if (this.isDouble()) {
        this.dice.push( new DicePiece( this.dice[0].value ));
        this.dice.push( new DicePiece( this.dice[0].value ));
      }
      var text = " Fake Dice Rolled: ";
      for (var i = 0; i < this.dice.length; i++) {
        text += this.dice[i] + " - ";
      }
      console.log(text);  
    },					
    roll: function(theRoll) {
      // take in a roll and update the dice based off of that
      this.dice = new Array();
      this.dice.push( new DicePiece( theRoll.die1 ));
      this.dice.push( new DicePiece( theRoll.die2 ));

      if (this.isDouble()) {
        this.dice.push( new DicePiece( this.dice[0].value ));
        this.dice.push( new DicePiece( this.dice[0].value ));
      }
        
      this.isRolled = true;
      this.confirmedRolls += 1;
    },  
    updateDice: function(num, isCurrentlyUsed) {
      for ( var i = 0; i < this.dice.length; i++ ) {
        if ( this.dice[i].value == num  && this.dice[i].isUsed == isCurrentlyUsed) {
          this.dice[i].isUsed = !isCurrentlyUsed;
          break;
        }
      } 
    },
    numUnusedDice: function() {
      var num = 0;
      for ( var i = 0; i < this.dice.length; i++ ) {
        if ( !this.dice[i].isUsed ) num += 1; 
      }
      return num; 
    }, 
    draw: function( aCtx, currentPlayer, mePlayer, otherPlayer, pCanConfirm, pCanRoll, anyMovesLeft ) {
      aCtx.save();    
        
      // clear entire dice area
      var off = 3;
      aCtx.clearRect(this.specs.startX, this.specs.startY, this.specs.widthPix,  this.specs.heightPix); 
      aCtx.drawImage(this.canvasEls.nakedCanvas, this.specs.startX - off, this.specs.startY - off, this.specs.widthPix + off*2, this.specs.heightPix + off*2, 
                                                 this.specs.startX - off, this.specs.startY - off, this.specs.widthPix + off*2, this.specs.heightPix + off*2);
      
      // draw each individual dice
      var fs  = ( this.isRolled ) ? currentPlayer.color : otherPlayer.color;
      for ( var d = 0; d < this.dice.length; d++ ) {
        // center the dice when there are only two... current looks funny when you have doubles and you move one at a time...
        var pos;
        if ( this.dice.length == 2 ) { 
          pos = ( d + 1 ) % 4;
        } else {
          pos = d;
        }

        var ss = currentPlayer.color;
        if ( pCanConfirm && mePlayer.num == otherPlayer.num ) ss = otherPlayer.color;
        if ( pCanRoll ) ss = currentPlayer.color;
        if ( ( pCanConfirm || pCanRoll ) || !anyMovesLeft && (!( !pCanConfirm && !pCanRoll ))) {
          aCtx.globalAlpha = this.specs.alphaUsed;
          aCtx.lineWidth = 3;
          aCtx.strokeStyle = ss;
          aCtx.strokeRect(this.specs.startX + this.specs.piecePadding +  pos * (this.specs.pieceWidth  + this.specs.piecePadding), 
                          this.specs.startY, 
                          this.specs.pieceWidth, this.specs.pieceHeight);
          this.dice[d].isUsed = true;  
        } else {
          aCtx.globalAlpha = ( this.dice[d].isUsed ) ? this.specs.alphaUsed : this.specs.alphaUnused;
          aCtx.fillStyle = fs;
          aCtx.fillRect(this.specs.startX + this.specs.piecePadding +  pos * (this.specs.pieceWidth  + this.specs.piecePadding), 
                        this.specs.startY, 
                        this.specs.pieceWidth, this.specs.pieceHeight);	  
        }
        // display dice value
        aCtx.fillStyle = "#FF4040";
        aCtx.globalAlpha += .2;
        aCtx.font = "15pt Arial";
        aCtx.fillText(this.dice[d].value, 
                      this.specs.startX + this.specs.piecePadding +  pos * (this.specs.pieceWidth  + this.specs.piecePadding) + ((this.specs.pieceWidth - this.specs.piecePadding )/2) , 
                      this.specs.startY + ( (this.specs.pieceHeight + this.interact.padding) / 2 ));       
      }
      aCtx.restore();
    },  
    isClicked: function(x, y) {
      return ( x >= this.specs.startX && x <= this.specs.startX + this.specs.widthPix &&
               y >= this.specs.startY && y <= this.specs.startY + this.specs.heightPix );
    },
});                                         

/*
* -------------------------------------------
* DOUBLINGDICE CLASS
* -------------------------------------------
*/
var DoublingDice = Interactable.extend({
    init: function(id, num) {
      this._super();
      this.lastPlayerToDoubleNum = -1;
      this.value = 1;
      this.specs = {};
      this.specs.baseY = this.interact.row * this.drawInfo.pieceHeight  - this.drawInfo.pieceHeight/2
      this.specs.startX = this.interact.doublingColumn * this.drawInfo.pieceWidth + this.interact.padding;
      this.specs.startY = this.specs.baseY + this.interact.padding;
      this.specs.widthPix = this.drawInfo.pieceWidth - this.interact.padding * 2;
      this.specs.heightPix =  this.drawInfo.pieceHeight - this.interact.padding * 2;
      this.specs.activeColor = "rgba(238, 213, 210, 1)";
      this.specs.inactiveColor = "rgba(238, 213, 210, 0.1)"; 
    },
    doubleDice: function(pNum) {
      this.value *= 2;
      this.lastPlayerToDoubleNum = pNum;
    },
    draw: function ( aCtx ) {
      aCtx.save();
      
      // doubling dice
      aCtx.fillStyle = this.isActive ? this.specs.activeColor : this.specs.inactiveColor;
      aCtx.clearRect(this.specs.startX, this.specs.startY, this.specs.widthPix,  this.specs.heightPix); 
      aCtx.fillRect(this.specs.startX, this.specs.startY, this.specs.widthPix,  this.specs.heightPix);  

      // dice value	
      aCtx.font = "15pt Arial";
      aCtx.fillStyle = "rgba(0, 0, 0, .3)";
      aCtx.fillText(this.value, this.specs.startX + this.specs.widthPix/2 - this.interact.padding, this.specs.startY + this.specs.heightPix/2 + this.interact.padding);
      
      aCtx.restore(); 
    },
    isClicked: function(x, y) {
      return ( x >= this.specs.startX && x <= this.specs.startX + this.specs.widthPix &&
               y >= this.specs.startY && y <= this.specs.startY + this.specs.heightPix );
    },
});  

/*
* -------------------------------------------
* MESSAGEAREA CLASS
* -------------------------------------------
*/
var MessageArea = Interactable.extend({
    init: function( ) {
      this._super();
  
      this.messagesDrawn = false;
      this.buttonsDrawn = false;
      
      this.specs = {};
      this.specs.fontSize = 16;
      this.specs.fontStyle = "sans-serif";
      this.specs.offset = 4;
      
      this.specs.buttonWidth = 80;
      this.specs.buttonHeight = 20;  
      
      this.specs.baseY = this.interact.row * this.drawInfo.pieceHeight  - this.drawInfo.pieceHeight/2
      this.specs.startX = this.interact.messageColumn * this.drawInfo.pieceWidth + this.interact.padding;
      this.specs.startY = this.specs.baseY + this.interact.padding;
      this.specs.widthPix = this.drawInfo.pieceWidth * this.interact.messageColumns - this.interact.padding * 2;
      this.specs.heightPix =  this.drawInfo.pieceHeight - this.interact.padding * 2;
      this.specs.maxRows = 3;
      this.specs.maxWidth = this.drawInfo.pieceWidth * 6;
      this.specs.maxHeight = ( this.specs.maxRows + 1 ) * this.specs.fontSize;
    },
    drawMessage: function(aCtx, message) {
      this.messagesDrawn = true;
      
      aCtx.save();
      
      aCtx.fillStyle = "#347C17";
      aCtx.font = this.specs.fontSize + "px " + this.specs.fontStyle;
      aCtx.textBaseline = "top";
      aCtx.textAlign = "center";
      aCtx.fillText( message, 
                     this.specs.startX + this.specs.widthPix/2, 
                     this.specs.startY );
                     
      aCtx.restore();
    },
    clearArea: function(aCtx) {
      
      aCtx.drawImage(this.canvasEls.nakedCanvas, 
                     0, this.specs.startY, this.specs.maxWidth, this.specs.maxHeight, 
                     0, this.specs.startY, this.specs.maxWidth, this.specs.maxHeight);        	 
      this.buttonsDrawn = false;
      this.messagesDrawn = false;
    },
    getStatus: function() { 
      return { messages : this.messagesDrawn,
               buttons  : this.buttonsDrawn };
    },
    drawButtons: function( aCtx, acceptText, denyText ) {
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
    },
    isLeftButtonClicked: function(x, y) {
      return  ( x >= this.getLeftButtonStartX() && x <= this.getLeftButtonStartX() + this.specs.buttonWidth &&
                y >= this.getButtonStartY() && y <= this.getButtonStartY() + this.specs.buttonHeight );
    }, 
    isRightButtonClicked: function(x, y) {
      return ( x >= this.getRightButtonStartX() && x <= this.getRightButtonStartX() + this.specs.buttonWidth &&
               y >= this.getButtonStartY() && y <= this.getButtonStartY() + this.specs.buttonHeight );
    },
    getLeftButtonStartX: function () {
      return this.specs.startX;
    },
    getRightButtonStartX: function () {
      return this.specs.startX + this.specs.fontSize + this.specs.buttonWidth
    },
    getButtonStartY: function () {
      return this.specs.startY + this.specs.fontSize * 2 + this.specs.offset;
    },
});

/*
* -------------------------------------------
* INFOMENU CLASS
* -------------------------------------------
*/
var InfoMenu = Drawable.extend({
    init: function( ) {
      this._super();
  
      this.specs = {};
      this.specs.startX = 0; 
      this.specs.startY = this.drawInfo.boardPixelHeight;
      this.specs.width = this.drawInfo.boardPixelWidth
      this.specs.height = this.drawInfo.infoMenuPixelHeight;

      // undo botton
      this.specs.ub = {};
      this.specs.ub.margin = 5;
      this.specs.ub.width = 55;
      this.specs.ub.height = this.specs.height - this.specs.ub.margin * 2;
      this.specs.ub.startX = this.specs.width - this.specs.ub.width - this.specs.ub.margin;
      this.specs.ub.startY = this.specs.startY + this.specs.ub.margin;

      // pip count
      this.specs.pc = {};
      this.specs.pc.startX = (this.drawInfo.boardPixelWidth-this.drawInfo.bearOffWidth)/2;//this.specs.width / 2;
      this.specs.pc.startY = this.specs.startY + this.specs.height/2;
      this.specs.pc.fontPx = 15;
      
      // player text
      this.specs.pt = {};
      this.specs.pt.startX = 5;
      this.specs.pt.startY = this.specs.startY + this.specs.height/2;
    },
    drawFirst: function( aCtx, player, pipInfo ) {
      
      aCtx.save();

      aCtx.clearRect(this.specs.startX, this.specs.startY, this.specs.width, this.specs.height);
      // info menu bar 
      aCtx.fillStyle = "#8a4117";
      aCtx.globalAlpha = .6;
      aCtx.fillRect(this.specs.startX, this.specs.startY, this.specs.width, this.specs.height);
      aCtx.globalAlpha = 1;
      if (player) {
        // player number
        aCtx.fillStyle = player.color;
        aCtx.font = '15px Calibri';
        aCtx.textBaseline = "middle";
        aCtx.textAlign = "left";	
        aCtx.fillText( "PLAYER " + player.num, 
                       this.specs.pt.startX, 
                       this.specs.pt.startY );

        // pip counts
        // player 1
        aCtx.font = this.specs.pc.fontPx + 'px Calibri';
        aCtx.textBaseline = "bottom";
        aCtx.textAlign = "center";
        aCtx.fillStyle = this.drawInfo.p1color;		
        aCtx.fillText( pipInfo.pip1,
                       this.specs.pc.startX,
                       this.specs.pc.startY + 2 );
        // player 2
        aCtx.fillStyle = this.drawInfo.p2color;
        aCtx.font = this.specs.pc.fontPx + 'px Calibri';
        aCtx.textBaseline = "top";
        aCtx.textAlign = "center";    
        aCtx.fillText( pipInfo.pip2,
                       this.specs.pc.startX,
                       this.specs.pc.startY - 2 );				   
      }
      aCtx.restore();
    },
    drawUndo: function ( aCtx, canUndo ) {

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
    },
    isClicked: function(x, y) {
      return ( x >= this.specs.startX && x <= this.specs.startX + this.specs.width &&
               y >= this.specs.startY && y <= this.specs.startY + this.specs.height );
    },
    isUBClicked: function(x, y) {
      return ( x >= this.specs.ub.startX && x <= this.specs.ub.startX + this.specs.ub.width &&
               y >= this.specs.ub.startY && y <= this.specs.ub.startY + this.specs.ub.height )
    },    
});


