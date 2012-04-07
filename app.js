var express = require('express');

var mrng = require('./public/rng');

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
  this.rng = new mrng.RNG();
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
        // send initial load information/request 
        io.sockets.in(rooms[idx].roomId).emit('load game', {room: rooms[idx].roomId, 
                                                            player1: rooms[idx].playerSockets[0].id, 
                                                            player2: rooms[idx].playerSockets[1].id});

        // send each individual player their unique id
        rooms[idx].playerSockets[0].emit('my id', {myid: rooms[idx].playerSockets[0].id});
        rooms[idx].playerSockets[1].emit('my id', {myid: rooms[idx].playerSockets[1].id});	 
                                                            
        // send initial dice roll
        io.sockets.in(rooms[idx].roomId).emit('dice', {die1: rooms[idx].rng.getADie(),
                                                       die2: rooms[idx].rng.getADie()});
      }
    } 
  });
  
  socket.on("moved", function(data) {
    var idx = get_room_index(data.room);
    
    // pass the turn data to other player in the room
    if (idx != -1) {
      socket.broadcast.to(rooms[idx].roomId).emit("update", data);
    }
    
    // tell players to update turn history
    io.sockets.in(rooms[idx].roomId).emit("update turns");
    
    // send new dice roll
    io.sockets.in(rooms[idx].roomId).emit('dice', {die1: rooms[idx].rng.getADie(),
                                                   die2: rooms[idx].rng.getADie()});
  });
  
  // for debugging purposes only....
  socket.on("force dice", function(data) {
     io.sockets.in(data.room).emit('fdice', {die1: parseInt(data.str[0]),
                                             die2: parseInt(data.str[1])}); 
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
      }	  
    });
  });
  
  socket.on("join lobby", function() {
    // remove any other room channels 
    var idx = -1;
    socket.get('room', function (err, name) {
      idx = get_room_index(name);
    });
    if (idx != -1) {
      socket.leave(idx);
      socket.set('room', -1, function() {});
    }
    
    // join lobby channel
    socket.join('lobby');
  });
  
  socket.on("disconnect", function(){
    var idx = -1;
    socket.get('room', function (err, name) {
      idx = get_room_index(name);
    });
    if (idx != -1)  {
    
       // let other player in the room know that the room is gone
       io.sockets.in(idx).emit("force leave room");
    
       // remove room from the rooms list
       rooms.splice(idx, 1);
       
    }
    io.sockets.in('lobby').emit('room refresh',  get_room_names());
    console.log("user disconnected - room index:", idx);
  });  

});

function get_room_index(id) {
  var foundRoomIdx = -1;
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