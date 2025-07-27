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
const menuBtn = document.getElementById('menuBtn');
const menuDropdown = document.getElementById('menuDropdown');
const hostBtn = document.getElementById('hostBtn');
const joinRoomBtn = document.getElementById('joinRoomBtn');

let localStream = null;
let peerConnection = null;
let room = '';
let isAudioMuted = false;

const configuration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'turn:relay1.expressturn.com:3478', username: 'efree', credential: 'efree' }
  ]
};

// Dropdown
menuBtn.addEventListener('click', () => menuDropdown.classList.toggle('hidden'));
hostBtn.addEventListener('click', () => { alert('Room hosted! Share ID with others.'); menuDropdown.classList.add('hidden'); });
joinRoomBtn.addEventListener('click', () => { document.getElementById('joinSection').scrollIntoView(); menuDropdown.classList.add('hidden'); });

joinBtn.addEventListener('click', () => {
  room = roomInput.value.trim();
  if (!room) { alert('Please enter a room ID'); return; }
  socket.emit('join_room', room);
  joinBtn.disabled = true;
  roomInput.disabled = true;
  chatSection.classList.remove('hidden');
  messageInput.disabled = false;
  sendBtn.disabled = false;
  startAudioCallBtn.disabled = false;
  startVideoCallBtn.disabled = false;
});

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
function addMessage(msg, type) {
  const div = document.createElement('div');
  div.className = `msg ${type}`;
  div.textContent = msg;
  chatMessages.appendChild(div);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

// WebRTC
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
    peerConnection.ontrack = e => remoteVideo.srcObject = e.streams[0];
    peerConnection.onicecandidate = e => e.candidate && socket.emit('signal', { room, candidate: e.candidate });

    videoSection.classList.remove('hidden');
    endCallBtn.classList.remove('hidden');
    muteCallBtn.classList.remove('hidden');
    startAudioCallBtn.disabled = true;
    startVideoCallBtn.disabled = true;

    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);
    socket.emit('signal', { room, sdp: peerConnection.localDescription });
  } catch (err) { console.error(err); alert('Media error'); }
}

async function endCall() {
  if (peerConnection) { peerConnection.close(); peerConnection = null; }
  if (localStream) { localStream.getTracks().forEach(t => t.stop()); localStream = null; }
  videoSection.classList.add('hidden');
  endCallBtn.classList.add('hidden');
  muteCallBtn.classList.add('hidden');
  startAudioCallBtn.disabled = false;
  startVideoCallBtn.disabled = false;
  localVideo.srcObject = null;
  remoteVideo.srcObject = null;
}

function toggleMute() {
  if (!localStream) return;
  isAudioMuted = !isAudioMuted;
  localStream.getAudioTracks()[0].enabled = !isAudioMuted;
  muteCallBtn.textContent = isAudioMuted ? '🔈 Unmute' : '🔇 Mute';
}

socket.on('signal', async data => {
  if (!peerConnection) {
    peerConnection = new RTCPeerConnection(configuration);
    localStream?.getTracks().forEach(track => peerConnection.addTrack(track, localStream));
    peerConnection.ontrack = e => remoteVideo.srcObject = e.streams[0];
    peerConnection.onicecandidate = e => e.candidate && socket.emit('signal', { room, candidate: e.candidate });
  }
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
});

// Theme
toggleThemeBtn.addEventListener('click', () => {
  document.body.classList.toggle('dark');
  toggleThemeBtn.textContent = document.body.classList.contains('dark') ? '☀️' : '🌙';
});
