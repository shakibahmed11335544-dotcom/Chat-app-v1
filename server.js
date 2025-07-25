const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

app.use(express.static('public'));

io.on('connection', socket => {
  console.log('a user connected:', socket.id);

  socket.on('join_room', room => {
    socket.join(room);
    console.log(`User ${socket.id} joined room ${room}`);
  });

  socket.on('chat_message', ({ room, message }) => {
    socket.to(room).emit('chat_message', message);
  });

  socket.on('video_offer', ({ room, sdp }) => {
    socket.to(room).emit('video_offer', { sdp });
  });

  socket.on('video_answer', ({ room, sdp }) => {
    socket.to(room).emit('video_answer', { sdp });
  });

  socket.on('ice_candidate', ({ room, candidate }) => {
    socket.to(room).emit('ice_candidate', { candidate });
  });

  socket.on('disconnect', () => {
    console.log('user disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
