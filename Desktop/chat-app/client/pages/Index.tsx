import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  MoreVertical,
  Check,
  CheckCheck,
  Mic,
  Camera,
  Paperclip,
  MessageCircle,
  Plus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NewChatDialog } from "@/components/NewChatDialog";
import { useMessaging } from "@/contexts/MessagingContext";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

export default function Index() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showNewChat, setShowNewChat] = useState(false);
  const { chats, loadChats, markAsRead } = useMessaging();
  const { user } = useAuth();

  useEffect(() => {
    loadChats();
  }, []);

  const filteredChats = chats.filter(chat => {
    const chatName = chat.name || chat.participantNames.join(', ');
    return chatName.toLowerCase().includes(searchQuery.toLowerCase()) ||
           (chat.lastMessage && chat.lastMessage.toLowerCase().includes(searchQuery.toLowerCase()));
  });

  const formatTime = (date?: Date) => {
    if (!date) return '';
    const now = new Date();
    const messageDate = new Date(date);
    const diffInHours = (now.getTime() - messageDate.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 24 * 7) {
      return messageDate.toLocaleDateString([], { weekday: 'short' });
    } else {
      return messageDate.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  const getChatAvatar = (chat: any) => {
    if (chat.avatar) return chat.avatar;
    if (chat.name) return chat.name.split(' ').map((n: string) => n[0]).join('').toUpperCase();
    return chat.participantNames[0]?.split(' ').map((n: string) => n[0]).join('').toUpperCase() || 'U';
  };

  const getChatName = (chat: any) => {
    return chat.name || chat.participantNames.join(', ') || 'Unknown Chat';
  };



  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h2 className="text-2xl font-semibold">Chats</h2>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full icon-btn-hover">
            <Camera className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full icon-btn-hover">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search or start new chat"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-muted border-0 focus-visible:ring-1 focus-visible:ring-primary"
          />
        </div>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">
        {filteredChats.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <MessageCircle className="w-16 h-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">
              {searchQuery ? "No chats found" : "No conversations yet"}
            </h3>
            <p className="text-muted-foreground">
              {searchQuery
                ? "Try adjusting your search terms"
                : "Start a new conversation to begin messaging"
              }
            </p>
          </div>
        ) : (
          <div className="space-y-0">
            {filteredChats.map((chat, index) => (
              <Link
                key={chat.id}
                to={`/chat/${chat.id}`}
                onClick={() => markAsRead(chat.id)}
                className="flex items-center gap-3 p-4 hover:bg-muted/50 btn-hover-scale border-b border-border/50 group"
              >
                {/* Avatar */}
                <div className="relative">
                  <div className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold",
                    chat.isGroup
                      ? "bg-gradient-to-br from-blue-500 to-purple-600"
                      : "bg-gradient-to-br from-primary to-accent"
                  )}>
                    {getChatAvatar(chat)}
                  </div>
                  {chat.isOnline && (
                    <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-online-indicator border-2 border-background rounded-full"></div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-medium text-foreground truncate group-hover:text-primary transition-colors">
                      {getChatName(chat)}
                    </h3>
                    <div className="flex items-center gap-1">
                      <span className="text-sm text-muted-foreground">
                        {formatTime(chat.lastMessageTime)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground truncate">
                      {chat.lastMessage || "No messages yet"}
                    </p>
                    {chat.unreadCount > 0 && (
                      <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full min-w-[20px] text-center animate-bounce-in">
                        {chat.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Floating Action Button */}
      <div className="absolute bottom-6 right-6">
        <Button
          size="icon"
          className="h-14 w-14 rounded-full shadow-lg hover:shadow-2xl btn-hover-scale bg-gradient-to-r from-primary to-accent"
          onClick={() => setShowNewChat(true)}
        >
          <Plus className="h-6 w-6" />
        </Button>
      </div>

      {/* New Chat Dialog */}
      <NewChatDialog open={showNewChat} onOpenChange={setShowNewChat} />
    </div>
  );
}
