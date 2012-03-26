function Dice() {
  this.dice = new Array();
  
  this.diceCopy = new Array();
  
  this.roll = function() {
    // use a RNG eventually
	this.dice = new Array();
	this.diceCopy = new Array();
	this.dice.push(Math.floor(Math.random()*6) + 1);
	this.dice.push(Math.floor(Math.random()*6) + 1);
	//this.dice.push(4); this.dice.push(1);
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