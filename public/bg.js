socket.on('room refresh', function(data){
  var list = $("#list_of_rooms").html('').append('<ul></ul>').find('ul');
  for (var i =0; i < data.length; i++) {
    list.append('<li id="room-' + data[i] +'"><div id="room">' + data[i] + '</div></li>');
  }
   
  if (selectedRoom != -1) {
    $('#create_button').attr('disabled', true);
    $("#room-"+selectedRoom).append('<div id="room-leave-'+selectedRoom+'"> - leave</div>'); 
  } else {
    $('#create_button').attr('disabled', false);
    $("#list_of_rooms li").each(function(index) {
      $(this).append('<div id="room-join-'+selectedRoom+'"> - join</div>');
    });
  }
});
 
socket.on('room chosen', function(data){
  selectedRoom = data.room;
});
 
socket.on('load game', function(data){
  $('#lobby').hide();
  initGame(null, null, data);
  newGame();
  bggame.board.drawer.drawBoard();
  bggame.board.drawer.drawNakedBoard();
});
 
socket.on('dice', function(data) {
  console.log("got dice event", data.die1, data.die2);
  bggame.board.roll( { die1: data.die1, die2 : data.die2 } );
  bggame.board.update( { forPlayer : me.num } );
  bggame.board.waitingForNextTurn = false; 
 
  if ( bggame.gameHasRobotPlayer() && bggame.board.playerTurn() == 2 ) { 
    //socket.emit('robot move request', { room: selectedRoo
    console.log("play robot move...");
    playRobotMove2();
   }
 });
 
function playRobotMove2() {
  var moveset = bggame.players[1].move(undefined, undefined, bggame.board);
  if ( moveset.length ) {
    var time = ( ( bggame.board.drawer.settings.animationTimeout  * 100 ) / 2 ) * moveset.length;
    bggame.board.move(moveset, false);	   
    console.log("playRobotMove2", time);
    setTimeout( playRobotMove2(), time);   
  } else { 
    var holdTurn = bggame.board.turns.cloneCurrentTurn();
    while ( bggame.board.turns.currentTurn.length ) {
      bggame.board.undoMove( false );
      if ( !bggame.board.turns.currentTurn.length ) {
        console.log("time to move robot...");
        console.log("sending " + holdTurn.length + " moves");
        socket.emit('robot moved', { room: selectedRoom, moves:holdTurn} ); 
      }
    }	 
  }
}
 
socket.on('game over', function(data) {
  console.log("game over");
  bggame.board.gameEnded( data.winnerNum, data.points );
});   
 
//for debugging only
socket.on('fdice', function(data) {
 bggame.board.dice.froll(data);
 bggame.board.update({ forPlayer : me.num });
});
 
socket.on('update', function(data) {
  console.log("got update event!!");
  var i;
  var tempMove;
  var moves = data.moves;
  var aMoves = [];
 
  console.log("updating " + moves.length + " moves");
 
  if (moves) {
    for (i = 0; i < moves.length; i++) {
      var tempMove = new AMove(moves[i].turnNo, moves[i].player, moves[i].fromNo, moves[i].fromType, moves[i].toNo, moves[i].toType, moves[i].isToHit, moves[i].diceValue);
      aMoves.push(tempMove);
    }
    console.log("updating -- about to move " + aMoves.length + " moves");
    bggame.board.move(aMoves, true);
    bggame.board.waitingForNextTurn = false;
  } 
});
 
socket.on( 'double request', function( data ) {
  bggame.board.doubleRequest ( me.num, data.requestingPlayer );
   
  if ( bggame.gameHasRobotPlayer()) {
    socket.emit( 'double chosen', { room: selectedRoom, choosingPlayer: 2, action: "accept" } );
  }
});
 
socket.on( 'double action', function( data ) {
  if (data.action == "accept") {
    bggame.board.doublingDice.doubleDice((data.choosingPlayer % 2) + 1);
    bggame.board.update({ forPlayer : me.num, drawDoublingDice : true} );
  } else if (data.action == "reject") {
    console.log( "double rejected" );
    socket.emit('game end', { room: selectedRoom, winnerNum: me.num % 2 + 1, points: bggame.board.doublingDice.value });
  }
  bggame.board.doubleResponse( data.action, data.choosingPlayer );	
});   
 
socket.on('display message', function(data) {
  console.log("display message");
  bggame.board.drawer.drawMessage(data.message, { button: data.button, acceptText: data.buttonL, denyText: data.buttonR });
});
   
