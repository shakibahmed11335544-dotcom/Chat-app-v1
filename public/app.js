const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

const port = process.env.PORT || 3000;

app.use(express.static('public'));

// Online room message buffer রাখার জন্য
const rooms = {};

io.on('connection', (socket) => {
  console.log('a user connected:', socket.id);

  socket.on('join_room', (room) => {
    socket.join(room);
    console.log(`User ${socket.id} joined room ${room}`);

    // যদি ওই রুমে আগের মেসেজ থাকে তাহলে সেগুলো নতুন ইউজারকে পাঠাও
    if (rooms[room]) {
      socket.emit('old messages', rooms[room]);
    } else {
      rooms[room] = [];
    }
  });

  socket.on('chat message', (msg) => {
    // রুম জেনে নাও
    const roomsOfUser = Array.from(socket.rooms).filter(r => r !== socket.id);
    if (roomsOfUser.length > 0) {
      const room = roomsOfUser[0];
      // মেসেজ রুমে জমা রাখো
      rooms[room].push(msg);

      // সবাইকে মেসেজ পাঠাও ওই রুমে, কিন্তু মেসেজ পাঠানো ব্যাক্তিকে ছাড়া
      socket.to(room).emit('chat message', msg);
    }
  });

  socket.on('typing', (isTyping) => {
    const roomsOfUser = Array.from(socket.rooms).filter(r => r !== socket.id);
    if (roomsOfUser.length > 0) {
      const room = roomsOfUser[0];
      socket.to(room).emit('typing', isTyping);
    }
  });

  // WebRTC signaling

  socket.on('offer', (offer) => {
    const roomsOfUser = Array.from(socket.rooms).filter(r => r !== socket.id);
    if (roomsOfUser.length > 0) {
      const room = roomsOfUser[0];
      socket.to(room).emit('offer', offer);
    }
  });

  socket.on('answer', (answer) => {
    const roomsOfUser = Array.from(socket.rooms).filter(r => r !== socket.id);
    if (roomsOfUser.length > 0) {
      const room = roomsOfUser[0];
      socket.to(room).emit('answer', answer);
    }
  });

  socket.on('ice-candidate', (candidate) => {
    const roomsOfUser = Array.from(socket.rooms).filter(r => r !== socket.id);
    if (roomsOfUser.length > 0) {
      const room = roomsOfUser[0];
      socket.to(room).emit('ice-candidate', candidate);
    }
  });

  socket.on('disconnect', () => {
    console.log('user disconnected:', socket.id);
  });
});

http.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
