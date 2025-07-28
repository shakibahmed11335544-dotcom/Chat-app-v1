import React from "react";
import { Phone } from "lucide-react";
import io from "socket.io-client";

const socket = io(import.meta.env.VITE_SERVER_URL || "http://localhost:5000");

export default function ContactListItem({ contact }: { contact: { id: string; name: string } }) {
  const startCall = () => {
    socket.emit("start-call", contact.id);
  };

  return (
    <div className="flex items-center justify-between p-4 hover:bg-gray-100 cursor-pointer">
      <div>
        <h3 className="text-lg font-medium">{contact.name}</h3>
      </div>
      <button onClick={startCall} className="p-2 bg-blue-500 rounded-full text-white hover:bg-blue-600">
        <Phone size={18} />
      </button>
    </div>
  );
}
