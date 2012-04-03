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
  // take in a roll and update 
  // the dice based off of that
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
  
  this.updateDiceOnMove = function(from, to, potentials) {
    var i;
    for (i = 0; i < potentials.length; i++) {
      if (potentials[i][0].num == to.num) {
        this.dice = this.removeSubsetFromArray(potentials[i][1], this.dice);
        break;
      }
    }
  }
  
  this.removeSubsetFromArray = function(subset, array) {
    var newArr = new Array();
    var limit = this.isDouble() ? subset.length : subset.length + 1;
    for (var i = 0; i < array.length; i++) {
      var flagged = false;
      if (i < limit) {
        for (var j = 0; j < subset.length; j++) {
          if (subset[j] == array[i]) { 
            flagged = true; 
            break; 
          }
        }
      }
      if (!flagged) newArr.push(array[i]);
    }
    return newArr;
}  

}