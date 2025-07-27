const socket = io();

// DOM elements
const roomList = document.getElementById('roomList');
const roomInput = document.getElementById('roomInput');
const joinBtn = document.getElementById('joinBtn');
const currentRoom = document.getElementById('currentRoom');
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

// State
let localStream = null;
let peerConnection = null;
let room = '';
let isAudioMuted = false;

// ICE + TURN
const configuration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'turn:numb.viagenie.ca', username: 'webrtc@live.com', credential: 'muazkh' }
  ]
};

// Load available room list
socket.on('room_list', rooms => {
  roomList.innerHTML = '';
  rooms.forEach(r => {
    const li = document.createElement('li');
    li.textContent = r;
    li.addEventListener('click', () => joinRoom(r));
    roomList.appendChild(li);
  });
});

// Join room
joinBtn.addEventListener('click', () => {
  const r = roomInput.value.trim();
  if (!r) return;
  joinRoom(r);
});

function joinRoom(r) {
  room = r;
  socket.emit('join_room', room);
  currentRoom.textContent = room;
  chatSection.classList.remove('hidden');
  messageInput.disabled = false;
  sendBtn.disabled = false;
  startAudioCallBtn.disabled = false;
  startVideoCallBtn.disabled = false;
}

// Send chat
sendBtn.addEventListener('click', sendMessage);
messageInput.addEventListener('keyup', e => { if (e.key === 'Enter') sendMessage(); });

function sendMessage() {
  const msg = messageInput.value.trim();
  if (!msg) return;
  socket.emit('chat_message', { room, message: msg });
  addMessage(msg, 'you');
  messageInput.value = '';
}

// Receive chat
socket.on('chat_message', msg => addMessage(msg, 'friend'));
socket.on('load_history', history => {
  chatMessages.innerHTML = '';
  history.forEach(m => addMessage(m.message, m.sender === socket.id ? 'you' : 'friend'));
});

function addMessage(msg, type) {
  const div = document.createElement('div');
  div.className = `msg ${type}`;
  div.textContent = msg;
  chatMessages.appendChild(div);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

// ==================== WebRTC Call ====================

startAudioCallBtn.addEventListener('click', () => startCall(false));
startVideoCallBtn.addEventListener('click', () => startCall(true));
endCallBtn.addEventListener('click', endCall);
muteCallBtn.addEventListener('click', toggleMute);

async function startCall(video = true) {
  try {
    localStream = await navigator.mediaDevices.getUserMedia({ audio: true, video });
    localVideo.srcObject = localStream;

    createPeer(true); // caller
    localStream.getTracks().forEach(track => peerConnection.addTrack(track, localStream));

    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);
    socket.emit('signal', { room, sdp: peerConnection.localDescription });
    uiCallStarted();
  } catch (err) { console.error(err); alert('Media error'); }
}

function createPeer(isCaller = false) {
  peerConnection = new RTCPeerConnection(configuration);
  peerConnection.ontrack = e => { remoteVideo.srcObject = e.streams[0]; };
  peerConnection.onicecandidate = e => e.candidate && socket.emit('signal', { room, candidate: e.candidate });

  // Caller renegotiation
  peerConnection.onnegotiationneeded = async () => {
    if (isCaller) {
      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);
      socket.emit('signal', { room, sdp: peerConnection.localDescription });
    }
  };
}

async function endCall() {
  if (peerConnection) { peerConnection.close(); peerConnection = null; }
  if (localStream) { localStream.getTracks().forEach(t => t.stop()); localStream = null; }
  uiCallEnded();
}

function toggleMute() {
  if (!localStream) return;
  isAudioMuted = !isAudioMuted;
  localStream.getAudioTracks()[0].enabled = !isAudioMuted;
  muteCallBtn.textContent = isAudioMuted ? '🔈 Unmute' : '🔇 Mute';
}

// Signaling
socket.on('signal', async data => {
  if (!peerConnection) {
    createPeer(false);
    if (localStream) localStream.getTracks().forEach(track => peerConnection.addTrack(track, localStream));
  }
  if (data.sdp) {
    await peerConnection.setRemoteDescription(new RTCSessionDescription(data.sdp));
    if (data.sdp.type === 'offer') {
      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);
      socket.emit('signal', { room, sdp: peerConnection.localDescription });
    }
  } else if (data.candidate) {
    try {
      await peerConnection.addIceCandidate(new RTCIceCandidate(data.candidate));
    } catch (e) { console.error("Error adding ICE candidate", e); }
  }
});

// ==================== UI Helpers ====================
function uiCallStarted() {
  videoSection.classList.remove('hidden');
  endCallBtn.classList.remove('hidden');
  muteCallBtn.classList.remove('hidden');
  startAudioCallBtn.disabled = true;
  startVideoCallBtn.disabled = true;
}
function uiCallEnded() {
  videoSection.classList.add('hidden');
  endCallBtn.classList.add('hidden');
  muteCallBtn.classList.add('hidden');
  startAudioCallBtn.disabled = false;
  startVideoCallBtn.disabled = false;
  localVideo.srcObject = null;
  remoteVideo.srcObject = null;
}

// Theme toggle
toggleThemeBtn.addEventListener('click', () => {
  document.body.classList.toggle('dark');
  toggleThemeBtn.textContent = document.body.classList.contains('dark') ? '☀️' : '🌙';
});
