import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";

interface CreateJoinModalProps {
  onClose: () => void;
  onHostCreated: (hostId: string) => void;
  onHostJoined: (hostId: string) => void;
}

export function CreateJoinModal({ onClose, onHostCreated, onHostJoined }: CreateJoinModalProps) {
  const [activeTab, setActiveTab] = useState<"create" | "join">("create");
  const [roomName, setRoomName] = useState("");
  const [hostId, setHostId] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const createHost = useMutation(api.hosts.createHost);
  const joinHost = useMutation(api.hosts.joinHost);

  const handleCreate = async () => {
    if (!roomName.trim()) {
      toast.error("Please enter a room name");
      return;
    }

    setIsLoading(true);
    try {
      const result = await createHost({ name: roomName.trim() });
      toast.success(`Room created! ID: ${result.hostId}`);
      onHostCreated(result.hostId);
    } catch (error) {
      toast.error("Failed to create room");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoin = async () => {
    if (!hostId.trim()) {
      toast.error("Please enter a room ID");
      return;
    }

    setIsLoading(true);
    try {
      await joinHost({ hostId: hostId.trim().toUpperCase() });
      toast.success("Successfully joined room!");
      onHostJoined(hostId.trim().toUpperCase());
    } catch (error) {
      toast.error("Failed to join room. Please check the room ID.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {activeTab === "create" ? "Create Room" : "Join Room"}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Tabs */}
          <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1 mb-6">
            <button
              onClick={() => setActiveTab("create")}
              className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
                activeTab === "create"
                  ? "bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              Create
            </button>
            <button
              onClick={() => setActiveTab("join")}
              className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
                activeTab === "join"
                  ? "bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              Join
            </button>
          </div>

          {/* Create Tab */}
          {activeTab === "create" && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Room Name
                </label>
                <input
                  type="text"
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                  placeholder="Enter room name..."
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  maxLength={50}
                />
              </div>
              <button
                onClick={handleCreate}
                disabled={isLoading || !roomName.trim()}
                className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 dark:disabled:bg-gray-600 text-white py-3 px-4 rounded-lg font-medium transition-colors disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Create Room
                  </>
                )}
              </button>
            </div>
          )}

          {/* Join Tab */}
          {activeTab === "join" && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Room ID
                </label>
                <input
                  type="text"
                  value={hostId}
                  onChange={(e) => setHostId(e.target.value.toUpperCase())}
                  placeholder="Enter room ID..."
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 font-mono"
                  maxLength={6}
                />
              </div>
              <button
                onClick={handleJoin}
                disabled={isLoading || !hostId.trim()}
                className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-300 dark:disabled:bg-gray-600 text-white py-3 px-4 rounded-lg font-medium transition-colors disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Joining...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                    </svg>
                    Join Room
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
