const socket = io();

const roomInput = document.getElementById('roomInput');
const joinBtn = document.getElementById('joinBtn');
const chatSection = document.getElementById('chatSection');
const chatMessages = document.getElementById('chatMessages');
const messageInput = document.getElementById('messageInput');
const sendBtn = document.getElementById('sendBtn');

const startAudioCallBtn = document.getElementById('startAudioCallBtn');
const startVideoCallBtn = document.getElementById('startVideoCallBtn');
const endCallBtn = document.getElementById('endCallBtn');
const muteCallBtn = document.getElementById('muteCallBtn');

const videoSection = document.getElementById('videoSection');
const localVideo = document.getElementById('localVideo');
const remoteVideo = document.getElementById('remoteVideo');

const toggleThemeBtn = document.getElementById('toggleThemeBtn');
const typingIndicator = document.createElement('p');
typingIndicator.id = 'typingIndicator';
chatMessages.parentNode.insertBefore(typingIndicator, chatMessages.nextSibling);

let localStream = null;
let peerConnection = null;
let room = '';
let isAudioMuted = false;
let isTyping = false;
let typingTimeout = null;

const configuration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    // প্রয়োজনে TURN সার্ভার যোগ করতে পারো
  ]
};

// ===== Auto detect system dark mode on page load =====
window.addEventListener('load', () => {
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  if (prefersDark) {
    document.body.classList.add('dark');
    toggleThemeBtn.textContent = '☀️'; // dark mode হলে সূর্যের আইকন দেখাবে
  } else {
    toggleThemeBtn.textContent = '🌙'; // light mode হলে চাঁদের আইকন দেখাবে
  }
});

// Join room event
joinBtn.addEventListener('click', () => {
  room = roomInput.value.trim();
  if (!room) {
    alert('Please enter a room ID');
    return;
  }
  socket.emit('join_room', room);

  joinBtn.disabled = true;
  roomInput.disabled = true;

  chatSection.classList.remove('hidden');
  messageInput.disabled = false;
  sendBtn.disabled = false;
  startAudioCallBtn.disabled = false;
  startVideoCallBtn.disabled = false;

  loadPreviousMessages();
});

// Send message handlers
sendBtn.addEventListener('click', sendMessage);
messageInput.addEventListener('keyup', (e) => {
  if (e.key === 'Enter') sendMessage();
});

messageInput.addEventListener('input', () => {
  if (!isTyping) {
    isTyping = true;
    socket.emit('typing', { room, typing: true });
    typingTimeout = setTimeout(stopTyping, 2000);
  } else {
    clearTimeout(typingTimeout);
    typingTimeout = setTimeout(stopTyping, 2000);
  }
});

function stopTyping() {
  isTyping = false;
  socket.emit('typing', { room, typing: false });
}

function sendMessage() {
  const msg = messageInput.value.trim();
  if (!msg) return;

  socket.emit('chat_message', { room, message: msg });
  addMessage(`You: ${msg}`, true);
  messageInput.value = '';
}

// Add message to UI and save to localStorage buffer
function addMessage(msg, self = false) {
  const p = document.createElement('p');
  p.textContent = msg;
  p.classList.toggle('self', self);
  chatMessages.appendChild(p);
  chatMessages.scrollTop = chatMessages.scrollHeight;
  saveMessageToBuffer(msg);
}

// ================== WebRTC Call Functions ==================

startAudioCallBtn.addEventListener('click', () => startCall(false));
startVideoCallBtn.addEventListener('click', () => startCall(true));
endCallBtn.addEventListener('click', endCall);
muteCallBtn.addEventListener('click', toggleMute);

async function startCall(video = true) {
  try {
    localStream = await navigator.mediaDevices.getUserMedia({ audio: true, video });
    localVideo.srcObject = localStream;

    peerConnection = new RTCPeerConnection(configuration);

    localStream.getTracks().forEach(track => peerConnection.addTrack(track, localStream));

    peerConnection.ontrack = (event) => {
      remoteVideo.srcObject = event.streams[0];
    };

    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit('signal', { room, candidate: event.candidate });
      }
    };

    peerConnection.onconnectionstatechange = () => {
      if (peerConnection.connectionState === 'connected') {
        console.log('Peers connected');
      }
      if (peerConnection.connectionState === 'disconnected' || peerConnection.connectionState === 'failed') {
        endCall();
      }
    };

    videoSection.classList.remove('hidden');
    endCallBtn.classList.remove('hidden');
    muteCallBtn.classList.remove('hidden');

    startAudioCallBtn.disabled = true;
    startVideoCallBtn.disabled = true;

    // Create and send offer
    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);
    socket.emit('signal', { room, sdp: peerConnection.localDescription });
  } catch (err) {
    alert('Error accessing media devices');
    console.error(err);
  }
}

async function endCall() {
  if (peerConnection) {
    peerConnection.close();
    peerConnection = null;
  }
  if (localStream) {
    localStream.getTracks().forEach(track => track.stop());
    localStream = null;
  }
  videoSection.classList.add('hidden');
  endCallBtn.classList.add('hidden');
  muteCallBtn.classList.add('hidden');

  startAudioCallBtn.disabled = false;
  startVideoCallBtn.disabled = false;

  remoteVideo.srcObject = null;
  localVideo.srcObject = null;
  isAudioMuted = false;
  muteCallBtn.textContent = '🔇 Mute';
}

function toggleMute() {
  if (!localStream) return;
  isAudioMuted = !isAudioMuted;
  localStream.getAudioTracks()[0].enabled = !isAudioMuted;
  muteCallBtn.textContent = isAudioMuted ? '🔈 Unmute' : '🔇 Mute';
}

// ================= Socket signaling handler ==================

socket.on('signal', async (data) => {
  if (!peerConnection) return;

  try {
    if (data.sdp) {
      await peerConnection.setRemoteDescription(new RTCSessionDescription(data.sdp));
      if (data.sdp.type === 'offer') {
        const answer = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(answer);
        socket.emit('signal', { room, sdp: peerConnection.localDescription });
      }
    } else if (data.candidate) {
      await peerConnection.addIceCandidate(new RTCIceCandidate(data.candidate));
    }
  } catch (err) {
    console.error('Error handling signal:', err);
  }
});

// =============== Typing indicator ==================

socket.on('typing', (data) => {
  if (data.room === room) {
    typingIndicator.textContent = data.typing ? 'Friend is typing...' : '';
  }
});

// =============== Chat message listener ==================

socket.on('chat_message', (msg) => {
  addMessage(`Friend: ${msg}`);
});

// =============== Offline message buffer ==================

let messageBuffer = [];

function loadPreviousMessages() {
  if (localStorage.getItem(room)) {
    messageBuffer = JSON.parse(localStorage.getItem(room));
    messageBuffer.forEach(msg => addMessage(msg));
  }
}

function saveMessageToBuffer(msg) {
  messageBuffer.push(msg);
  localStorage.setItem(room, JSON.stringify(messageBuffer));
}

// =============== Dark mode toggle ==================

toggleThemeBtn.addEventListener('click', () => {
  document.body.classList.toggle('dark');
  toggleThemeBtn.textContent = document.body.classList.contains('dark') ? '☀️' : '🌙';
});
