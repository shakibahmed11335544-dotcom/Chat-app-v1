const APP_ID = "b7d80e7b093348f5a274438ce1c005cc"; // তোমার Agora App ID
const socket = io();

let client = null;
let localTrack = [];
let room = '';
let callStartTime = null;

// DOM refs
const roomList = document.getElementById('roomList');
const roomInput = document.getElementById('roomInput');
const joinBtn = document.getElementById('joinBtn');
const newRoomBtn = document.getElementById('newRoomBtn');
const currentRoom = document.getElementById('currentRoom');
const chatSection = document.getElementById('chatSection');
const chatMessages = document.getElementById('chatMessages');
const messageInput = document.getElementById('messageInput');
const sendBtn = document.getElementById('sendBtn');

const startAudioCallBtn = document.getElementById('startAudioCallBtn');
const startVideoCallBtn = document.getElementById('startVideoCallBtn');
const endCallBtn = document.getElementById('endCallBtn');

const videoSection = document.getElementById('videoSection');
const localVideo = document.getElementById('localVideo');
const remoteVideo = document.getElementById('remoteVideo');
const toggleThemeBtn = document.getElementById('toggleThemeBtn');

// Chat helpers
function addMessage(msg, type) {
  const div = document.createElement('div');
  div.className = `msg ${type}`;
  div.textContent = msg;
  chatMessages.appendChild(div);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

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

// Join room
joinBtn.addEventListener('click', () => {
  const r = roomInput.value.trim();
  if (r) joinRoom(r);
});
newRoomBtn.addEventListener('click', () => {
  const r = prompt("Enter new room ID:");
  if (r) joinRoom(r);
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
socket.on('chat_message', msg => addMessage(msg, 'friend'));
socket.on('load_history', history => {
  chatMessages.innerHTML = '';
  history.forEach(m => addMessage(m.message, m.sender === socket.id ? 'you' : 'friend'));
});

// ==================== Agora Video Call ====================
async function joinChannel(video = true) {
  client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
  await client.join(APP_ID, room, null, null);
  callStartTime = Date.now();
  addMessage(`📞 Call started (${video ? "Video" : "Audio"})`, 'friend');

  if (video) {
    localTrack = await AgoraRTC.createMicrophoneAndCameraTracks();
    localTrack[1].play(localVideo);
    await client.publish(localTrack);
  } else {
    localTrack = [await AgoraRTC.createMicrophoneAudioTrack()];
    await client.publish(localTrack);
  }

  client.on("user-published", async (user, mediaType) => {
    await client.subscribe(user, mediaType);
    if (mediaType === "video") {
      user.videoTrack.play(remoteVideo);
    } else if (mediaType === "audio") {
      user.audioTrack.play();
    }
  });

  uiCallStarted();
}

async function leaveChannel() {
  if (localTrack.length) {
    localTrack.forEach(track => track.close());
  }
  await client.leave();
  const duration = Math.floor((Date.now() - callStartTime) / 1000);
  addMessage(`📞 Call ended. Duration: ${duration}s`, 'friend');
  uiCallEnded();
}

// UI control
function uiCallStarted() {
  videoSection.classList.remove('hidden');
  endCallBtn.classList.remove('hidden');
  startAudioCallBtn.disabled = true;
  startVideoCallBtn.disabled = true;
}
function uiCallEnded() {
  videoSection.classList.add('hidden');
  endCallBtn.classList.add('hidden');
  startAudioCallBtn.disabled = false;
  startVideoCallBtn.disabled = false;
}

startVideoCallBtn.addEventListener('click', () => joinChannel(true));
startAudioCallBtn.addEventListener('click', () => joinChannel(false));
endCallBtn.addEventListener('click', leaveChannel);

// Theme toggle
toggleThemeBtn.addEventListener('click', () => {
  document.body.classList.toggle('dark');
  toggleThemeBtn.textContent = document.body.classList.contains('dark') ? '☀️' : '🌙';
});
