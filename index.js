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
    var spltres = msg.split(' ');

    if (spltres[0] == '\\w') {
      var messageToGo = spltres[2];
      for (var i = 3; i < spltres.length; i++) {
        messageToGo += ' ' + spltres[i];
      }
      socket.broadcast.to(users[users.findIndex(p => p.name == spltres[1].slice(0, -1))].id).emit('send-whisper', {
        user: users[users.findIndex(p => p.id == socket.id)].name,
        message: messageToGo
      });
    } else {
      socket.broadcast.to(users[users.findIndex(p => p.id == socket.id)].room).emit('new-message', {
        message: msg,
        user: users[users.findIndex(p => p.id == socket.id)].name
      });
    }
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
    socket.broadcast.to(users[users.findIndex(p => p.id == socket.id)].room).emit('user-left-group',
      users[users.findIndex(p => p.id == socket.id)].name
    );
    socket.join(group);
    users[users.findIndex(p => p.id == socket.id)].room = group;
    socket.broadcast.to(users[users.findIndex(p => p.id == socket.id)].room).emit('user-join-group',
      users[users.findIndex(p => p.id == socket.id)].name
    );
    io.emit('refresh-users', users);
    // for (var i = 0; i < users.length; i++) {
    //   console.log('User: ' + users[i].name + '  Id: ' + users[i].id + '   Room: ' + users[i].room);
    // }
  });

});