socket.on('update turns', function(data) {
  console.log("got update turns event");
  if ( bggame.gameHasRobotPlayer() && bggame.board.playerTurn() == 1 ) {
    bggame.board.updateTurn();  
    bggame.board.update({ forPlayer: me.num });
    console.log("rolling dice on robot's behalf...");
    socket.emit( 'dice request', { room: selectedRoom } );
    bggame.board.playerCanRoll = false;
  } else {
    var time = ( ( bggame.board.drawer.settings.animationTimeout  * 100 ) / 2 ) * data.numMoves;
    setTimeout( function() {
      console.log(time, data.numMoves);
      bggame.board.updateTurn();  
      bggame.board.update({ forPlayer: me.num });
    }, time);
  }
});
 
socket.on('leave room', function() {
  console.log("got leave room event");
  resetClient();
  socket.emit('join lobby');
});
 
socket.on('my id', function(data) {
  if (bggame.players[0].id == data.myid) {
    me.id = data.myid;
    me.num = 1;
  } else if (bggame.players[1].id == data.myid) {
    me.id = data.myid;
    me.num = 2;	 
  } else {
    console.log("my id -- error finding player id by socket: ", data.myid);
  }
  bggame.board.boardPlayerNum = me.num;
  console.log("my id", me.id, "- player number:", me.num);
  $("#iam-player").html(me.num);
});

$("#list_of_rooms").on("click", "div[id^='room-leave-']", function(e) {
  selectedRoom = -1;
  socket.emit('leave room');
}); 
 
$("#list_of_rooms").on("click", "div[id^='room-join-']", function(e) {
  selectedRoom = $(this).parent().attr('id').split('-')[1];
  socket.emit('join room', {room: selectedRoom});
});  

// for debugging only
$("div").on("click", "button[id='force-sub']", function(e) {
  var inp = $("#f-inp").val();
  if (inp != "00") {
    socket.emit('force dice', { room: selectedRoom, str: inp });
    $("#f-inp").val("00");
  }
}); 
 
$("#create_button").click(function() {
  roomID = Math.floor(Math.random()*999999999);
  socket.emit('new room', { room: roomID });
});
 
$("#play_robot").click(function() {
  roomID = Math.floor(Math.random()*999999999);
  socket.emit('play robot', { room: roomID });
});

function resetClient() {
  $('#game_area').html('');
  $('#lobby').show();
  selectedRoom = -1;
  me = {};
}
  
function getCursorPosition(e) {
  var x;
  var y;
  if (e.pageX != undefined && e.pageY != undefined) {
    x = e.pageX;
    y = e.pageY;
  } 
  else {
    x = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
    y = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
  }
  x -= bggame.board.drawer.canvasEls.canvas.offsetLeft;
  y -= bggame.board.drawer.canvasEls.canvas.offsetTop;
  x = Math.min(x, bggame.board.drawInfo.boardPixelWidth);
  y = Math.min(y, bggame.board.drawInfo.totalPixelHeight);
  
  // used for triangle and bar
  var checker = new Checker( Math.floor(y/bggame.board.drawInfo.pieceHeight), Math.floor(x/bggame.board.drawInfo.pieceWidth), 0);

  var doubling = bggame.board.doublingDice.isClicked(x, y);
  var leftButtonClicked = bggame.board.drawer.messageArea.isLeftButtonClicked(x, y);
  var rightButtonClicked = bggame.board.drawer.messageArea.isRightButtonClicked(x, y);
  var dice = bggame.board.dice.isClicked(x, y);
  var undoClick = bggame.board.drawer.infoMenu.isUBClicked(x, y);

  return { triangle: checker.findTriangleNum(bggame.board), 
           bar: checker.findBarNum(bggame.board), 
		       doublingDiceSend: doubling, 
		       regularDice: dice, 
		       messageAreaAccept: leftButtonClicked, 
		       messageAreaDeny: rightButtonClicked,
           undo: undoClick  }
}

