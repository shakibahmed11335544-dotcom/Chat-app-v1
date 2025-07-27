const socket = io();
let room = '';
let callStartTime = null;

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
const callModal = document.getElementById('callModal');
const dailyFrame = document.getElementById('dailyFrame');
const closeModalBtn = document.getElementById('closeModalBtn');

// তোমার রুম URL
const audioCallUrl = "https://chat-app1.daily.co/chatappv1";
const videoCallUrl = "https://chat-app1.daily.co/chatappv2";

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

// Call
startAudioCallBtn.addEventListener('click', () => startCall(audioCallUrl, "Audio"));
startVideoCallBtn.addEventListener('click', () => startCall(videoCallUrl, "Video"));
endCallBtn.addEventListener('click', endCall);
closeModalBtn.addEventListener('click', endCall);

function startCall(url, type) {
  dailyFrame.src = url;
  callModal.style.display = 'block';
  callStartTime = Date.now();
  addMessage(`📞 ${type} call started`, 'friend');
  endCallBtn.classList.remove('hidden');
}

function endCall() {
  callModal.style.display = 'none';
  dailyFrame.src = "";
  const duration = Math.floor((Date.now() - callStartTime) / 1000);
  addMessage(`📞 Call ended. Duration: ${duration}s`, 'friend');
  endCallBtn.classList.add('hidden');
}
