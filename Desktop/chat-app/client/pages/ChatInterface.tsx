import { useState, useRef, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Phone,
  Video,
  MoreVertical,
  Smile,
  Paperclip,
  Mic,
  Send,
  Check,
  CheckCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useMessaging } from "@/contexts/MessagingContext";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

export default function ChatInterface() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { user } = useAuth();
  const {
    messages,
    chats,
    loadMessages,
    sendMessage,
    setTyping,
    typingUsers
  } = useMessaging();

  const currentChat = chats.find(chat => chat.id === id);

  useEffect(() => {
    if (id) {
      loadMessages(id);
    }
  }, [id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!currentChat && chats.length > 0) {
      // Chat not found, redirect to home
      navigate('/');
    }
  }, [currentChat, chats, navigate]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async () => {
    if (message.trim() && id) {
      const success = await sendMessage(id, message);
      if (success) {
        setMessage("");
        setIsTyping(false);
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
    if (!isTyping && e.target.value) {
      setIsTyping(true);
      setTyping(true);
    } else if (isTyping && !e.target.value) {
      setIsTyping(false);
    }
  };

  const getStatusIcon = (status: "sent" | "delivered" | "read") => {
    switch (status) {
      case "sent":
        return <Check className="w-3 h-3 text-muted-foreground" />;
      case "delivered":
        return <CheckCheck className="w-3 h-3 text-muted-foreground" />;
      case "read":
        return <CheckCheck className="w-3 h-3 text-primary" />;
      default:
        return null;
    }
  };

  const formatMessageTime = (timestamp: Date) => {
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getChatName = () => {
    if (!currentChat) return 'Unknown Chat';
    return currentChat.name || currentChat.participantNames.join(', ');
  };

  const getChatAvatar = () => {
    if (!currentChat) return 'U';
    if (currentChat.avatar) return currentChat.avatar;
    if (currentChat.name) return currentChat.name.split(' ').map(n => n[0]).join('').toUpperCase();
    return currentChat.participantNames[0]?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U';
  };

  if (!currentChat) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl font-semibold text-muted-foreground">?</span>
          </div>
          <h3 className="text-lg font-semibold mb-2">Chat not found</h3>
          <p className="text-muted-foreground">This conversation may have been deleted.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-border bg-card">
        <Link to="/">
          <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full icon-btn-hover">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        
        <div className="flex items-center gap-3 flex-1">
          <div className="relative">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center text-white font-semibold">
              {getChatAvatar()}
            </div>
            {currentChat.isOnline && (
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-online-indicator border-2 border-background rounded-full"></div>
            )}
          </div>

          <div className="flex-1">
            <h3 className="font-semibold text-foreground">{getChatName()}</h3>
            <p className="text-sm text-muted-foreground">
              {typingUsers.length > 0 ? "Typing..." : currentChat.isOnline ? "Online" : "Last seen recently"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-full icon-btn-hover"
            onClick={() => {
              // TODO: Start video call
              console.log('Video call clicked');
            }}
          >
            <Video className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-full icon-btn-hover"
            onClick={() => {
              // TODO: Start audio call
              console.log('Audio call clicked');
            }}
          >
            <Phone className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full icon-btn-hover">
            <MoreVertical className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, index) => {
          const isOwn = msg.senderId === user?.id;
          return (
            <div
              key={msg.id}
              className={cn(
                "flex",
                isOwn ? "justify-end" : "justify-start"
              )}
            >
              <div
                className={cn(
                  "max-w-[70%] rounded-2xl px-4 py-2 shadow-sm",
                  isOwn
                    ? "bg-chat-bubble-own text-primary-foreground rounded-br-md"
                    : "bg-chat-bubble-other text-foreground rounded-bl-md"
                )}
              >
                <p className="text-sm leading-relaxed">{msg.text}</p>
                <div className={cn(
                  "flex items-center gap-1 mt-1",
                  isOwn ? "justify-end" : "justify-start"
                )}>
                  <span className={cn(
                    "text-xs",
                    isOwn ? "text-primary-foreground/70" : "text-muted-foreground"
                  )}>
                    {formatMessageTime(msg.timestamp)}
                  </span>
                  {isOwn && getStatusIcon(msg.status)}
                  {msg.edited && (
                    <span className="text-xs text-muted-foreground ml-1">(edited)</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-border bg-card">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 rounded-full shrink-0 icon-btn-hover"
            onClick={() => {
              // TODO: File attachment
              console.log('File attachment clicked');
            }}
          >
            <Paperclip className="h-5 w-5" />
          </Button>
          
          <div className="flex-1 relative">
            <Input
              placeholder="Type a message..."
              value={message}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              className="bg-chat-input border-0 rounded-full pr-12 focus-visible:ring-1 focus-visible:ring-primary transition-all duration-200 ease-ios focus:scale-[1.02]"
            />
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 rounded-full icon-btn-hover"
              onClick={() => {
                // TODO: Emoji picker
                console.log('Emoji picker clicked');
              }}
            >
              <Smile className="h-4 w-4" />
            </Button>
          </div>

          {message.trim() ? (
            <Button
              onClick={handleSendMessage}
              size="icon"
              className="h-10 w-10 rounded-full shrink-0 btn-hover-scale shadow-lg hover:shadow-xl bg-gradient-to-r from-primary to-accent"
            >
              <Send className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-full shrink-0 icon-btn-hover"
              onClick={() => {
                // TODO: Voice recording
                console.log('Voice recording clicked');
              }}
            >
              <Mic className="h-5 w-5" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
