/*
* -------------------------------------------
* BASEPLAYER CLASS
* -------------------------------------------
*/
var BasePlayer = Class.extend({
    init: function(id, num) {
      this.id = id;
      this.num = num;
      this.color = num == 1 ? CONSTANT_SPECS.p1color  : CONSTANT_SPECS.p2color ;
      this.homeStartNum = num == 1 ? 19 : 6;
      this.homeEndNum = num == 1 ? 24 : 1;
      this.oppMinNum = num == 1 ? 1 : 19;
      this.oppMaxNum = num == 1 ? 6 : 24;
      this.direction = num == 1 ? 1 : -1; 
      this.bearOffNum = num == 1 ? 25 : 0;
      this.type = "BASE";
    },
    move: function(to, from, board) {
      return [];
    },
});

/*
* -------------------------------------------
* HUMANPLAYER CLASS
* -------------------------------------------
*/
var HumanPlayer = BasePlayer.extend({
    init: function(id, num) {
      this._super(id, num);
      this.type = "HUMAN"
    },
    move: function(from, to, board) {
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
},
});

/*
* -------------------------------------------
* ROBOTPLAYER CLASS
* -------------------------------------------
*/
var RobotPlayer = BasePlayer.extend({
    init: function(id, num) {
      this._super(id, num);
      this.type = "ROBOT"
    },
    move: function(from, to, board) {
      var moveset = new Array();
      var potentials = board.findAllPotentialMoves(this.num);

      if ( potentials.length ) {
        var rn = Math.floor(Math.random()*potentials.length);
        moveset = potentials[rn].moves;
      }
      return moveset;
  },
});
