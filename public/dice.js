function DicePiece(aNum) {
  this.value = aNum;
  this.isUsed = false;
}

function createDice() {
  var d = Object.create(Dice);
  
  // initialize
  d.specs.baseY = d.interact.row * d.drawInfo.pieceHeight  - d.drawInfo.pieceHeight/2
  d.specs.startX = d.interact.diceColumn * d.drawInfo.pieceWidth + d.interact.padding
  d.specs.startY = d.specs.baseY + d.interact.padding;
  d.specs.widthPix = d.interact.diceColumns * d.drawInfo.pieceWidth - d.interact.padding * 2;
  d.specs.heightPix =  d.drawInfo.pieceHeight - d.interact.padding * 2;
  d.specs.pieceWidth = d.specs.heightPix 
  d.specs.pieceHeight = d.specs.heightPix;
  d.specs.piecePadding = Math.abs((d.specs.widthPix - 4*d.specs.pieceWidth) / 5);
  d.specs.alphaUsed = 0.2;
  d.specs.alphaUnused = 0.8;  
  
  return d;
}

var Dice = Object.create(Interactable, { dice           : { value:  [],   enumerable: true, writable: true },
                                         isRolled       : { value: false, enumerable: true, writable: true },
										 confirmedRolls : { value: 0,     enumerable: true, writable: true },
                                         specs          : { value: {},    enumerable: true, writable: true} });

Dice.getDice = function() { return this.dice; }
Dice.isDouble = function() { return this.dice[0].value == this.dice[1].value; }
Dice.froll = function(theRoll) {
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
}						
Dice.roll = function(theRoll) {
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
}  
Dice.updateDice = function(num, isCurrentlyUsed) {
  for ( var i = 0; i < this.dice.length; i++ ) {
    if ( this.dice[i].value == num  && this.dice[i].isUsed == isCurrentlyUsed) {
      this.dice[i].isUsed = !isCurrentlyUsed;
      break;
    }
  } 
} 
Dice.numUnusedDice = function() {
  var num = 0;
  for ( var i = 0; i < this.dice.length; i++ ) {
    if ( !this.dice[i].isUsed ) num += 1; 
  }
  return num; 
} 

Dice.draw = function( aCtx, currentPlayer, mePlayer, otherPlayer, pCanConfirm, pCanRoll ) {
    aCtx.save();    
    
    // clear entire dice area
	var off = 3;
    aCtx.clearRect(this.specs.startX - off, this.specs.startY - off, this.specs.widthPix + off,  this.specs.heightPix + off); 
    aCtx.drawImage(this.canvasEls.nakedCanvas, this.specs.startX - off, this.specs.startY - off, this.specs.widthPix + off, this.specs.heightPix + off, this.specs.startX - off, this.specs.startY - off, this.specs.widthPix + off, this.specs.heightPix + off + 1);
	
    // draw each individual dice
    var fs  = ( this.isRolled ) ? currentPlayer.color : otherPlayer.color;
    for ( var d = 0; d < this.dice.length; d++ ) {
      var pos = ( d + 1 ) % 4; // center the dice when there are only two... current looks funny when you have doubles and you move one at a time...

      aCtx.globalAlpha = ( this.dice[d].isUsed ) ? this.specs.alphaUsed : this.specs.alphaUnused;
      aCtx.fillStyle = fs;
      aCtx.fillRect(this.specs.startX + this.specs.piecePadding +  pos * (this.specs.pieceWidth  + this.specs.piecePadding), 
                                   this.specs.startY, 
                                   this.specs.pieceWidth, this.specs.pieceHeight);
      var ss = currentPlayer.color;
	  if ( pCanConfirm && mePlayer.num == otherPlayer.num ) ss = otherPlayer.color;
	  if ( pCanRoll ) ss = currentPlayer.color;
	  if (pCanConfirm || pCanRoll) {
	    aCtx.globalAlpha = .5; //( dice.dice[d].isUsed ) ? this.specs.alphaUsed : this.specs.alphaUnused;
		aCtx.lineWidth = 3;
        aCtx.strokeStyle =  ss;
        aCtx.strokeRect(this.specs.startX + this.specs.piecePadding +  pos * (this.specs.pieceWidth  + this.specs.piecePadding), 
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
}

function createDoublingDice() {
  var dd = Object.create(DoublingDice);
  
  //initializations
  dd.specs.baseY = dd.interact.row * dd.drawInfo.pieceHeight  - dd.drawInfo.pieceHeight/2
  dd.specs.startX = dd.interact.doublingColumn * dd.drawInfo.pieceWidth + dd.interact.padding;
  dd.specs.startY = dd.specs.baseY + dd.interact.padding;
  dd.specs.widthPix = dd.drawInfo.pieceWidth - dd.interact.padding * 2;
  dd.specs.heightPix =  dd.drawInfo.pieceHeight - dd.interact.padding * 2;
  dd.specs.activeColor = "rgba(238, 213, 210, 1)";
  dd.specs.inactiveColor = "rgba(238, 213, 210, 0.1)"; 
  return dd;
}

var DoublingDice = Object.create(Interactable, { lastPlayerToDoubleNum : { value: -1, enumerable: true, writable: true },
                                                 value                 : { value: 1,  enumerable: true, writable: true },
												 specs                 : { value: {}, enumerable: true, writable: true }});

DoublingDice.doubleDice = function(pNum) {
  this.value *= 2;
  this.lastPlayerToDoubleNum = pNum;
}

DoublingDice.draw = function ( aCtx ) {
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
}
