function DicePiece(aNum) {
  this.value = aNum;
  this.isUsed = false;
}

var Dice = Object.create(Drawable, { dice          : { value:  [],   enumerable: true, writable: true },
                                    isRolled       : { value: false, enumerable: true, writable: true },
                                    confirmedRolls : { value: 0,     enumerable: true, writable: true } });

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
Dice.updateDiceOnMove = function(num) {
  for ( var i = 0; i < this.dice.length; i++ ) {
    if ( this.dice[i].value == num && this.dice[i].isUsed == false ) {
      this.dice[i].isUsed = true;
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

var DoublingDice = Object.create(Drawable, { lastPlayerToDoubleNum : { value: -1, enumerable: true, writable: true },
                                             value                 : { value: 1,  enumerable: true, writable: true } });

DoublingDice.doubleDice = function(pNum) {
  this.value *= 2;
  this.lastPlayerToDoubleNum = pNum;
}
