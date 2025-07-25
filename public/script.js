const socket = io();

const messages = document.getElementById('messages');
const form = document.getElementById('form');
const input = document.getElementById('input');
const localVideo = document.getElementById('localVideo');
const remoteVideo = document.getElementById('remoteVideo');
const callBtn = document.getElementById('callBtn');
const endBtn = document.getElementById('endBtn');
const muteBtn = document.getElementById('muteBtn');
const typing = document.getElementById('typing');

let localStream;
let remoteStream;
let peer;
let isTyping = false;
let timeout;

form.addEventListener('submit', (e) => {
  e.preventDefault();
  if (input.value.trim()) {
    socket.emit('chat message', input.value.trim());
    addMessage(input.value.trim(), true);
    input.value = '';
    socket.emit('typing', false);
  }
});

input.addEventListener('input', () => {
  if (!isTyping) {
    isTyping = true;
    socket.emit('typing', true);
    timeout = setTimeout(stopTyping, 2000);
  } else {
    clearTimeout(timeout);
    timeout = setTimeout(stopTyping, 2000);
  }
});

function stopTyping() {
  isTyping = false;
  socket.emit('typing', false);
}

socket.on('chat message', (msg) => {
  addMessage(msg, false);
});

socket.on('typing', (isTyping) => {
  typing.innerText = isTyping ? 'Friend is typing...' : '';
});

socket.on('old messages', (msgs) => {
  msgs.forEach(msg => addMessage(msg, false));
});

function addMessage(msg, self = false) {
  const item = document.createElement('div');
  item.classList.add('message');
  if (self) item.classList.add('self');
  item.textContent = msg;
  messages.appendChild(item);
  messages.scrollTop = messages.scrollHeight;
}

callBtn.onclick = async () => {
  peer = createPeer(true);
  localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
  localVideo.srcObject = localStream;
  localStream.getTracks().forEach(track => peer.addTrack(track, localStream));
};

function createPeer(initiator) {
  const peer = new RTCPeerConnection({
    iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
  });

  peer.onicecandidate = e => {
    if (e.candidate) socket.emit('ice-candidate', e.candidate);
  };

  peer.ontrack = e => {
    if (!remoteStream) {
      remoteStream = new MediaStream();
      remoteVideo.srcObject = remoteStream;
    }
    remoteStream.addTrack(e.track);
  };

  if (initiator) {
    peer.onnegotiationneeded = async () => {
      const offer = await peer.createOffer();
      await peer.setLocalDescription(offer);
      socket.emit('offer', offer);
    };
  }

  return peer;
}

socket.on('offer', async (offer) => {
  peer = createPeer(false);
  localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
  localVideo.srcObject = localStream;
  localStream.getTracks().forEach(track => peer.addTrack(track, localStream));
  await peer.setRemoteDescription(new RTCSessionDescription(offer));
  const answer = await peer.createAnswer();
  await peer.setLocalDescription(answer);
  socket.emit('answer', answer);
});

socket.on('answer', async (answer) => {
  await peer.setRemoteDescription(new RTCSessionDescription(answer));
});

socket.on('ice-candidate', async (candidate) => {
  if (peer) await peer.addIceCandidate(new RTCIceCandidate(candidate));
});

endBtn.onclick = () => {
  if (peer) {
    peer.close();
    peer = null;
    localVideo.srcObject?.getTracks().forEach(track => track.stop());
    remoteVideo.srcObject?.getTracks().forEach(track => track.stop());
    localVideo.srcObject = null;
    remoteVideo.srcObject = null;
  }
};

muteBtn.onclick = () => {
  if (localStream) {
    localStream.getAudioTracks().forEach(track => track.enabled = !track.enabled);
    muteBtn.textContent = track.enabled ? '🔊' : '🔇';
  }
};
