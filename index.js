var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var users = [];
// app.get('/', function(req, res){
//   res.sendFile(__dirname + '/index.html');
// });

http.listen(1969, function(){
  console.log('listening on *:1969');
});

io.on('connection', function(socket){
  // console.log('a user connected with id: ' + socket.id);
  socket.on('disconnect', function(){
    console.log('User  disconnected');
  });
  socket.on('chat message', function(msg){
    io.emit('chat message', msg);
  });
  socket.on('join', function(data){
    users.push(data.user);
    // user = {id: socket.id, name: data.user};
    socket.join('global');
    socket.join(data.user);
    io.emit('new-user', users);
    console.log('User ' + data.user + ' connected with id ' + socket.id);
    //console.log(io.sockets.adapter.rooms);
  });
});
