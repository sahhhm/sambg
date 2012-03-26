var express =require('express');
var app = express.createServer();

app.configure(function(){
  app.use(express.static(__dirname + '/public'));
});

var io = require('socket.io').listen(app);
var rooms = [];

function room(roomId){
  //this.roomSocket = roomSocket;
  this.roomId = roomId;
  this.playerSockets = [];
};

app.listen(8080);

io.sockets.on('connection', function (socket) {
  
  socket.join("lobby");
  socket.set('room', -1, function(){});
  socket.emit('room refresh',  get_room_names());
  
  socket.on("new room", function(data){
    // create new room by Id
    console.log("new room: " + data.room);
    rooms.push(new room(data.room));
	
	// find room id
	var foundRoomIdx = null;
	for (var i = 0; i < rooms.length; i++) {
	  if (rooms[i].roomId == data.room) {
	    foundRoomIdx = i;
	  }
	}	

	// join the room channel
	socket.join(rooms[foundRoomIdx].roomId);	
	socket.set('room', rooms[foundRoomIdx].roomId, function(){ 
	  socket.emit('room chosen', {room: rooms[foundRoomIdx].roomId }); 
	});	
	
	// add socket to list of room sockets
	rooms[foundRoomIdx].playerSockets.push(socket);
	
	// let everyone else know a room was created
	io.sockets.in('lobby').emit('room refresh',  get_room_names());
	
  });
  
  socket.on("join room", function(data) {
    console.log("join room: " + data.room);
	
	var idx = get_room_index(data.room);
	if (idx != -1) {
	  rooms[idx].playerSockets.push(socket);
	  socket.join(data.room);
	  socket.set('room', rooms[idx].roomId, function(){ 
	    socket.emit('room chosen', {room: rooms[idx].roomId }); 
	  });	
	  
	  // let everyone else know a room was created
	  io.sockets.in('lobby').emit('room refresh',  get_room_names());
	  
	  // load game!
	  if (rooms[idx].playerSockets.length == 2) {
	    io.sockets.in(rooms[idx].roomId).emit('load game');
	  }
	} 
  });
  
  socket.on("leave room", function(n, fn) {

	socket.get('room', function (err, name) {
	  console.log("leaving room: " + name);
	  
	  idx = get_room_index(name);
	  
	  if (idx != -1) {
	    // leave room
	    socket.leave(rooms[idx].roomId);
	    rooms.splice(idx, 1); 
        socket.set('room', -1, function() {});
		
	    // let everyone else know a room was left
	    io.sockets.in('lobby').emit('room refresh', get_room_names());	
		
		fn("success");
	  }	  
    });
  });
  
  //When a user disconnects
  socket.on("disconnect", function(){
    var idx = -1;
    socket.get('room', function (err, name) {
	  idx = get_room_index(name);
    });
	if (idx > -1) rooms.splice(idx, 1);
	io.sockets.in('lobby').emit('room refresh',  get_room_names());
    console.log("user disconnected - room index:", idx);
  });  

});

function get_room_index(id) {
  var foundRoomIdx = null;
  for (var i = 0; i < rooms.length; i++) {
    if (rooms[i].roomId == id) {
      foundRoomIdx = i;
    }
  }
  return foundRoomIdx;	
}

function get_room_names() {
  names = [];
  for (var i = 0; i < rooms.length; i++) {
     names.push(rooms[i].roomId);
  }
  return names;
}