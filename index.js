var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var users = [];
// app.get('/', function(req, res){
//   res.sendFile(__dirname + '/index.html');
// });

http.listen(1969, function() {
  console.log('listening on *:1969');
});

io.on('connection', function(socket) {
  socket.on('disconnect', function() {
    console.log('User  ' + users[users.findIndex(p => p.id == socket.id)].name + '  disconnected');
    io.emit('user-left', users[users.findIndex(p => p.id == socket.id)].name);
    users.splice(users.findIndex(p => p.id == socket.id), 1);
    io.emit('new-user', users);
  });

  socket.on('chat-message', function(msg) {
    // console.log(msg);
    // io.emit('new-message', {
    //   message: msg,
    //   user: users[users.findIndex(p => p.id == socket.id)].name
    // });
    socket.broadcast.to(users[users.findIndex(p => p.id == socket.id)].room).emit('new-message', {
      message: msg,
      user: users[users.findIndex(p => p.id == socket.id)].name
    });
  });

  socket.on('join', function(data) {
    users.push({
      id: socket.id,
      name: data.user,
      room: 'First Group'
    });
    socket.join('First Group');
    // socket.join(data.user);
    io.emit('new-user', users);
    console.log('User ' + data.user + ' connected with id ' + socket.id);
  });

  socket.on('group-change', function(group) {
    socket.leave(users[users.findIndex(p => p.id == socket.id)].room);
    socket.join(group);
    users[users.findIndex(p => p.id == socket.id)].room = group;
    for (var i = 0; i < users.length; i++) {
      console.log('User: ' + users[i].name + '  Id: ' + users[i].id + '   Room: ' + users[i].room);
    }
  });

});
