const socket = io();

let room = '';
let localStream = null;
let remoteStream = null;
let peerConnection = null;
let isAudioOnly = false;

const configuration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
  ],
};

const userIdDisplay = document.getElementById('userIdDisplay');
const roomInput = document.getElementById('roomInput');
const joinBtn = document.getElementById('joinBtn');
const chatWindow = document.getElementById('chatWindow');
const messageInput = document.getElementById('messageInput');
const sendBtn = document.getElementById('sendBtn');
const startAudioCallBtn = document.getElementById('startAudioCallBtn');
const startVideoCallBtn = document.getElementById('startVideoCallBtn');
const hangupBtn = document.getElementById('hangupBtn');

const localVideoContainer = document.getElementById('localVideoContainer');
const remoteVideoContainer = document.getElementById('remoteVideoContainer');
const localVideo = document.getElementById('localVideo');
const remoteVideo = document.getElementById('remoteVideo');

const chatSection = document.getElementById('chatSection');
const roomSelection = document.getElementById('roomSelection');

function logSystemMessage(message) {
  const p = document.createElement('p');
  p.className = 'system';
  p.textContent = message;
  chatWindow.appendChild(p);
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

function addChatMessage(message, isOwn = false) {
  const p = document.createElement('p');
  p.textContent = message;
  p.style.color = isOwn ? '#0af' : '#ccc';
  chatWindow.appendChild(p);
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

function initializePeerConnection() {
  peerConnection = new RTCPeerConnection(configuration);

  peerConnection.onicecandidate = event => {
    if (event.candidate) {
      socket.emit('signal', { room, candidate: event.candidate });
    }
  };

  peerConnection.ontrack = event => {
    if (!remoteStream) {
      remoteStream = new MediaStream();
      remoteVideo.srcObject = remoteStream;
      remoteVideoContainer.classList.remove('hidden');
    }
    remoteStream.addTrack(event.track);
  };

  peerConnection.onconnectionstatechange = () => {
    if (peerConnection.connectionState === 'disconnected' || peerConnection.connectionState === 'failed') {
      endCall();
      logSystemMessage('Call disconnected');
    }
  };
}

async function startLocalStream(audioOnly = false) {
  try {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }
    isAudioOnly = audioOnly;
    const constraints = audioOnly ? { audio: true, video: false } : { audio: true, video: true };
    localStream = await navigator.mediaDevices.getUserMedia(constraints);
    localVideo.srcObject = localStream;
    localVideoContainer.classList.remove('hidden');
  } catch (error) {
    alert('Error accessing media devices: ' + error.message);
  }
}

function resetUIAfterCall() {
  hangupBtn.classList.add('hidden');
  startAudioCallBtn.disabled = false;
  startVideoCallBtn.disabled = false;
  localVideoContainer.classList.add('hidden');
  remoteVideoContainer.classList.add('hidden');
  localVideo.srcObject = null;
  remoteVideo.srcObject = null;
  if (localStream) {
    localStream.getTracks().forEach(track => track.stop());
    localStream = null;
  }
  if (peerConnection) {
    peerConnection.close();
    peerConnection = null;
  }
}

function endCall() {
  resetUIAfterCall();
  logSystemMessage('Call ended');
  socket.emit('signal', { room, type: 'endCall' });
}

async function startCall(audioOnly = false) {
  await startLocalStream(audioOnly);
  initializePeerConnection();

  localStream.getTracks().forEach(track => {
    peerConnection.addTrack(track, localStream);
  });

  hangupBtn.classList.remove('hidden');
  startAudioCallBtn.disabled = true;
  startVideoCallBtn.disabled = true;

  if (audioOnly) {
    logSystemMessage('Starting audio call...');
  } else {
    logSystemMessage('Starting video call...');
  }

  if (audioOnly) {
    peerConnection.createOffer({ offerToReceiveVideo: false })
      .then(offer => peerConnection.setLocalDescription(offer))
      .then(() => {
        socket.emit('signal', { room, type: 'offer', sdp: peerConnection.localDescription });
      });
  } else {
    peerConnection.createOffer()
      .then(offer => peerConnection.setLocalDescription(offer))
      .then(() => {
        socket.emit('signal', { room, type: 'offer', sdp: peerConnection.localDescription });
      });
  }
}

joinBtn.onclick = () => {
  room = roomInput.value.trim();
  if (!room) {
    alert('Please enter a room ID');
    return;
  }
  socket.emit('join_room', room);
  roomSelection.classList.add('hidden');
  chatSection.classList.remove('hidden');
  logSystemMessage(`Joined room: ${room}`);
};

sendBtn.onclick = () => {
  const message = messageInput.value.trim();
  if (!message) return;
  addChatMessage(`You: ${message}`, true);
  socket.emit('chat_message', { room, message });
  messageInput.value = '';
};

socket.on('chat_message', (msg) => {
  addChatMessage(`Partner: ${msg}`, false);
});

socket.on('signal', async (data) => {
  if (!peerConnection && data.type === 'offer') {
    await startLocalStream(data.video === undefined ? false : !data.audioOnly);
    initializePeerConnection();

    localStream.getTracks().forEach(track => {
      peerConnection.addTrack(track, localStream);
    });
  }

  switch (data.type) {
    case 'offer':
      await peerConnection.setRemoteDescription(new RTCSessionDescription(data.sdp));
      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);
      socket.emit('signal', { room, type: 'answer', sdp: peerConnection.localDescription });
      break;

    case 'answer':
      await peerConnection.setRemoteDescription(new RTCSessionDescription(data.sdp));
      break;

    case 'candidate':
      if (data.candidate) {
        await peerConnection.addIceCandidate(new RTCIceCandidate(data.candidate));
      }
      break;

    case 'endCall':
      endCall();
      break;
  }
});

hangupBtn.onclick = () => {
  endCall();
};
