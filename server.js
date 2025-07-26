const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const port = process.env.PORT || 3000;
app.use(express.static('public'));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Ensure uploads directory exists
if (!fs.existsSync('uploads')) fs.mkdirSync('uploads');

// Multer setup for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

// API for file upload
app.post('/upload', upload.single('file'), (req, res) => {
  res.json({ url: '/uploads/' + req.file.filename });
});

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join_room', (room) => {
    socket.join(room);
    console.log(`User ${socket.id} joined room ${room}`);
  });

  socket.on('chat_message', ({ room, message, type }) => {
    socket.to(room).emit('chat_message', { message, type });
    socket.emit('message_status', { status: 'delivered', message });
  });

  socket.on('typing', (data) => {
    socket.to(data.room).emit('typing', data);
  });

  socket.on('signal', (data) => {
    socket.to(data.room).emit('signal', data);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

http.listen(port, () => console.log(`Server listening on port ${port}`));