function bgOnClick(e) {
  // all info on the user's click
  var info = getCursorPosition(e);
  
	// check to see if user made a decision on game over
	if ( bggame.board.isGameOver() ) {
	  if ( info.messageAreaAccept ) {
		  socket.emit('rejoin room', {room: selectedRoom, playerNum: me.num});
		  socket.emit('join room', {room: selectedRoom});
	  } else if ( info.messageAreaDeny ) {
		  socket.emit('exit game', {room: selectedRoom});
	  }
	}  
  
  if (me.num == bggame.board.playerTurn()) {	
    // check to see if user doubled
    if (info.doublingDiceSend && bggame.board.canDouble) {
        socket.emit( 'double sent', { room: selectedRoom, requestingPlayer: me.num } );
    }
  
    // check to see if uesr clicked on dice area
    if (info.regularDice && !bggame.board.waitingForNextTurn) {
      if (bggame.board.playerCanConfirm) {
        console.log("confirming move...");
        socket.emit('moved', { room: selectedRoom, moves:bggame.board.turns.currentTurn});
        bggame.board.playerCanConfirm = false;
		    bggame.board.waitingForNextTurn = true;
		    if ( bggame.board.gameOverValue != -1 ) {
          var pointsWon = bggame.board.gameOverValue * bggame.board.doublingDice.value;
          socket.emit('game end', { room: selectedRoom, winnerNum: me.num, points: pointsWon });
		    } 
      } else if (bggame.board.playerCanRoll) {
        console.log("rolling dice...");
        socket.emit( 'dice request', { room: selectedRoom } );
        bggame.board.playerCanRoll = false;
      }
    }
  } else {
	  if ( bggame.board.doubleRequested ) {
	    if ( info.messageAreaAccept ) {
		    socket.emit( 'double chosen', { room: selectedRoom, choosingPlayer: me.num, action: "accept" } );
	    } else if ( info.messageAreaDeny ) {
		    socket.emit( 'double chosen', { room: selectedRoom, choosingPlayer: me.num, action: "reject" } );
	    }
	  }
  }

  if (me.num == bggame.board.playerTurn() && bggame.board.dice.isRolled) {
    var meBar = bggame.board.getBarByNum(me.num);
    var triangle = bggame.board.getTriangleByNum(info.triangle); 
    var moveset;
	  var from;
	  var to;
	
    if (info.undo && bggame.board.playerCanUndo) {
      bggame.board.undoMove(true);
      bggame.board.update({forPlayer : me.num});	
	  }
  
    if (meBar.isEmpty()) {
      if (bggame.board.getSelectedTriangle().num == -1 && triangle.isEmpty()) {
        console.log("Triangle " + triangle.num + " which is empty was selected"); 
      } else {
        if (bggame.board.getSelectedTriangle().num == -1 && triangle.player == me.num) {
          bggame.board.selectedTriangleNum = triangle.num;
        } else if (bggame.board.getSelectedTriangle().num != -1 && triangle.num != -1) {
          from = bggame.board.getSelectedTriangle();
		      to = triangle;
        } else if (bggame.board.getSelectedTriangle().num != -1) {
		      from = bggame.board.getSelectedTriangle();
		      to = bggame.board.getBearOffByPlayerNum(me.num);
        }
      }
    } else {
      if (bggame.board.getSelectedBar().num == -1) {
        bggame.board.selectedBarNum = me.num;
      } else if (bggame.board.getSelectedBar().num != -1 && triangle.num >= 1) {
	 	    from = bggame.board.getSelectedBar(); 
		    to = triangle;
      }
    }
    
	  if (from && to) {
      moveset = bggame.players[me.num-1].move(from, to, bggame.board);
      bggame.board.move(moveset, true);
    }
    bggame.board.update({ forPlayer : me.num });		  
  } 
}

function newGame() {
  bggame.board.update({ forPlayer : me.num });
}

function initGame(canvasElement, nakedCanvasElement, data) { 
  if (!canvasElement) {
    canvasElement = document.createElement("canvas");
    canvasElement.id = "bg_canvas";
    
	  $('#game_area').html('');
    $("#game_area").append("<div id='game_area_input'></div>");
    $("#game_area_input").append( '<input type="text" id="f-inp" value="00" size="2"/><div id="force-dice"><button id="force-sub">force roll</button></div>');//for debugging only                  
    $("#game_area").append(canvasElement);
    
  }
  
  if (!nakedCanvasElement) {
    nakedCanvasElement = document.createElement("canvas");
    nakedCanvasElement.id = "bg_naked";
    //nakedCanvasElement.style.visibility = "visible";
	  nakedCanvasElement.style.visibility = "hidden";
    $("#game_area").append(nakedCanvasElement);
  }
    
  bggame = new Game(data);
}