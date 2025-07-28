// WebSocket server for real-time messaging and calling
const connections = new Map(); // Store active connections
const userRooms = new Map(); // Track which rooms users are in

export async function GET(request) {
  // WebSocket upgrade handling
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  
  if (request.headers.get('upgrade') !== 'websocket') {
    return new Response('Expected websocket', { status: 426 });
  }

  // This would normally handle WebSocket upgrade
  // For now, return connection info
  return Response.json({ 
    message: 'WebSocket endpoint ready',
    userId: userId 
  });
}

export async function POST(request) {
  try {
    const { type, data } = await request.json();
    
    switch (type) {
      case 'join-chat':
        handleJoinChat(data);
        break;
      case 'send-message':
        await handleSendMessage(data);
        break;
      case 'start-call':
        handleStartCall(data);
        break;
      case 'webrtc-signal':
        handleWebRTCSignal(data);
        break;
      default:
        return Response.json({ error: 'Unknown message type' }, { status: 400 });
    }
    
    return Response.json({ success: true });
  } catch (error) {
    console.error('WebSocket handler error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

function handleJoinChat(data) {
  const { userId, chatId } = data;
  
  if (!userRooms.has(userId)) {
    userRooms.set(userId, new Set());
  }
  
  userRooms.get(userId).add(chatId);
  console.log(`User ${userId} joined chat ${chatId}`);
}

async function handleSendMessage(data) {
  try {
    // Save message to database first
    const response = await fetch('http://localhost:3000/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    if (response.ok) {
      const newMessage = await response.json();
      
      // Broadcast to chat participants (would use WebSocket in real implementation)
      console.log('Broadcasting message:', newMessage);
      return newMessage;
    }
  } catch (error) {
    console.error('Error handling message:', error);
    throw error;
  }
}

function handleStartCall(data) {
  const { from, to, isVideo, roomId } = data;
  
  // In a real implementation, this would send to the target user's WebSocket
  console.log(`Call from ${from} to ${to}, video: ${isVideo}, room: ${roomId}`);
}

function handleWebRTCSignal(data) {
  const { from, to, signal } = data;
  
  // Relay WebRTC signaling data between peers
  console.log(`WebRTC signal from ${from} to ${to}`);
}