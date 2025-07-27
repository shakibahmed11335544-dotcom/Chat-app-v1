const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http, { cors: { origin: "*" } });

const port = process.env.PORT || 3000;

app.use(express.static('public'));

let rooms = {}; // {roomId: {messages: [], users: []}}

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Send available rooms
  socket.emit('room_list', Object.keys(rooms));

  socket.on('join_room', (room) => {
    socket.join(room);
    if (!rooms[room]) rooms[room] = { messages: [], users: [] };
    if (!rooms[room].users.includes(socket.id)) rooms[room].users.push(socket.id);
    socket.emit('load_history', rooms[room].messages);
    io.emit('room_list', Object.keys(rooms)); // update everyone
    console.log(`User ${socket.id} joined room ${room}`);
  });

  socket.on('chat_message', ({ room, message }) => {
    if (!rooms[room]) rooms[room] = { messages: [], users: [] };
    rooms[room].messages.push({ sender: socket.id, message });
    socket.to(room).emit('chat_message', message);
  });

  socket.on('signal', (data) => {
    socket.to(data.room).emit('signal', data);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    for (const room in rooms) {
      rooms[room].users = rooms[room].users.filter(u => u !== socket.id);
      if (rooms[room].users.length === 0) delete rooms[room];
    }
    io.emit('room_list', Object.keys(rooms));
  });
});

http.listen(port, () => console.log(`Server running on port ${port}`));
