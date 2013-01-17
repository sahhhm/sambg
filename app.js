var express = require('express')
  , routes = require('./routes');

var app = express()
  , http = require('http')
  , server = http.createServer(app)
  , io = require('./public/javascript/sockets').listen(server);

  
app.configure(function(){
  app.set('views', './views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.routes);
  app.use(express.static(__dirname + '/public'));
  app.use(express.static(__dirname + '/public/images'));
});

app.get('/', routes.index);

var port = process.env.PORT || 8080;
server.listen(port, function() {
  console.log("Listening on " + port);
});
