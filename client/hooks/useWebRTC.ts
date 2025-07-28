import { useState, useEffect, useRef } from 'react';
import { webRTCManager, CallState } from '@/services/webrtc';

export function useWebRTC() {
  const [callState, setCallState] = useState<CallState>(webRTCManager.getCallState());
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // Subscribe to call state changes
    const unsubscribeCallState = webRTCManager.onCallStateChange((state) => {
      setCallState(state);
    });

    // Subscribe to stream changes
    const unsubscribeStreams = webRTCManager.onStreamChange((local, remote) => {
      setLocalStream(local);
      setRemoteStream(remote);

      // Update video elements
      if (localVideoRef.current && local) {
        localVideoRef.current.srcObject = local;
      }
      if (remoteVideoRef.current && remote) {
        remoteVideoRef.current.srcObject = remote;
      }
    });

    return () => {
      unsubscribeCallState();
      unsubscribeStreams();
    };
  }, []);

  const startCall = async (contactId: string, callType: 'audio' | 'video') => {
    await webRTCManager.startCall(contactId, callType);
  };

  const answerCall = async () => {
    await webRTCManager.answerCall();
  };

  const rejectCall = () => {
    webRTCManager.rejectCall();
  };

  const endCall = () => {
    webRTCManager.endCall();
  };

  const toggleMute = () => {
    webRTCManager.toggleMute();
  };

  const toggleVideo = () => {
    webRTCManager.toggleVideo();
  };

  const simulateIncomingCall = (callerName: string, callType: 'audio' | 'video') => {
    webRTCManager.simulateIncomingCall(callerName, callType);
  };

  const formatCallDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return {
    callState,
    localStream,
    remoteStream,
    localVideoRef,
    remoteVideoRef,
    startCall,
    answerCall,
    rejectCall,
    endCall,
    toggleMute,
    toggleVideo,
    simulateIncomingCall,
    formatCallDuration,
  };
}
