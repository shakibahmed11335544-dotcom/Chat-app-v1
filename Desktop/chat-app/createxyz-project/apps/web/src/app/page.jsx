"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "motion/react";
import {
  MessageCircle,
  Users,
  Star,
  Archive,
  Phone,
  Settings,
  Search,
  Camera,
  MoreVertical,
  Clock,
  Check,
  CheckCheck,
  Send,
  Paperclip,
  Smile,
  Video,
  PhoneCall,
  ArrowLeft,
  Menu,
  X,
  Mic,
  MicOff,
  VideoOff,
  PhoneOff,
  UserPlus,
  LogOut,
} from "lucide-react";
import { useWebRTC } from "@/utils/useWebRTC";
import { useRealTimeChat } from "@/utils/useRealTimeChat";
import useAuth from "@/utils/useAuth";
import useUser from "@/utils/useUser";

// Add User Modal Component
function AddUserModal({ isOpen, onClose, onUserAdded }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isCreatingChat, setIsCreatingChat] = useState(false);

  const { data: currentUser } = useUser();

  const searchUsers = useCallback(
    async (query) => {
      if (!query.trim()) {
        setSearchResults([]);
        return;
      }

      setIsSearching(true);
      try {
        const response = await fetch(
          `/api/users/search?q=${encodeURIComponent(query.trim())}`,
        );
        if (response.ok) {
          const users = await response.json();
          // Filter out current user
          setSearchResults(users.filter((user) => user.id !== currentUser?.id));
        }
      } catch (error) {
        console.error("Error searching users:", error);
      } finally {
        setIsSearching(false);
      }
    },
    [currentUser?.id],
  );

  const createChatWithUser = async (user) => {
    setIsCreatingChat(true);
    try {
      const response = await fetch("/api/chats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: user.name,
          type: "individual",
          participants: [currentUser.id, user.id],
        }),
      });

      if (response.ok) {
        const newChat = await response.json();
        onUserAdded(newChat);
        onClose();
        setSearchQuery("");
        setSearchResults([]);
      }
    } catch (error) {
      console.error("Error creating chat:", error);
    } finally {
      setIsCreatingChat(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchUsers(searchQuery);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, searchUsers]);

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-[#202c33] rounded-lg w-full max-w-md"
      >
        <div className="p-4 border-b border-[#313d45]">
          <div className="flex items-center justify-between">
            <h3 className="text-white text-lg font-medium">Add Contact</h3>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white hover:bg-[#2a3942] rounded-full"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="p-4">
          <div className="relative mb-4">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#2a3942] text-white pl-10 pr-4 py-3 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8b5cf6]"
            />
          </div>

          <div className="max-h-64 overflow-y-auto">
            {isSearching ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#8b5cf6]"></div>
              </div>
            ) : searchResults.length > 0 ? (
              <div className="space-y-2">
                {searchResults.map((user) => (
                  <motion.div
                    key={user.id}
                    whileHover={{ backgroundColor: "#2a3942" }}
                    className="flex items-center justify-between p-3 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <img
                        src={
                          user.avatar_url ||
                          `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=8b5cf6&color=fff`
                        }
                        alt={user.name}
                        className="w-10 h-10 rounded-full"
                      />
                      <div>
                        <p className="text-white font-medium">{user.name}</p>
                        <p className="text-gray-400 text-sm">{user.email}</p>
                      </div>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => createChatWithUser(user)}
                      disabled={isCreatingChat}
                      className="p-2 bg-[#8b5cf6] text-white rounded-full hover:bg-[#7c3aed] disabled:opacity-50"
                    >
                      <UserPlus size={16} />
                    </motion.button>
                  </motion.div>
                ))}
              </div>
            ) : searchQuery.trim() && !isSearching ? (
              <div className="text-center py-8">
                <p className="text-gray-400">No users found</p>
              </div>
            ) : (
              <div className="text-center py-8">
                <UserPlus size={48} className="mx-auto mb-4 text-gray-600" />
                <p className="text-gray-400">
                  Search for users to start chatting
                </p>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// WebRTC Calling Interface Component
function WebRTCCallingModal({
  isOpen,
  onClose,
  chatName,
  isVideo = false,
  targetUserId,
}) {
  const {
    localStream,
    remoteStream,
    isCallActive,
    callStatus,
    localVideoRef,
    remoteVideoRef,
    startCall,
    endCall,
    toggleVideo,
    toggleAudio,
  } = useWebRTC();

  const [isVideoEnabled, setIsVideoEnabled] = useState(isVideo);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [callDuration, setCallDuration] = useState(0);
  const [showControls, setShowControls] = useState(true);

  const callStartTime = useRef(null);
  const durationInterval = useRef(null);
  const controlsTimeout = useRef(null);

  // Start call when modal opens
  useEffect(() => {
    if (isOpen && !isCallActive) {
      initializeCall();
    }
  }, [isOpen, isCallActive]);

  // Update call duration
  useEffect(() => {
    if (callStatus === "connected") {
      callStartTime.current = Date.now();
      durationInterval.current = setInterval(() => {
        if (callStartTime.current) {
          setCallDuration(
            Math.floor((Date.now() - callStartTime.current) / 1000),
          );
        }
      }, 1000);
    } else {
      if (durationInterval.current) {
        clearInterval(durationInterval.current);
      }
    }

    return () => {
      if (durationInterval.current) {
        clearInterval(durationInterval.current);
      }
    };
  }, [callStatus]);

  // Auto-hide controls after 5 seconds
  useEffect(() => {
    if (showControls && callStatus === "connected") {
      if (controlsTimeout.current) {
        clearTimeout(controlsTimeout.current);
      }
      controlsTimeout.current = setTimeout(() => {
        setShowControls(false);
      }, 5000);
    }

    return () => {
      if (controlsTimeout.current) {
        clearTimeout(controlsTimeout.current);
      }
    };
  }, [showControls, callStatus]);

  const initializeCall = async () => {
    try {
      await startCall(isVideo);
    } catch (error) {
      console.error("Failed to start call:", error);
      onClose();
    }
  };

  const handleEndCall = () => {
    endCall();
    setCallDuration(0);
    onClose();
  };

  const handleToggleVideo = () => {
    toggleVideo();
    setIsVideoEnabled(!isVideoEnabled);
  };

  const handleToggleAudio = () => {
    toggleAudio();
    setIsAudioEnabled(!isAudioEnabled);
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black flex items-center justify-center"
      onClick={() => setShowControls(true)}
    >
      <div className="w-full h-full relative">
        {/* Remote Video (Full Screen) */}
        <div className="w-full h-full bg-gray-900 flex items-center justify-center">
          {remoteStream && isVideoEnabled ? (
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="text-center">
              <img
                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(chatName)}&background=8b5cf6&color=fff&size=200`}
                alt={chatName}
                className="w-32 h-32 lg:w-48 lg:h-48 rounded-full mx-auto mb-4"
              />
              <h3 className="text-white text-xl lg:text-2xl font-medium mb-2">
                {chatName}
              </h3>
              {callStatus === "calling" && (
                <p className="text-gray-400 text-lg">Calling...</p>
              )}
              {callStatus === "connected" && (
                <p className="text-green-500 text-lg">
                  {formatDuration(callDuration)}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Local Video (Picture-in-Picture) */}
        {localStream && isVideoEnabled && (
          <div className="absolute top-4 right-4 w-32 h-24 lg:w-48 lg:h-36 bg-gray-800 rounded-lg overflow-hidden border-2 border-white">
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Call Status Overlay */}
        <div className="absolute top-4 left-4 right-4">
          <div className="flex items-center justify-between">
            <div className="text-white">
              {callStatus === "connected" && (
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm">
                    {formatDuration(callDuration)}
                  </span>
                </div>
              )}
            </div>
            <div className="text-white text-right">
              <p className="text-sm opacity-75">
                {isVideo ? "Video Call" : "Voice Call"}
              </p>
            </div>
          </div>
        </div>

        {/* Call Controls */}
        <AnimatePresence>
          {showControls && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
            >
              <div className="flex items-center space-x-4 bg-black bg-opacity-50 backdrop-blur-md rounded-full px-6 py-4">
                {/* Toggle Audio */}
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleToggleAudio}
                  className={`p-4 rounded-full ${
                    isAudioEnabled
                      ? "bg-gray-700 text-white hover:bg-gray-600"
                      : "bg-red-500 text-white hover:bg-red-600"
                  }`}
                >
                  {isAudioEnabled ? <Mic size={24} /> : <MicOff size={24} />}
                </motion.button>

                {/* End Call */}
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleEndCall}
                  className="p-4 bg-red-500 text-white rounded-full hover:bg-red-600"
                >
                  <PhoneOff size={24} />
                </motion.button>

                {/* Toggle Video */}
                {isVideo && (
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleToggleVideo}
                    className={`p-4 rounded-full ${
                      isVideoEnabled
                        ? "bg-gray-700 text-white hover:bg-gray-600"
                        : "bg-red-500 text-white hover:bg-red-600"
                    }`}
                  >
                    {isVideoEnabled ? (
                      <Video size={24} />
                    ) : (
                      <VideoOff size={24} />
                    )}
                  </motion.button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

// Message Component with real-time features
function Message({ message }) {
  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getMessageStatus = (status) => {
    switch (status) {
      case "sent":
        return <Check size={14} className="text-gray-400" />;
      case "delivered":
        return <CheckCheck size={14} className="text-gray-400" />;
      case "read":
        return <CheckCheck size={14} className="text-blue-500" />;
      default:
        return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex mb-4 ${message.isSentByMe ? "justify-end" : "justify-start"}`}
    >
      <div
        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
          message.isSentByMe
            ? "bg-[#8b5cf6] text-white"
            : "bg-[#2a3942] text-white"
        }`}
      >
        {!message.isSentByMe && (
          <p className="text-xs text-gray-400 mb-1">{message.senderName}</p>
        )}
        <p className="text-sm">{message.content}</p>
        <div className="flex items-center justify-end space-x-1 mt-1">
          <span className="text-xs opacity-70">
            {formatTime(message.timestamp)}
          </span>
          {message.isSentByMe && getMessageStatus(message.readStatus)}
        </div>
      </div>
    </motion.div>
  );
}

// Typing Indicator Component
function TypingIndicator({ typingUsers }) {
  if (typingUsers.size === 0) return null;

  const users = Array.from(typingUsers);
  const displayText =
    users.length === 1
      ? `${users[0]} is typing...`
      : `${users.slice(0, -1).join(", ")} and ${users[users.length - 1]} are typing...`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className="flex items-center space-x-2 p-3 text-gray-400 text-sm"
    >
      <div className="flex space-x-1">
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
        <div
          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
          style={{ animationDelay: "0.1s" }}
        ></div>
        <div
          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
          style={{ animationDelay: "0.2s" }}
        ></div>
      </div>
      <span>{displayText}</span>
    </motion.div>
  );
}

// Chat Interface Component with real-time features
function ChatInterface({ chatId, chatName, onBack, onCall, onVideoCall }) {
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef(null);
  const queryClient = useQueryClient();
  const typingTimeoutRef = useRef(null);
  const { data: user } = useUser();

  // Real-time chat hook
  const {
    isConnected,
    typingUsers,
    joinChat,
    sendMessage,
    startTyping,
    stopTyping,
  } = useRealTimeChat();

  // Fetch messages with real-time updates using authenticated user
  const { data: messages = [], isLoading } = useQuery({
    queryKey: ["messages", chatId, user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const response = await fetch(
        `/api/messages?chatId=${chatId}&userId=${user.id}`,
      );
      if (!response.ok) throw new Error("Failed to fetch messages");
      return response.json();
    },
    enabled: !!chatId && !!user?.id,
  });

  // Join chat room when component mounts
  useEffect(() => {
    if (chatId && isConnected && user?.id) {
      joinChat(chatId, user.id);
    }
  }, [chatId, isConnected, user?.id, joinChat]);

  // Handle message sending with real-time using authenticated user
  const handleSendMessage = useCallback(async () => {
    if (newMessage.trim() && user?.id) {
      try {
        await sendMessage({
          chatId,
          userId: user.id,
          content: newMessage.trim(),
        });
        setNewMessage("");

        // Stop typing indicator
        stopTyping(chatId, user.id, user.name);
      } catch (error) {
        console.error("Failed to send message:", error);
      }
    }
  }, [newMessage, chatId, user, sendMessage, stopTyping]);

  // Handle typing indicators with authenticated user
  const handleInputChange = (e) => {
    setNewMessage(e.target.value);

    if (user?.id) {
      // Start typing indicator
      startTyping(chatId, user.id, user.name);

      // Clear existing timeout and set new one
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      typingTimeoutRef.current = setTimeout(() => {
        stopTyping(chatId, user.id, user.name);
      }, 1000);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex flex-col h-full">
      {/* Chat Header with connection status */}
      <div className="bg-[#202c33] p-4 border-b border-[#313d45] flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button
            onClick={onBack}
            className="lg:hidden p-2 text-gray-400 hover:text-white rounded-full hover:bg-[#2a3942]"
          >
            <ArrowLeft size={20} />
          </button>
          <img
            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(chatName)}&background=8b5cf6&color=fff`}
            alt={chatName}
            className="w-10 h-10 rounded-full"
          />
          <div>
            <h3 className="text-white font-medium">{chatName}</h3>
            <div className="flex items-center space-x-2">
              <div
                className={`w-2 h-2 rounded-full ${isConnected ? "bg-green-500" : "bg-gray-500"}`}
              ></div>
              <p className="text-xs text-green-500">
                {isConnected ? "Online" : "Connecting..."}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onVideoCall}
            className="p-2 text-gray-400 hover:text-white hover:bg-[#2a3942] rounded-full"
          >
            <Video size={20} />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onCall}
            className="p-2 text-gray-400 hover:text-white hover:bg-[#2a3942] rounded-full"
          >
            <PhoneCall size={20} />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="p-2 text-gray-400 hover:text-white hover:bg-[#2a3942] rounded-full"
          >
            <MoreVertical size={20} />
          </motion.button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 bg-[#0b141a]">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-gray-400">Loading messages...</div>
          </div>
        ) : (
          <>
            <AnimatePresence>
              {messages.map((message) => (
                <Message key={message.id} message={message} />
              ))}
            </AnimatePresence>

            {/* Typing Indicator */}
            <AnimatePresence>
              <TypingIndicator typingUsers={typingUsers} />
            </AnimatePresence>

            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Message Input */}
      <div className="bg-[#202c33] p-4 border-t border-[#313d45]">
        <div className="flex items-center space-x-2">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="p-2 text-gray-400 hover:text-white hover:bg-[#2a3942] rounded-full"
          >
            <Paperclip size={20} />
          </motion.button>

          <div className="flex-1 relative">
            <input
              type="text"
              value={newMessage}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              className="w-full bg-[#2a3942] text-white px-4 py-2 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8b5cf6]"
            />
          </div>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="p-2 text-gray-400 hover:text-white hover:bg-[#2a3942] rounded-full"
          >
            <Smile size={20} />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
            className="p-2 bg-[#8b5cf6] text-white rounded-full hover:bg-[#7c3aed] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send size={20} />
          </motion.button>
        </div>
      </div>
    </div>
  );
}

