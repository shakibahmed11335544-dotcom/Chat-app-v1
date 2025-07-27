const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http, { cors: { origin: "*" } });

const port = process.env.PORT || 3000;

app.use(express.static('public'));

// Room-wise in-memory message history
let messages = {};

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join_room', (room) => {
    socket.join(room);
    console.log(`User ${socket.id} joined room ${room}`);
    if (messages[room]) {
      socket.emit('load_history', messages[room]);
    }
  });

  socket.on('chat_message', ({ room, message }) => {
    if (!messages[room]) messages[room] = [];
    messages[room].push({ sender: socket.id, message });
    socket.to(room).emit('chat_message', message);
  });

  socket.on('signal', (data) => {
    socket.to(data.room).emit('signal', data);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

http.listen(port, () => console.log(`Server running on port ${port}`));
