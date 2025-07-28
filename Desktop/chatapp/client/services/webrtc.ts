export interface CallState {
  isInCall: boolean;
  isIncomingCall: boolean;
  isOutgoingCall: boolean;
  callType: 'audio' | 'video' | null;
  callerName?: string;
  callerId?: string;
  isMuted: boolean;
  isVideoEnabled: boolean;
  callDuration: number;
  connectionState: 'connecting' | 'connected' | 'disconnected' | 'failed';
}

export interface WebRTCService {
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  peerConnection: RTCPeerConnection | null;
  callState: CallState;
}

class WebRTCManager {
  private localStream: MediaStream | null = null;
  private remoteStream: MediaStream | null = null;
  private peerConnection: RTCPeerConnection | null = null;
  private callState: CallState = {
    isInCall: false,
    isIncomingCall: false,
    isOutgoingCall: false,
    callType: null,
    isMuted: false,
    isVideoEnabled: true,
    callDuration: 0,
    connectionState: 'disconnected'
  };
  private callStateListeners: ((state: CallState) => void)[] = [];
  private streamListeners: ((localStream: MediaStream | null, remoteStream: MediaStream | null) => void)[] = [];

  private configuration: RTCConfiguration = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
    ],
  };

  constructor() {
    this.setupPeerConnection();
  }

  private setupPeerConnection() {
    this.peerConnection = new RTCPeerConnection(this.configuration);

    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        // In a real app, send this to the remote peer via signaling server
        console.log('ICE candidate:', event.candidate);
      }
    };

    this.peerConnection.ontrack = (event) => {
      console.log('Remote stream received:', event.streams[0]);
      this.remoteStream = event.streams[0];
      this.notifyStreamListeners();
    };

    this.peerConnection.onconnectionstatechange = () => {
      const state = this.peerConnection?.connectionState;
      if (state) {
        this.updateCallState({ connectionState: state as any });
      }
    };
  }

  async startCall(contactId: string, callType: 'audio' | 'video') {
    try {
      // Get user media
      const constraints = {
        audio: true,
        video: callType === 'video'
      };

      this.localStream = await navigator.mediaDevices.getUserMedia(constraints);
      
      // Add tracks to peer connection
      this.localStream.getTracks().forEach(track => {
        if (this.peerConnection && this.localStream) {
          this.peerConnection.addTrack(track, this.localStream);
        }
      });

      // Create offer
      const offer = await this.peerConnection?.createOffer();
      await this.peerConnection?.setLocalDescription(offer);

      this.updateCallState({
        isOutgoingCall: true,
        isInCall: true,
        callType,
        connectionState: 'connecting',
        isVideoEnabled: callType === 'video'
      });

      this.notifyStreamListeners();

      // In a real app, send offer to remote peer via signaling server
      console.log('Call offer created:', offer);

      // Simulate incoming call acceptance after 3 seconds
      setTimeout(() => {
        this.simulateCallAnswer();
      }, 3000);

    } catch (error) {
      console.error('Error starting call:', error);
      this.updateCallState({ connectionState: 'failed' });
    }
  }

  async receiveCall(callerId: string, callerName: string, callType: 'audio' | 'video', offer?: RTCSessionDescriptionInit) {
    this.updateCallState({
      isIncomingCall: true,
      callType,
      callerId,
      callerName,
      connectionState: 'connecting'
    });
  }

  async answerCall() {
    try {
      if (!this.callState.isIncomingCall) return;

      const constraints = {
        audio: true,
        video: this.callState.callType === 'video'
      };

      this.localStream = await navigator.mediaDevices.getUserMedia(constraints);
      
      this.localStream.getTracks().forEach(track => {
        if (this.peerConnection && this.localStream) {
          this.peerConnection.addTrack(track, this.localStream);
        }
      });

      // In a real app, set remote description and create answer
      const answer = await this.peerConnection?.createAnswer();
      await this.peerConnection?.setLocalDescription(answer);

      this.updateCallState({
        isIncomingCall: false,
        isInCall: true,
        connectionState: 'connected',
        isVideoEnabled: this.callState.callType === 'video'
      });

      this.notifyStreamListeners();
      this.startCallTimer();

    } catch (error) {
      console.error('Error answering call:', error);
      this.rejectCall();
    }
  }

  rejectCall() {
    this.updateCallState({
      isIncomingCall: false,
      connectionState: 'disconnected'
    });
    this.cleanup();
  }

  endCall() {
    this.updateCallState({
      isInCall: false,
      isIncomingCall: false,
      isOutgoingCall: false,
      connectionState: 'disconnected',
      callDuration: 0
    });
    this.cleanup();
  }

  toggleMute() {
    if (this.localStream) {
      const audioTrack = this.localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        this.updateCallState({ isMuted: !audioTrack.enabled });
      }
    }
  }

  toggleVideo() {
    if (this.localStream) {
      const videoTrack = this.localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        this.updateCallState({ isVideoEnabled: videoTrack.enabled });
      }
    }
  }

  private simulateCallAnswer() {
    // Simulate remote peer answering the call
    this.updateCallState({
      isOutgoingCall: false,
      isInCall: true,
      connectionState: 'connected'
    });
    this.startCallTimer();
  }

  private startCallTimer() {
    const startTime = Date.now();
    const timer = setInterval(() => {
      if (!this.callState.isInCall) {
        clearInterval(timer);
        return;
      }
      const duration = Math.floor((Date.now() - startTime) / 1000);
      this.updateCallState({ callDuration: duration });
    }, 1000);
  }

  private cleanup() {
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
      this.localStream = null;
    }

    if (this.remoteStream) {
      this.remoteStream.getTracks().forEach(track => track.stop());
      this.remoteStream = null;
    }

    if (this.peerConnection) {
      this.peerConnection.close();
      this.setupPeerConnection();
    }

    this.notifyStreamListeners();
  }

  private updateCallState(updates: Partial<CallState>) {
    this.callState = { ...this.callState, ...updates };
    this.callStateListeners.forEach(listener => listener(this.callState));
  }

  private notifyStreamListeners() {
    this.streamListeners.forEach(listener => 
      listener(this.localStream, this.remoteStream)
    );
  }

  onCallStateChange(listener: (state: CallState) => void) {
    this.callStateListeners.push(listener);
    return () => {
      const index = this.callStateListeners.indexOf(listener);
      if (index > -1) {
        this.callStateListeners.splice(index, 1);
      }
    };
  }

  onStreamChange(listener: (localStream: MediaStream | null, remoteStream: MediaStream | null) => void) {
    this.streamListeners.push(listener);
    return () => {
      const index = this.streamListeners.indexOf(listener);
      if (index > -1) {
        this.streamListeners.splice(index, 1);
      }
    };
  }

  getCallState() {
    return this.callState;
  }

  getStreams() {
    return {
      localStream: this.localStream,
      remoteStream: this.remoteStream
    };
  }

  // Simulate receiving an incoming call (for demo purposes)
  simulateIncomingCall(callerName: string, callType: 'audio' | 'video') {
    setTimeout(() => {
      this.receiveCall('demo-caller', callerName, callType);
    }, 1000);
  }
}

export const webRTCManager = new WebRTCManager();
