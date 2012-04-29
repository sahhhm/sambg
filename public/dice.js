function Dice() {
  this.dice = new Array();
    
  this.getDice = function() {
    return this.dice;
  }
  
  this.isRolled = false;
  
  this.updateDice = function(updatedDice) {
    this.dice = updatedDice;
  }
  
  this.froll = function(theRoll) {
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
  
  this.roll = function(theRoll) {
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
  
  this.confirmedRolls = 0;
  
  this.isDouble = function() { return this.dice[0].value == this.dice[1].value; }
  
  this.updateDiceOnMove = function(num) {
    for ( var i = 0; i < this.dice.length; i++ ) {
      if ( this.dice[i].value == num && this.dice[i].isUsed == false ) {
        this.dice[i].isUsed = true;
        break;
      }
    }
  } 
  
  this.replaceDiceOnUndo = function(num) {
    for ( var i = 0; i < this.dice.length; i++ ) {
      if ( this.dice[i].value == num  && this.dice[i].isUsed == true ) {
        this.dice[i].isUsed = false;
        break;
      }
    } 
  }
  
  this.numUnusedDice = function() {
    var num = 0;
    for ( var i = 0; i < this.dice.length; i++ ) {
      if ( !this.dice[i].isUsed ) num += 1; 
    }
    return num; 
  } 
}

function DicePiece(aNum) {
  this.value = aNum;
  this.isUsed = false;
}



function DoublingDice() {
  this.lastPlayerToDoubleNum = -1;
  this.value = 1;
  
  this.doubleDice = function(pNum) {
    this.value *= 2;
    this.lastPlayerToDoubleNum = pNum;
  }
}