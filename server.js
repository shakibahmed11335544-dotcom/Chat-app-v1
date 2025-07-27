const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http, { cors: { origin: "*" } });

const port = process.env.PORT || 3000;
app.use(express.static('public'));

let rooms = {};

io.on('connection', socket => {
  console.log('User connected:', socket.id);
  socket.emit('room_list', Object.keys(rooms));

  socket.on('join_room', room => {
    socket.join(room);
    if (!rooms[room]) rooms[room] = { messages: [] };
    socket.emit('load_history', rooms[room].messages);
    io.emit('room_list', Object.keys(rooms));
  });

  socket.on('chat_message', ({ room, message }) => {
    if (!rooms[room]) rooms[room] = { messages: [] };
    rooms[room].messages.push({ sender: socket.id, message });
    io.to(room).emit('chat_message', message);
  });

  socket.on('disconnect', () => console.log('User disconnected:', socket.id));
});

http.listen(port, () => console.log(`Server running on port ${port}`));
