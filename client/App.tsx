import React, { useState, useEffect } from "react";
import io from "socket.io-client";
import IncomingCallModal from "./components/IncomingCallModal";
import InCallScreen from "./components/InCallScreen";
import ContactListItem from "./components/ContactListItem";

const socket = io(import.meta.env.VITE_SERVER_URL || "http://localhost:5000");

export default function App() {
  const [incomingCall, setIncomingCall] = useState<{ from: string } | null>(null);
  const [inCall, setInCall] = useState(false);
  const [roomId, setRoomId] = useState<string | null>(null);

  const contacts = [
    { id: "user1", name: "Sakib" },
    { id: "user2", name: "Friend" }
  ];

  useEffect(() => {
    socket.on("incoming-call", (data) => {
      setIncomingCall(data);
    });

    socket.on("call-accepted", (data) => {
      setRoomId(data.from);
      setInCall(true);
    });

    return () => {
      socket.off("incoming-call");
      socket.off("call-accepted");
    };
  }, []);

  const handleAccept = () => {
    socket.emit("accept-call", incomingCall?.from);
    setRoomId(incomingCall?.from || "");
    setInCall(true);
    setIncomingCall(null);
  };

  const handleReject = () => {
    setIncomingCall(null);
  };

  if (inCall && roomId) {
    return <InCallScreen roomId={roomId} />;
  }

  return (
    <div className="h-screen flex flex-col items-center justify-center">
      <h1 className="text-2xl mb-4">Chat + Call System</h1>
      <div className="w-full max-w-md">
        {contacts.map(c => <ContactListItem key={c.id} contact={c} />)}
      </div>
      {incomingCall && <IncomingCallModal onAccept={handleAccept} onReject={handleReject} />}
    </div>
  );
}
