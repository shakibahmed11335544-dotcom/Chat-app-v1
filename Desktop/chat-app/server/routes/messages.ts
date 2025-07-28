import { RequestHandler } from "express";
import { z } from "zod";
import { getUserBySession } from "./auth";

// Message data store
const messages = new Map<string, {
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
}>();

// Chat data store
const chats = new Map<string, {
  id: string;
  participants: string[];
  isGroup: boolean;
  name?: string;
  avatar?: string;
  createdAt: Date;
  lastMessage?: string;
  lastMessageTime?: Date;
}>();

const sendMessageSchema = z.object({
  chatId: z.string(),
  text: z.string().min(1),
  type: z.enum(["text", "image", "audio", "file"]).default("text"),
  replyTo: z.string().optional()
});

export const handleSendMessage: RequestHandler = (req, res) => {
  const sessionId = req.headers.authorization?.replace('Bearer ', '');
  const user = getUserBySession(sessionId || '');
  
  if (!user) {
    return res.status(401).json({ success: false, message: "Not authenticated" });
  }
  
  try {
    const messageData = sendMessageSchema.parse(req.body);
    
    // Check if chat exists and user is participant
    const chat = chats.get(messageData.chatId);
    if (!chat || !chat.participants.includes(user.id)) {
      return res.status(403).json({ success: false, message: "Not authorized to send message to this chat" });
    }
    
    const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newMessage = {
      id: messageId,
      chatId: messageData.chatId,
      senderId: user.id,
      text: messageData.text,
      timestamp: new Date(),
      status: "sent" as const,
      type: messageData.type,
      replyTo: messageData.replyTo,
      edited: false
    };
    
    messages.set(messageId, newMessage);
    
    // Update chat last message
    chat.lastMessage = messageData.text;
    chat.lastMessageTime = new Date();
    
    res.json({ success: true, message: newMessage });
    
  } catch (error) {
    res.status(400).json({ 
      success: false, 
      message: error instanceof z.ZodError ? error.errors[0].message : "Failed to send message" 
    });
  }
};

export const handleGetMessages: RequestHandler = (req, res) => {
  const sessionId = req.headers.authorization?.replace('Bearer ', '');
  const user = getUserBySession(sessionId || '');
  
  if (!user) {
    return res.status(401).json({ success: false, message: "Not authenticated" });
  }
  
  const { chatId } = req.params;
  const chat = chats.get(chatId);
  
  if (!chat || !chat.participants.includes(user.id)) {
    return res.status(403).json({ success: false, message: "Not authorized to view this chat" });
  }
  
  const chatMessages = Array.from(messages.values())
    .filter(msg => msg.chatId === chatId)
    .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  
  res.json({ success: true, messages: chatMessages });
};

export const handleGetChats: RequestHandler = (req, res) => {
  const sessionId = req.headers.authorization?.replace('Bearer ', '');
  const user = getUserBySession(sessionId || '');
  
  if (!user) {
    return res.status(401).json({ success: false, message: "Not authenticated" });
  }
  
  const userChats = Array.from(chats.values())
    .filter(chat => chat.participants.includes(user.id))
    .sort((a, b) => {
      const aTime = a.lastMessageTime?.getTime() || a.createdAt.getTime();
      const bTime = b.lastMessageTime?.getTime() || b.createdAt.getTime();
      return bTime - aTime;
    });
  
  res.json({ success: true, chats: userChats });
};

export const handleCreateChat: RequestHandler = (req, res) => {
  const sessionId = req.headers.authorization?.replace('Bearer ', '');
  const user = getUserBySession(sessionId || '');
  
  if (!user) {
    return res.status(401).json({ success: false, message: "Not authenticated" });
  }
  
  const { participantId, isGroup, name } = req.body;
  
  if (!isGroup) {
    // Check if chat already exists between these two users
    const existingChat = Array.from(chats.values()).find(chat => 
      !chat.isGroup && 
      chat.participants.includes(user.id) && 
      chat.participants.includes(participantId)
    );
    
    if (existingChat) {
      return res.json({ success: true, chat: existingChat });
    }
  }
  
  const chatId = `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const participants = isGroup ? [user.id, ...req.body.participants] : [user.id, participantId];
  
  const newChat = {
    id: chatId,
    participants,
    isGroup: !!isGroup,
    name: isGroup ? name : undefined,
    createdAt: new Date()
  };
  
  chats.set(chatId, newChat);
  
  res.json({ success: true, chat: newChat });
};

export const handleDeleteMessage: RequestHandler = (req, res) => {
  const sessionId = req.headers.authorization?.replace('Bearer ', '');
  const user = getUserBySession(sessionId || '');
  
  if (!user) {
    return res.status(401).json({ success: false, message: "Not authenticated" });
  }
  
  const { messageId } = req.params;
  const message = messages.get(messageId);
  
  if (!message) {
    return res.status(404).json({ success: false, message: "Message not found" });
  }
  
  if (message.senderId !== user.id) {
    return res.status(403).json({ success: false, message: "Not authorized to delete this message" });
  }
  
  messages.delete(messageId);
  
  res.json({ success: true, message: "Message deleted successfully" });
};

export const handleEditMessage: RequestHandler = (req, res) => {
  const sessionId = req.headers.authorization?.replace('Bearer ', '');
  const user = getUserBySession(sessionId || '');
  
  if (!user) {
    return res.status(401).json({ success: false, message: "Not authenticated" });
  }
  
  const { messageId } = req.params;
  const { text } = req.body;
  const message = messages.get(messageId);
  
  if (!message) {
    return res.status(404).json({ success: false, message: "Message not found" });
  }
  
  if (message.senderId !== user.id) {
    return res.status(403).json({ success: false, message: "Not authorized to edit this message" });
  }
  
  message.text = text;
  message.edited = true;
  message.editedAt = new Date();
  
  res.json({ success: true, message });
};

export const handleMarkAsRead: RequestHandler = (req, res) => {
  const sessionId = req.headers.authorization?.replace('Bearer ', '');
  const user = getUserBySession(sessionId || '');
  
  if (!user) {
    return res.status(401).json({ success: false, message: "Not authenticated" });
  }
  
  const { chatId } = req.params;
  
  // Mark all messages in chat as read
  Array.from(messages.values())
    .filter(msg => msg.chatId === chatId && msg.senderId !== user.id)
    .forEach(msg => {
      msg.status = "read";
    });
  
  res.json({ success: true, message: "Messages marked as read" });
};

// Initialize some demo data
export const initializeDemoData = () => {
  // Create demo chat
  const demoChatId = "demo_chat_1";
  chats.set(demoChatId, {
    id: demoChatId,
    participants: ["demo_user_1", "demo_user_2"],
    isGroup: false,
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    lastMessage: "Hey! How are you doing?",
    lastMessageTime: new Date(Date.now() - 2 * 60 * 60 * 1000)
  });
  
  // Create demo messages
  const demoMessages = [
    {
      id: "demo_msg_1",
      chatId: demoChatId,
      senderId: "demo_user_2",
      text: "Hey! How are you doing?",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      status: "read" as const,
      type: "text" as const,
      edited: false
    },
    {
      id: "demo_msg_2",
      chatId: demoChatId,
      senderId: "demo_user_1",
      text: "I'm doing great! Just working on the new GoponKotha app",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000 + 60000),
      status: "read" as const,
      type: "text" as const,
      edited: false
    }
  ];
  
  demoMessages.forEach(msg => messages.set(msg.id, msg));
};
