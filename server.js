const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const path = require('path');

const messages = []; // offline buffer

app.use(express.static('public'));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

io.on('connection', socket => {
  console.log('User connected:', socket.id);

  // send past messages to newly joined user
  socket.emit('pastMessages', messages);

  socket.on('chat message', msg => {
    const message = {
      id: socket.id,
      text: msg,
      time: new Date().toLocaleTimeString()
    };
    messages.push(message);
    io.emit('chat message', message);
  });

  socket.on('typing', isTyping => {
    socket.broadcast.emit('typing', { id: socket.id, isTyping });
  });

  socket.on('seen', () => {
    socket.broadcast.emit('seen');
  });

  socket.on('lastSeen', time => {
    socket.broadcast.emit('lastSeen', time);
  });

  // WebRTC signaling
  socket.on('offer', (data) => {
    socket.broadcast.emit('offer', data);
  });

  socket.on('answer', (data) => {
    socket.broadcast.emit('answer', data);
  });

  socket.on('ice-candidate', (data) => {
    socket.broadcast.emit('ice-candidate', data);
  });

  socket.on('call-ended', () => {
    socket.broadcast.emit('call-ended');
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

http.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
