import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  text: string;
  timestamp: Date;
  status: "sent" | "delivered" | "read";
  type: "text" | "image" | "audio" | "file";
  replyTo?: string;
  edited?: boolean;
  editedAt?: Date;
}

export interface Chat {
  id: string;
  participants: string[];
  isGroup: boolean;
  name?: string;
  avatar?: string;
  createdAt: Date;
  lastMessage?: string;
  lastMessageTime?: Date;
}

export interface ChatWithDetails extends Chat {
  unreadCount: number;
  participantNames: string[];
  isOnline: boolean;
}

interface MessagingContextType {
  chats: ChatWithDetails[];
  currentChatId: string | null;
  messages: Message[];
  isLoading: boolean;
  sendMessage: (chatId: string, text: string, type?: Message['type']) => Promise<boolean>;
  loadChats: () => Promise<void>;
  loadMessages: (chatId: string) => Promise<void>;
  createChat: (participantId: string, isGroup?: boolean, name?: string) => Promise<string | null>;
  markAsRead: (chatId: string) => Promise<void>;
  deleteMessage: (messageId: string) => Promise<boolean>;
  editMessage: (messageId: string, text: string) => Promise<boolean>;
  typingUsers: string[];
  setTyping: (isTyping: boolean) => void;
}

const MessagingContext = createContext<MessagingContextType | undefined>(undefined);

export function MessagingProvider({ children }: { children: ReactNode }) {
  const [chats, setChats] = useState<ChatWithDetails[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  
  const { user } = useAuth();

  // Simulate real-time updates with polling
  useEffect(() => {
    if (user) {
      loadChats();
      loadUsers();
      
      // Poll for updates every 3 seconds (in production, use WebSocket)
      const interval = setInterval(() => {
        loadChats();
        if (currentChatId) {
          loadMessages(currentChatId);
        }
      }, 3000);
      
      return () => clearInterval(interval);
    }
  }, [user, currentChatId]);

  const getAuthHeaders = () => {
    const sessionId = localStorage.getItem('goponkotha_session');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${sessionId}`
    };
  };

  const loadUsers = async () => {
    try {
      const response = await fetch('/api/auth/users', {
        headers: getAuthHeaders()
      });
      const data = await response.json();
      if (data.success) {
        setUsers(data.users);
      }
    } catch (error) {
      console.error('Failed to load users:', error);
    }
  };

  const loadChats = async () => {
    try {
      const response = await fetch('/api/chats', {
        headers: getAuthHeaders()
      });
      const data = await response.json();
      
      if (data.success) {
        // Enhance chats with additional details
        const enhancedChats = data.chats.map((chat: Chat) => {
          const otherParticipants = chat.participants.filter(p => p !== user?.id);
          const participantData = users.filter(u => otherParticipants.includes(u.id));
          
          return {
            ...chat,
            unreadCount: Math.floor(Math.random() * 5), // Simulate unread count
            participantNames: participantData.map(u => u.username || u.email),
            isOnline: participantData.some(u => u.isOnline)
          };
        });
        
        setChats(enhancedChats);
      }
    } catch (error) {
      console.error('Failed to load chats:', error);
    }
  };

  const loadMessages = async (chatId: string) => {
    setCurrentChatId(chatId);
    setIsLoading(true);
    
    try {
      const response = await fetch(`/api/messages/${chatId}`, {
        headers: getAuthHeaders()
      });
      const data = await response.json();
      
      if (data.success) {
        const formattedMessages = data.messages.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }));
        setMessages(formattedMessages);
      }
    } catch (error) {
      console.error('Failed to load messages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async (chatId: string, text: string, type: Message['type'] = 'text'): Promise<boolean> => {
    try {
      const response = await fetch('/api/messages/send', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ chatId, text, type })
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Add message to local state immediately for instant feedback
        const newMessage: Message = {
          ...data.message,
          timestamp: new Date(data.message.timestamp)
        };
        setMessages(prev => [...prev, newMessage]);
        
        // Update chat's last message
        setChats(prev => prev.map(chat => 
          chat.id === chatId 
            ? { ...chat, lastMessage: text, lastMessageTime: new Date() }
            : chat
        ));
        
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to send message:', error);
      return false;
    }
  };

  const createChat = async (participantId: string, isGroup: boolean = false, name?: string): Promise<string | null> => {
    try {
      const response = await fetch('/api/chats', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ participantId, isGroup, name })
      });
      
      const data = await response.json();
      
      if (data.success) {
        await loadChats(); // Refresh chat list
        return data.chat.id;
      }
      return null;
    } catch (error) {
      console.error('Failed to create chat:', error);
      return null;
    }
  };

  const markAsRead = async (chatId: string) => {
    try {
      await fetch(`/api/messages/read/${chatId}`, {
        method: 'POST',
        headers: getAuthHeaders()
      });
      
      // Update local unread count
      setChats(prev => prev.map(chat => 
        chat.id === chatId ? { ...chat, unreadCount: 0 } : chat
      ));
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const deleteMessage = async (messageId: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/messages/${messageId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      
      const data = await response.json();
      
      if (data.success) {
        setMessages(prev => prev.filter(msg => msg.id !== messageId));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to delete message:', error);
      return false;
    }
  };

  const editMessage = async (messageId: string, text: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/messages/${messageId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ text })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setMessages(prev => prev.map(msg => 
          msg.id === messageId 
            ? { ...msg, text, edited: true, editedAt: new Date() }
            : msg
        ));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to edit message:', error);
      return false;
    }
  };

  const setTyping = (isTyping: boolean) => {
    // Simulate typing indicator (in production, use WebSocket)
    if (isTyping && user) {
      setTypingUsers(prev => [...prev.filter(id => id !== user.id), user.id]);
      setTimeout(() => {
        setTypingUsers(prev => prev.filter(id => id !== user.id));
      }, 3000);
    }
  };

  return (
    <MessagingContext.Provider value={{
      chats,
      currentChatId,
      messages,
      isLoading,
      sendMessage,
      loadChats,
      loadMessages,
      createChat,
      markAsRead,
      deleteMessage,
      editMessage,
      typingUsers,
      setTyping
    }}>
      {children}
    </MessagingContext.Provider>
  );
}

export function useMessaging() {
  const context = useContext(MessagingContext);
  if (context === undefined) {
    throw new Error('useMessaging must be used within a MessagingProvider');
  }
  return context;
}
