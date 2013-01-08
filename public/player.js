var BasePlayer = { id          : { value: -1, configurable: true, enumerable: true, writable: true },
                   num         : { value: -1, configurable: true, enumerable: true, writable: true },
                   color       : { value: "", configurable: true, enumerable: true, writable: true },
                   homeStartNum: { value: -1, configurable: true, enumerable: true, writable: true },
                   homeEndNum  : { value: -1, configurable: true, enumerable: true, writable: true },
                   oppMinNum   : { value: -1, configurable: true, enumerable: true, writable: true },
                   oppMaxNum   : { value: -1, configurable: true, enumerable: true, writable: true },
                   direction   : { value:  0, configurable: true, enumerable: true, writable: true },
                   bearOffNum  : { value: -1, configurable: true, enumerable: true, writable: true },
                   type        : { value: "base", configurable: true, enumerable: true, writable: true}				   
			   };

BasePlayer.move = function(from, to, board) {
  return [];
}

function createHumanPlayer(id, num) {
  var hp = Object.create(HumanPlayer);
  
  // initialize
  hp.id = id;
  hp.num = num;
  hp.color = num == 1 ? "#FFFFF0" : "#262626";
  hp.homeStartNum = num == 1 ? 19 : 6;
  hp.homeEndNum = num == 1 ? 24 : 1;
  hp.oppMinNum = num == 1 ? 1 : 19;
  hp.oppMaxNum = num == 1 ? 6 : 24;
  hp.direction = num == 1 ? 1 : -1; 
  hp.bearOffNum = num == 1 ? 25 : 0;
  hp.type = "human";
  
  return hp;
}

var HumanPlayer = Object.create(BasePlayer);

HumanPlayer.move = function(from, to, board) {
  //function to return the moveset for the player
  var foundPotential;
  var moveset = [];

  // search potential moves to find the move that ends at to.num
  var potentials = board.findPotentialMoves(from);
  for (var i = 0; i < potentials.length; i++ ) {
    if (potentials[i].moves[potentials[i].moves.length -1].toNo == to.num) {
	  // found it!
	  foundPotential = potentials[i];
	  break;
    }    
  } 
 
  if (foundPotential) {
    for (var j = 0; j < foundPotential.moves.length; j++) {
	  moveset.push(foundPotential.moves[j]);
    }
  } else {
    board.selectedTriangleNum = -1;
    board.selectedBarNum = -1;
  }

  return moveset;
}

function createRobotPlayer(id) {
  // robot player will ALWAYS be #2
  var rp = Object.create(RobotPlayer);
  
  // initialize
  rp.id = id;
  rp.num = 2;
  rp.color =   "#262626";
  rp.homeStartNum =  6;
  rp.homeEndNum =  1;
  rp.oppMinNum =  19;
  rp.oppMaxNum = 24;
  rp.direction = -1; 
  rp.bearOffNum =  0;
  rp.type = "robot";
  
  return rp;
}

var RobotPlayer = Object.create(BasePlayer);

RobotPlayer.move = function(from, to, board) {
  //function to return the moveset for the player
  var moveset = new Array();
  var potentials = board.findAllPotentialMoves(this.num);
  
  if ( potentials.length ) {
  
    var rn = Math.floor(Math.random()*potentials.length);
    moveset = potentials[rn].moves;
  }
  /*
  var singleMoveFound = false;
  while (!singleMoveFound) {
    var potentials = board.findAllPotentialMoves(this.num);
    var rn = Math.floor(Math.random()*potentials.length);
	if (potentials.length) {
	  moveset = potentials[rn].moves;
	  if ( moveset.length == 1 ) {
	    singleMoveFound = true;
	  } 
	} else {
	  singleMoveFound = true;
	}
  }
  */
  return moveset;
}