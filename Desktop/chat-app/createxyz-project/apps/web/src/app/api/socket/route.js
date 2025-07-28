import { Server } from 'socket.io';

let io;

export async function GET(request) {
  if (!io) {
    // Initialize Socket.IO server
    const { server } = await import('http');
    io = new Server(server, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"]
      },
      transports: ['websocket', 'polling']
    });

    // Handle Socket.IO connections
    io.on('connection', (socket) => {
      console.log('User connected:', socket.id);

      // Join user to their personal room
      socket.on('join-user', (userId) => {
        socket.join(`user-${userId}`);
        console.log(`User ${userId} joined their room`);
      });

      // Join specific chat room
      socket.on('join-chat', (chatId) => {
        socket.join(`chat-${chatId}`);
        console.log(`User joined chat: ${chatId}`);
      });

      // Leave chat room
      socket.on('leave-chat', (chatId) => {
        socket.leave(`chat-${chatId}`);
        console.log(`User left chat: ${chatId}`);
      });

      // Handle new messages
      socket.on('send-message', async (messageData) => {
        try {
          // Save message to database
          const response = await fetch('http://localhost:3000/api/messages', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(messageData)
          });

          if (response.ok) {
            const newMessage = await response.json();
            
            // Broadcast to chat room
            socket.to(`chat-${messageData.chatId}`).emit('new-message', newMessage);
            
            // Emit back to sender for confirmation
            socket.emit('message-sent', newMessage);
          }
        } catch (error) {
          console.error('Error sending message:', error);
          socket.emit('message-error', { error: 'Failed to send message' });
        }
      });

      // Handle typing indicators
      socket.on('typing', (data) => {
        socket.to(`chat-${data.chatId}`).emit('user-typing', {
          userId: data.userId,
          userName: data.userName
        });
      });

      socket.on('stop-typing', (data) => {
        socket.to(`chat-${data.chatId}`).emit('user-stop-typing', {
          userId: data.userId
        });
      });

      // Handle WebRTC signaling for calls
      socket.on('call-user', (data) => {
        socket.to(`user-${data.to}`).emit('incoming-call', {
          from: data.from,
          fromName: data.fromName,
          roomId: data.roomId,
          isVideo: data.isVideo,
          signal: data.signal
        });
      });

      socket.on('accept-call', (data) => {
        socket.to(`user-${data.to}`).emit('call-accepted', {
          signal: data.signal,
          roomId: data.roomId
        });
      });

      socket.on('reject-call', (data) => {
        socket.to(`user-${data.to}`).emit('call-rejected', {
          from: data.from
        });
      });

      socket.on('end-call', (data) => {
        socket.to(`user-${data.to}`).emit('call-ended', {
          from: data.from
        });
      });

      // WebRTC peer connection signaling
      socket.on('webrtc-signal', (data) => {
        socket.to(`user-${data.to}`).emit('webrtc-signal', {
          from: data.from,
          signal: data.signal
        });
      });

      // Handle user status updates
      socket.on('update-status', (data) => {
        socket.broadcast.emit('user-status-changed', {
          userId: data.userId,
          status: data.status
        });
      });

      // Handle disconnection
      socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
      });
    });
  }

  return new Response('Socket.IO server initialized', { status: 200 });
}

export { io };