const socket = io();

// DOM
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
const newRoomBtn = document.getElementById('newRoomBtn');

// State
let room = '';
let peer = null;
let localStream = null;
let isAudioMuted = false;

// Room list
socket.on('room_list', rooms => {
  roomList.innerHTML = '';
  rooms.forEach(r => {
    const li = document.createElement('li');
    li.textContent = r;
    li.addEventListener('click', () => joinRoom(r));
    roomList.appendChild(li);
  });
});

// New room
newRoomBtn.addEventListener('click', () => {
  const newId = prompt("Enter new room ID:");
  if (newId) joinRoom(newId);
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

// Chat
sendBtn.addEventListener('click', sendMessage);
messageInput.addEventListener('keyup', e => { if (e.key === 'Enter') sendMessage(); });

function sendMessage() {
  const msg = messageInput.value.trim();
  if (!msg) return;
  socket.emit('chat_message', { room, message: msg });
  addMessage(msg, 'you');
  messageInput.value = '';
}

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

// ==================== Simple-Peer Call ====================
startAudioCallBtn.addEventListener('click', () => initCall(false));
startVideoCallBtn.addEventListener('click', () => initCall(true));
endCallBtn.addEventListener('click', endCall);
muteCallBtn.addEventListener('click', toggleMute);

async function initCall(video = true) {
  try {
    localStream = await navigator.mediaDevices.getUserMedia({ audio: true, video });
    localVideo.srcObject = localStream;

    peer = new SimplePeer({
      initiator: true,
      trickle: false,
      stream: localStream,
      config: {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'turn:numb.viagenie.ca', username: 'webrtc@live.com', credential: 'muazkh' }
        ]
      }
    });

    peer.on('signal', data => socket.emit('signal', { room, signal: data }));
    peer.on('stream', stream => remoteVideo.srcObject = stream);
    peer.on('error', err => console.error('Peer error:', err));

    uiCallStarted();
  } catch (err) { console.error("Error in initCall:", err); alert('Media error'); }
}

socket.on('signal', data => {
  if (!peer) {
    peer = new SimplePeer({
      initiator: false,
      trickle: false,
      stream: localStream,
      config: {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'turn:numb.viagenie.ca', username: 'webrtc@live.com', credential: 'muazkh' }
        ]
      }
    });
    peer.on('signal', sig => socket.emit('signal', { room, signal: sig }));
    peer.on('stream', stream => remoteVideo.srcObject = stream);
    peer.on('error', err => console.error('Peer error:', err));
  }
  peer.signal(data.signal);
});

function endCall() {
  if (peer) { peer.destroy(); peer = null; }
  if (localStream) { localStream.getTracks().forEach(t => t.stop()); localStream = null; }
  uiCallEnded();
}

function toggleMute() {
  if (!localStream) return;
  isAudioMuted = !isAudioMuted;
  localStream.getAudioTracks()[0].enabled = !isAudioMuted;
  muteCallBtn.textContent = isAudioMuted ? '🔈 Unmute' : '🔇 Mute';
}

// UI
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

toggleThemeBtn.addEventListener('click', () => {
  document.body.classList.toggle('dark');
  toggleThemeBtn.textContent = document.body.classList.contains('dark') ? '☀️' : '🌙';
});
