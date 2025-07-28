import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { MessageList } from "./MessageList";
import { MessageInput } from "./MessageInput";
import { CallInterface } from "./CallInterface";

interface ChatWindowProps {
  host: any;
  onToggleSidebar: () => void;
}

export function ChatWindow({ host, onToggleSidebar }: ChatWindowProps) {
  const messages = useQuery(api.messages.getMessages, { hostId: host.hostId });
  const activeCall = useQuery(api.calls.getActiveCall, { hostId: host.hostId });
  const startCall = useMutation(api.calls.startCall);
  const [showCallInterface, setShowCallInterface] = useState(false);

  const handleStartCall = async (type: "audio" | "video") => {
    try {
      await startCall({ hostId: host.hostId, type });
      setShowCallInterface(true);
    } catch (error) {
      console.error("Failed to start call:", error);
    }
  };

  useEffect(() => {
    if (activeCall) {
      setShowCallInterface(true);
    } else {
      setShowCallInterface(false);
    }
  }, [activeCall]);

  return (
    <div className="flex-1 flex flex-col h-screen">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onToggleSidebar}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            
            <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
              {host.name.charAt(0).toUpperCase()}
            </div>
            
            <div>
              <h2 className="font-semibold text-gray-900 dark:text-white">
                {host.name}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {host.participants.length} participants • ID: {host.hostId}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleStartCall("audio")}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title="Start audio call"
            >
              <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </button>
            
            <button
              onClick={() => handleStartCall("video")}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title="Start video call"
            >
              <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Call Interface */}
      {showCallInterface && activeCall && (
        <CallInterface
          call={activeCall}
          onEndCall={() => setShowCallInterface(false)}
        />
      )}

      {/* Messages */}
      <div className="flex-1 overflow-hidden">
        <MessageList messages={messages || []} />
      </div>

      {/* Message Input */}
      <MessageInput hostId={host.hostId} />
    </div>
  );
}
