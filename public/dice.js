function Dice() {
  this.dice = new Array();
  
  this.diceCopy = new Array();
  
  this.getDice = function() {
    return this.dice;
  }
  
  this.updateDice = function(updatedDice) {
    this.dice = updatedDice;
  }
  
  this.roll = function(theRoll) {
  // take in a roll and update the dice based off of that
    this.dice = new Array();
    this.diceCopy = new Array();
    this.dice.push(theRoll.die1);
    this.dice.push(theRoll.die2);

    if (this.isDouble()) {
      this.dice.push(this.dice[0]);
      this.dice.push(this.dice[0]);
    }
    this.diceCopy = this.dice.slice(0);
    this.confirmedRolls += 1;
    var text = "Dice Rolled: ";
    for (var i = 0; i < this.dice.length; i++) {
      text += this.dice[i] + " - ";
    }
    console.log(text);
  }
  
  this.confirmedRolls = 0;
  
  this.isDouble = function() { return this.dice[0] == this.dice[1]; }
  
  this.updateDiceOnMove = function(num) {
    var idx = this.dice.indexOf(num);
    if (idx != -1) {
      this.dice.splice(idx, 1);
    } else {
      console.log("error -- trying to remove", num, "from dice...");
    }
  } 

}