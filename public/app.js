const socket = io();
let currentRoom = null;
let messageBuffer = {};
let isTyping = false;
let typingTimeout;

const chatListScreen = document.getElementById('chat-list-screen');
const chatScreen = document.getElementById('chat-screen');
const chatList = document.getElementById('chat-list');
const chatRoomName = document.getElementById('chat-room-name');
const messages = document.getElementById('messages');
const messageInput = document.getElementById('message-input');
const sendBtn = document.getElementById('send-btn');
const backBtn = document.getElementById('back-btn');
const addChatBtn = document.getElementById('add-chat-btn');
const typingIndicator = document.getElementById('typing-indicator');
const toggleThemeBtn = document.getElementById('toggle-theme-btn');
const fileBtn = document.getElementById('file-btn');
const fileInput = document.getElementById('file-input');

// Theme toggle
toggleThemeBtn.addEventListener('click', () => {
  document.body.classList.toggle('light');
});

// Load previous chats
if(localStorage.getItem('chatRooms')) {
  messageBuffer = JSON.parse(localStorage.getItem('chatRooms'));
  Object.keys(messageBuffer).forEach(r => addChatToList(r));
}

// Add new chat
addChatBtn.addEventListener('click', () => {
  const room = prompt('Enter Host ID:');
  if (room && !messageBuffer[room]) {
    messageBuffer[room] = [];
    saveMessages();
    addChatToList(room);
  }
});

// Emoji picker
const picker = new EmojiButton();
document.getElementById('emoji-btn').addEventListener('click', () => picker.togglePicker(messageInput));
picker.on('emoji', emoji => {
  messageInput.value += emoji;
});

// Open chat
function addChatToList(room) {
  const div = document.createElement('div');
  div.className = 'chat-item';
  div.textContent = room;
  div.addEventListener('click', () => openChat(room));
  chatList.appendChild(div);
}
function openChat(room) {
  currentRoom = room;
  chatRoomName.textContent = room;
  messages.innerHTML = '';
  (messageBuffer[room] || []).forEach(msg => addMessage(msg.text, msg.self, msg.time, msg.type, msg.status));
  chatListScreen.classList.add('hidden');
  chatScreen.classList.remove('hidden');
  socket.emit('join_room', room);
}
backBtn.addEventListener('click', () => {
  chatScreen.classList.add('hidden');
  chatListScreen.classList.remove('hidden');
});

// Send text message
sendBtn.addEventListener('click', sendMessage);
messageInput.addEventListener('keydown', e => {
  if (e.key === 'Enter') sendMessage();
  else startTyping();
});
function sendMessage() {
  const text = messageInput.value.trim();
  if (!text) return;
  const time = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
  addMessage(text, true, time, 'text', 'sent');
  socket.emit('chat_message', { room: currentRoom, message: text, type: 'text' });
  messageInput.value = '';
  saveMessages();
}
function addMessage(text, self = false, time = '', type='text', status='sent') {
  const div = document.createElement('div');
  div.className = `message ${self ? 'self' : 'other'}`;
  if (type === 'text') div.innerHTML = `${text} <time>${time}</time>`;
  if (type === 'image') div.innerHTML = `<img src="${text}"><time>${time}</time>`;
  if (type === 'video') div.innerHTML = `<video controls src="${text}"></video><time>${time}</time>`;
  if (self) {
    const span = document.createElement('span');
    span.className = 'message-status';
    span.textContent = status === 'sent' ? '✓' : '✓✓';
    div.appendChild(span);
  }
  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;
  if (currentRoom) {
    messageBuffer[currentRoom].push({ text, self, time, type, status });
    saveMessages();
  }
}
function saveMessages() {
  localStorage.setItem('chatRooms', JSON.stringify(messageBuffer));
}

// File upload
fileBtn.addEventListener('click', () => fileInput.click());
fileInput.addEventListener('change', async () => {
  const file = fileInput.files[0];
  if (!file) return;
  const formData = new FormData();
  formData.append('file', file);
  const res = await fetch('/upload', { method: 'POST', body: formData });
  const data = await res.json();
  const url = data.url;
  const type = file.type.startsWith('video') ? 'video' : 'image';
  const time = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
  addMessage(url, true, time, type, 'sent');
  socket.emit('chat_message', { room: currentRoom, message: url, type });
  saveMessages();
});

// Typing indicator
function startTyping() {
  if (!isTyping) {
    socket.emit('typing', { room: currentRoom, typing: true });
    isTyping = true;
    typingTimeout = setTimeout(stopTyping, 2000);
  } else {
    clearTimeout(typingTimeout);
    typingTimeout = setTimeout(stopTyping, 2000);
  }
}
function stopTyping() {
  isTyping = false;
  socket.emit('typing', { room: currentRoom, typing: false });
}
socket.on('typing', data => {
  if (data.room === currentRoom) typingIndicator.textContent = data.typing ? 'Typing...' : '';
});

// Receive message
socket.on('chat_message', data => {
  const time = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
  addMessage(data.message, false, time, data.type);
});
socket.on('message_status', data => {
  const lastMsg = messageBuffer[currentRoom]?.slice(-1)[0];
  if (lastMsg) {
    lastMsg.status = 'delivered';
    saveMessages();
  }
});
