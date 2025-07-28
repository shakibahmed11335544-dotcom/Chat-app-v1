import React, { useEffect, useRef, useState } from "react";
import io from "socket.io-client";

const socket = io(import.meta.env.VITE_SERVER_URL || "http://localhost:5000");

interface InCallProps {
  roomId: string;
}

export default function InCallScreen({ roomId }: InCallProps) {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const peerRef = useRef<RTCPeerConnection | null>(null);
  const [inCall, setInCall] = useState(false);

  useEffect(() => {
    const init = async () => {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      if (localVideoRef.current) localVideoRef.current.srcObject = stream;

      peerRef.current = new RTCPeerConnection({
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
      });

      stream.getTracks().forEach(track => peerRef.current?.addTrack(track, stream));

      peerRef.current.ontrack = (event) => {
        if (remoteVideoRef.current) remoteVideoRef.current.srcObject = event.streams[0];
      };

      peerRef.current.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit("ice-candidate", event.candidate, roomId);
        }
      };

      socket.emit("join-room", roomId);

      socket.on("user-joined", async () => {
        const offer = await peerRef.current?.createOffer();
        await peerRef.current?.setLocalDescription(offer!);
        socket.emit("offer", offer, roomId);
      });

      socket.on("offer", async (offer) => {
        await peerRef.current?.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await peerRef.current?.createAnswer();
        await peerRef.current?.setLocalDescription(answer!);
        socket.emit("answer", answer, roomId);
      });

      socket.on("answer", async (answer) => {
        await peerRef.current?.setRemoteDescription(new RTCSessionDescription(answer));
      });

      socket.on("ice-candidate", async (candidate) => {
        await peerRef.current?.addIceCandidate(new RTCIceCandidate(candidate));
      });

      setInCall(true);
    };

    init();

    return () => {
      socket.disconnect();
      peerRef.current?.close();
    };
  }, [roomId]);

  return (
    <div className="flex flex-col items-center bg-gray-900 h-screen p-4">
      <h1 className="text-white text-xl mb-4">In Call</h1>
      <video ref={localVideoRef} autoPlay playsInline muted className="w-1/2 rounded-lg border-2 border-white" />
      <video ref={remoteVideoRef} autoPlay playsInline className="w-1/2 rounded-lg border-2 border-green-500 mt-4" />
      {inCall && <p className="text-green-400 mt-2">Connected</p>}
    </div>
  );
}