// Calling Modal Component
function CallingModal({ isOpen, onClose, chatName, isVideo = false }) {
  const [callStatus, setCallStatus] = useState("calling"); // calling, connected, ended

  useEffect(() => {
    if (isOpen) {
      // Simulate call connection after 3 seconds
      const timer = setTimeout(() => {
        setCallStatus("connected");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const endCall = () => {
    setCallStatus("ended");
    setTimeout(() => {
      onClose();
      setCallStatus("calling");
    }, 1000);
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center"
    >
      <div className="bg-[#202c33] rounded-lg p-8 max-w-md w-full mx-4">
        <div className="text-center">
          <img
            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(chatName)}&background=8b5cf6&color=fff`}
            alt={chatName}
            className="w-24 h-24 rounded-full mx-auto mb-4"
          />
          <h3 className="text-white text-xl font-medium mb-2">{chatName}</h3>

          {callStatus === "calling" && (
            <p className="text-gray-400 mb-6">Calling...</p>
          )}
          {callStatus === "connected" && (
            <p className="text-green-500 mb-6">Connected - 00:15</p>
          )}
          {callStatus === "ended" && (
            <p className="text-red-500 mb-6">Call Ended</p>
          )}

          {isVideo && callStatus === "connected" && (
            <div className="bg-gray-800 rounded-lg h-48 mb-6 flex items-center justify-center">
              <p className="text-gray-400">Video call interface</p>
            </div>
          )}

          <div className="flex justify-center space-x-4">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={endCall}
              className="p-4 bg-red-500 text-white rounded-full hover:bg-red-600"
            >
              <X size={24} />
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// Sidebar Component (Updated for mobile)
function Sidebar({ activeTab, setActiveTab, isOpen, onClose, onAddUser }) {
  const { data: user } = useUser();
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut({
      callbackUrl: "/account/signin",
      redirect: true,
    });
  };

  const menuItems = [
    { id: "chats", icon: MessageCircle, label: "Chats", badge: 12 },
    { id: "groups", icon: Users, label: "Groups", badge: 3 },
    { id: "starred", icon: Star, label: "Starred" },
    { id: "archived", icon: Archive, label: "Archived" },
    { id: "calls", icon: Phone, label: "Calls" },
    { id: "settings", icon: Settings, label: "Settings" },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black bg-opacity-50"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <motion.div
        initial={{ x: -320 }}
        animate={{ x: isOpen ? 0 : -320 }}
        transition={{ type: "spring", damping: 20, stiffness: 100 }}
        className={`
          lg:relative lg:translate-x-0 fixed left-0 top-0 z-50 h-screen
          w-80 bg-[#202c33] border-r border-[#313d45] flex flex-col
          lg:block ${isOpen ? "block" : "hidden lg:block"}
        `}
      >
        {/* Mobile Close Button */}
        <button
          onClick={onClose}
          className="lg:hidden absolute top-4 right-4 p-2 text-gray-400 hover:text-white"
        >
          <X size={20} />
        </button>

        {/* User Profile Section */}
        <div className="p-4 border-b border-[#313d45]">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <img
                src={
                  user?.avatar_url ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || "User")}&background=8b5cf6&color=fff`
                }
                alt="Profile"
                className="w-10 h-10 rounded-full"
              />
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-[#202c33]"></div>
            </div>
            <div className="flex-1">
              <h3 className="text-white font-medium">
                {user?.name || "Loading..."}
              </h3>
              <p className="text-gray-400 text-sm">Online</p>
            </div>
            <div className="flex items-center space-x-1">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onAddUser}
                className="p-2 text-gray-400 hover:text-white hover:bg-[#2a3942] rounded-full"
                title="Add Contact"
              >
                <UserPlus size={16} />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleSignOut}
                className="p-2 text-gray-400 hover:text-white hover:bg-[#2a3942] rounded-full"
                title="Sign Out"
              >
                <LogOut size={16} />
              </motion.button>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <div className="flex-1 p-2">
          {menuItems.map((item) => (
            <motion.button
              key={item.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setActiveTab(item.id);
                if (window.innerWidth < 1024) onClose();
              }}
              className={`w-full flex items-center justify-between p-3 rounded-lg mb-1 transition-colors ${
                activeTab === item.id
                  ? "bg-[#8b5cf6] text-white"
                  : "text-gray-300 hover:bg-[#2a3942] hover:text-white"
              }`}
            >
              <div className="flex items-center space-x-3">
                <item.icon size={20} />
                <span className="font-medium">{item.label}</span>
              </div>
              {item.badge && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="bg-[#00d4aa] text-black text-xs font-bold px-2 py-1 rounded-full min-w-[20px] text-center"
                >
                  {item.badge}
                </motion.span>
              )}
            </motion.button>
          ))}
        </div>

        {/* User Status */}
        <div className="p-4 border-t border-[#313d45]">
          <div className="flex items-center space-x-2 text-green-500">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-sm">Online</span>
          </div>
        </div>
      </motion.div>
    </>
  );
}

// Chat Item Component
function ChatItem({ chat, isSelected, onClick }) {
  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    }
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02, backgroundColor: "#2a3942" }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`p-3 cursor-pointer border-b border-[#313d45] transition-colors ${
        isSelected ? "bg-[#2a3942]" : "hover:bg-[#2a3942]"
      }`}
    >
      <div className="flex items-center space-x-3">
        <div className="relative">
          <img
            src={chat.avatar}
            alt={chat.name}
            className="w-12 h-12 rounded-full"
          />
          {chat.isOnline && (
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-[#202c33]"></div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h4 className="font-medium text-white truncate">{chat.name}</h4>
            <div className="flex items-center space-x-1">
              <span className="text-xs text-gray-400">
                {formatTime(chat.lastMessageTime)}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 flex-1 min-w-0">
              <p className="text-sm text-gray-400 truncate">
                {chat.lastMessage}
              </p>
            </div>

            <div className="flex items-center space-x-2">
              {chat.unreadCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="bg-[#00d4aa] text-black text-xs font-bold px-2 py-1 rounded-full min-w-[20px] text-center"
                >
                  {chat.unreadCount}
                </motion.span>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// Chat List Component
function ChatList({ selectedChatId, setSelectedChatId, onSelectChat }) {
  const [searchQuery, setSearchQuery] = useState("");
  const { data: user } = useUser();

  // Fetch chats using React Query with authenticated user
  const {
    data: chats = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["chats", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const response = await fetch(`/api/chats?userId=${user.id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch chats");
      }
      return response.json();
    },
    enabled: !!user?.id,
    refetchInterval: 3000, // Poll every 3 seconds for real-time updates
  });

  const filteredChats = chats.filter(
    (chat) =>
      chat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      chat.lastMessage.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleChatSelect = (chat) => {
    setSelectedChatId(chat.id);
    onSelectChat(chat);
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-gray-400">Loading chats...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-red-400">Error loading chats</div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-[#313d45]">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-white">Chats</h2>
          <div className="flex items-center space-x-2">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-2 text-gray-400 hover:text-white hover:bg-[#2a3942] rounded-full"
            >
              <Camera size={20} />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-2 text-gray-400 hover:text-white hover:bg-[#2a3942] rounded-full"
            >
              <MoreVertical size={20} />
            </motion.button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={18}
          />
          <input
            type="text"
            placeholder="Search chats..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#2a3942] text-white pl-10 pr-4 py-2 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8b5cf6]"
          />
        </div>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">
        <AnimatePresence>
          {filteredChats.map((chat) => (
            <motion.div
              key={chat.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <ChatItem
                chat={chat}
                isSelected={selectedChatId === chat.id}
                onClick={() => handleChatSelect(chat)}
              />
            </motion.div>
          ))}
        </AnimatePresence>

        {filteredChats.length === 0 && (
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-400 text-center">
              <MessageCircle size={48} className="mx-auto mb-4 opacity-50" />
              {searchQuery ? "No chats found" : "No chats yet"}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Main App Component with Authentication
export default function ChatApp() {
  const [activeTab, setActiveTab] = useState("chats");
  const [selectedChatId, setSelectedChatId] = useState(null);
  const [selectedChat, setSelectedChat] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [addUserModalOpen, setAddUserModalOpen] = useState(false);
  const [callingModal, setCallingModal] = useState({
    isOpen: false,
    isVideo: false,
  });

  const { data: user, loading } = useUser();
  const queryClient = useQueryClient();

  // Redirect to signin if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      window.location.href = "/account/signin";
    }
  }, [user, loading]);

  const handleSelectChat = (chat) => {
    setSelectedChat(chat);
    if (window.innerWidth < 1024) {
      // Mobile: hide sidebar when chat is selected
      setSidebarOpen(false);
    }
  };

  const handleBackToChats = () => {
    setSelectedChatId(null);
    setSelectedChat(null);
  };

  const handleCall = (isVideo = false) => {
    setCallingModal({ isOpen: true, isVideo });
  };

  const handleCloseCall = () => {
    setCallingModal({ isOpen: false, isVideo: false });
  };

  const handleUserAdded = (newChat) => {
    // Refresh chats list
    queryClient.invalidateQueries(["chats"]);
    // Select the new chat
    setSelectedChat({
      id: newChat.id,
      name: newChat.name,
      targetUserId: newChat.targetUserId,
    });
    setSelectedChatId(newChat.id);
  };

  // Show loading screen while checking authentication
  if (loading) {
    return (
      <div className="h-screen bg-[#111b21] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8b5cf6] mx-auto mb-4"></div>
          <p className="text-white">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render if user is not authenticated (will redirect)
  if (!user) {
    return null;
  }

  return (
    <div className="h-screen bg-[#111b21] flex overflow-hidden">
      {/* Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onAddUser={() => setAddUserModalOpen(true)}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:flex-row">
        {/* Mobile Header */}
        <div className="lg:hidden bg-[#202c33] p-4 border-b border-[#313d45] flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 text-gray-400 hover:text-white rounded-full hover:bg-[#2a3942]"
          >
            <Menu size={20} />
          </button>
          <h1 className="text-white font-medium">GoponKotha</h1>
          <button
            onClick={() => setAddUserModalOpen(true)}
            className="p-2 text-gray-400 hover:text-white rounded-full hover:bg-[#2a3942]"
          >
            <UserPlus size={20} />
          </button>
        </div>

        {/* Chat List - Hidden on mobile when chat is selected */}
        <div
          className={`
          w-full lg:w-96 bg-[#111b21] border-r border-[#313d45]
          ${selectedChat && window.innerWidth < 1024 ? "hidden" : "block"}
        `}
        >
          {activeTab === "chats" && (
            <ChatList
              selectedChatId={selectedChatId}
              setSelectedChatId={setSelectedChatId}
              onSelectChat={handleSelectChat}
            />
          )}
          {activeTab !== "chats" && (
            <div className="flex items-center justify-center h-full">
              <div className="text-gray-400 text-center">
                <div className="text-xl mb-2 capitalize">{activeTab}</div>
                <div className="text-sm">Coming soon...</div>
              </div>
            </div>
          )}
        </div>

        {/* Chat Interface */}
        <div
          className={`
          flex-1 bg-[#0b141a] 
          ${!selectedChat && window.innerWidth < 1024 ? "hidden" : "flex"}
        `}
        >
          {selectedChat ? (
            <ChatInterface
              chatId={selectedChat.id}
              chatName={selectedChat.name}
              onBack={handleBackToChats}
              onCall={() => handleCall(false)}
              onVideoCall={() => handleCall(true)}
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <MessageCircle
                  size={64}
                  className="mx-auto mb-4 text-[#8b5cf6] opacity-50"
                />
                <h3 className="text-xl text-white mb-2">
                  Welcome {user.name}!
                </h3>
                <p className="text-gray-400">
                  Select a chat to start messaging
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add User Modal */}
      <AnimatePresence>
        {addUserModalOpen && (
          <AddUserModal
            isOpen={addUserModalOpen}
            onClose={() => setAddUserModalOpen(false)}
            onUserAdded={handleUserAdded}
          />
        )}
      </AnimatePresence>

      {/* Calling Modal */}
      <AnimatePresence>
        {callingModal.isOpen && (
          <WebRTCCallingModal
            isOpen={callingModal.isOpen}
            onClose={handleCloseCall}
            chatName={selectedChat?.name || "Unknown"}
            isVideo={callingModal.isVideo}
            targetUserId={selectedChat?.targetUserId || 2}
          />
        )}
      </AnimatePresence>

      {/* Global Styles for Animations */}
      <style jsx global>{`
        /* Custom scrollbar */
        ::-webkit-scrollbar {
          width: 6px;
        }
        ::-webkit-scrollbar-track {
          background: #202c33;
        }
        ::-webkit-scrollbar-thumb {
          background: #8b5cf6;
          border-radius: 3px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: #7c3aed;
        }

        /* Smooth transitions */
        * {
          transition: all 0.2s ease;
        }

        /* Hide scrollbar for Firefox */
        * {
          scrollbar-width: thin;
          scrollbar-color: #8b5cf6 #202c33;
        }

        /* Responsive adjustments */
        @media (max-width: 1024px) {
          .h-screen {
            height: 100vh;
            height: 100dvh; /* Dynamic viewport height for mobile */
          }
        }
      `}</style>
    </div>
  );
}
