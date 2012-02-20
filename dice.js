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
  
  this.findPotentialMoves = function(from) {
    var temp, i, curSum, curDie, directs, combineds;
    var player = BOARD.gPlayers[from.player-1];
    var entry = from.entry;
	var directs = new Array();
	var combineds = new Array();
	
	for (var t = 0; t < 2; t++) {
	  if (from.validMoveTo(BOARD.gTriangles[entry + (this.dice[t] * player.direction) - 1])) {
        curDie = [this.dice[t]];	
        directs.push([BOARD.gTriangles[entry + (this.dice[t] * player.direction) - 1], curDie.slice(0)]);
        curSum = this.dice[t];
        for (i = 0; i < this.dice.length; i++) {
	      if (i != t) {
			if (from.validMoveTo(BOARD.gTriangles[entry + ((curSum + this.dice[i]) * player.direction) - 1])) {
		      curDie.push(this.dice[i]);
	          combineds.push([BOARD.gTriangles[entry + ((curSum + this.dice[i]) * player.direction) - 1], curDie.slice(0)]);
			  curSum += this.dice[i];			
	        } else {
              break;
            }
          }
	    }
  	  }
	}
    return directs.concat(combineds);	
  }  
  
  this.updateDiceOnMove = function(from, to) {
    var i;
	var potentials = this.findPotentialMoves(from);
	for (i = 0; i < potentials.length; i++) {
	  if (potentials[i][0].num == to.num) {
        this.dice = removeSubsetFromArray(potentials[i][1], this.dice);
        break;
	  }
	}
  }

  this.anyMovesLeft = function() {
    var any = false;
    var player = this.playerTurn();
	
	if (BOARD.gPlayers[player - 1].bar.isEmpty()) {
      for (var i = 0 ; i < BOARD.gTriangles.length; i++) {
        if (BOARD.gTriangles[i].player == player && !BOARD.gTriangles[i].isEmpty()) {
	      if (this.findPotentialMoves(BOARD.gTriangles[i]).length) {
	        any = true;
	        break;
	      }
	    }
      }	
	} else {
	  if (this.findPotentialMoves(BOARD.gPlayers[player-1].bar).length) {
	    any = true;
	  }	
	}
    return any;
  }
  
  this.playerTurn = function() {
    return this.confirmedRolls % 2 ? 1: 2;
  }
  
}