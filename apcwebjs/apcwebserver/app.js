'use strict';
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var outlets = require('./routes/outlets');
var http = require('http');
var path = require('path');
var socketio = require('socket.io');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);
//app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, '../client')));

// development only
if ('development' === app.get('env')) {
  app.use(express.errorHandler());
}

//app.get('/', routes.index);
//app.get('/users', user.list);

// ### outlets routing
app.get('/outlets', outlets.list);
app.get('/outlets/:id', outlets.get);
app.patch('/outlets/:id', outlets.update);

var server = http.createServer(app);
var io = socketio.listen(server);
app.set('io', io);

server.listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

io.sockets.on('connection', function(socket) {
  // would emit a 'list' message and all the current state
  // would have an on('update') that would change state and emit changed state
  // would have a global poller that would look for changes and emit them
  socket.emit('news', {hello: 'world'});
  socket.on('my other event', function(data) {
    console.log(data);
  });
});
/*
http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
*/
