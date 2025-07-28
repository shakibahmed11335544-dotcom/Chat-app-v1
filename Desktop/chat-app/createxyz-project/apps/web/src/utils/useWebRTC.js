import { useState, useRef, useCallback, useEffect } from 'react';

// WebRTC configuration
const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ]
};

export function useWebRTC() {
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [isCallActive, setIsCallActive] = useState(false);
  const [isVideo, setIsVideo] = useState(false);
  const [callStatus, setCallStatus] = useState('idle'); // idle, calling, connected, ended
  
  const peerConnection = useRef(null);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  // Initialize peer connection
  const initializePeerConnection = useCallback(() => {
    if (peerConnection.current) return;

    peerConnection.current = new RTCPeerConnection(ICE_SERVERS);

    // Handle remote stream
    peerConnection.current.ontrack = (event) => {
      console.log('Received remote stream');
      setRemoteStream(event.streams[0]);
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
    };

    // Handle ICE candidates
    peerConnection.current.onicecandidate = (event) => {
      if (event.candidate) {
        console.log('ICE candidate:', event.candidate);
        // In real implementation, send this to the other peer via signaling server
      }
    };

    // Handle connection state changes
    peerConnection.current.onconnectionstatechange = () => {
      const state = peerConnection.current.connectionState;
      console.log('Connection state changed:', state);
      
      if (state === 'connected') {
        setCallStatus('connected');
      } else if (state === 'disconnected' || state === 'failed') {
        setCallStatus('ended');
        endCall();
      }
    };
  }, []);

  // Start call (get user media and create offer)
  const startCall = useCallback(async (videoEnabled = false) => {
    try {
      setIsVideo(videoEnabled);
      setCallStatus('calling');
      setIsCallActive(true);

      // Get user media
      const stream = await navigator.mediaDevices.getUserMedia({
        video: videoEnabled,
        audio: true
      });

      setLocalStream(stream);
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      // Initialize peer connection
      initializePeerConnection();

      // Add local stream to peer connection
      stream.getTracks().forEach(track => {
        peerConnection.current.addTrack(track, stream);
      });

      // Create offer
      const offer = await peerConnection.current.createOffer();
      await peerConnection.current.setLocalDescription(offer);

      console.log('Call started with offer:', offer);
      
      // Simulate call connection after 3 seconds for demo
      setTimeout(() => {
        setCallStatus('connected');
      }, 3000);

      return offer;
    } catch (error) {
      console.error('Error starting call:', error);
      setCallStatus('ended');
      throw error;
    }
  }, [initializePeerConnection]);

  // Answer call
  const answerCall = useCallback(async (offer, videoEnabled = false) => {
    try {
      setIsVideo(videoEnabled);
      setCallStatus('connected');
      setIsCallActive(true);

      // Get user media
      const stream = await navigator.mediaDevices.getUserMedia({
        video: videoEnabled,
        audio: true
      });

      setLocalStream(stream);
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      // Initialize peer connection
      initializePeerConnection();

      // Add local stream to peer connection
      stream.getTracks().forEach(track => {
        peerConnection.current.addTrack(track, stream);
      });

      // Set remote description
      await peerConnection.current.setRemoteDescription(offer);

      // Create answer
      const answer = await peerConnection.current.createAnswer();
      await peerConnection.current.setLocalDescription(answer);

      console.log('Call answered with answer:', answer);
      return answer;
    } catch (error) {
      console.error('Error answering call:', error);
      setCallStatus('ended');
      throw error;
    }
  }, [initializePeerConnection]);

  // End call
  const endCall = useCallback(() => {
    console.log('Ending call');
    
    // Stop all tracks
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
      setLocalStream(null);
    }
    
    if (remoteStream) {
      remoteStream.getTracks().forEach(track => track.stop());
      setRemoteStream(null);
    }

    // Close peer connection
    if (peerConnection.current) {
      peerConnection.current.close();
      peerConnection.current = null;
    }

    // Reset state
    setIsCallActive(false);
    setCallStatus('ended');
    
    // Clear video elements
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }
  }, [localStream, remoteStream]);

  // Toggle video
  const toggleVideo = useCallback(() => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideo(videoTrack.enabled);
      }
    }
  }, [localStream]);

  // Toggle audio
  const toggleAudio = useCallback(() => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
      }
    }
  }, [localStream]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      endCall();
    };
  }, [endCall]);

  return {
    localStream,
    remoteStream,
    isCallActive,
    isVideo,
    callStatus,
    localVideoRef,
    remoteVideoRef,
    startCall,
    answerCall,
    endCall,
    toggleVideo,
    toggleAudio
  };
}