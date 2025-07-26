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

// Ensure uploads folder exists
if (!fs.existsSync('uploads')) fs.mkdirSync('uploads');

// Multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

// Upload endpoint
app.post('/upload', upload.single('file'), (req, res) => {
  res.json({ url: '/uploads/' + req.file.filename });
});

// Socket.IO
io.on('connection', (socket) => {
  socket.on('join_room', (room) => socket.join(room));

  socket.on('chat_message', ({ room, message, type }) => {
    socket.to(room).emit('chat_message', { message, type });
    socket.emit('message_status', { status: 'delivered', message });
  });

  // WebRTC signaling
  socket.on('signal', (data) => socket.to(data.room).emit('signal', data));

  socket.on('typing', (data) => socket.to(data.room).emit('typing', data));
});

http.listen(port, () => console.log(`Server running at http://localhost:${port}`));
