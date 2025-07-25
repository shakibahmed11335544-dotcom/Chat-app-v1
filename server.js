const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

const port = process.env.PORT || 3000;

app.use(express.static('public'));

io.on('connection', (socket) => {
  console.log('a user connected:', socket.id);

  socket.on('join_room', (room) => {
    socket.join(room);
    console.log(`User ${socket.id} joined room ${room}`);
  });

  socket.on('signal', (data) => {
    // যিনি পাঠাচ্ছেন তাকে বাদ দিয়ে সবাইকে signal পাঠাও
    socket.to(data.room).emit('signal', {
      from: socket.id,
      signal: data.signal,
    });
  });

  socket.on('disconnect', () => {
    console.log('user disconnected:', socket.id);
  });
});

http.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
