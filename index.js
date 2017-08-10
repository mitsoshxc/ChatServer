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
  socket.on('disconnect', function(){
    users.splice(users.indexOf(socket.id), 1);
    io.emit('new-user', users);
    console.log('User with id: ' + socket.id + ' disconnected');
  });
  socket.on('chat message', function(msg){
    io.emit('chat message', msg);
  });
  socket.on('join', function(data){
    users.push({
                id: socket.id,
                name: data.user
              });
    socket.join('global');
    socket.join(data.user);
    io.emit('new-user', users);
    console.log('User ' + data.user + ' connected with id ' + socket.id);
  });
});
