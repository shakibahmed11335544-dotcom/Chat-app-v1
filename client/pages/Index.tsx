import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { toast } from "@/hooks/use-toast";
import { 
  Search, 
  MoreVertical, 
  Phone, 
  Video, 
  Smile, 
  Paperclip, 
  Mic, 
  Send,
  Moon,
  Sun,
  MessageCircle,
  Users,
  Settings,
  Archive,
  CheckCheck,
  Check,
  ArrowLeft,
  Menu,
  Plus,
  UserPlus,
  Bell,
  Shield,
  Palette,
  Globe,
  HelpCircle,
  LogOut,
  Edit3,
  Camera,
  PhoneCall,
  VideoIcon,
  PhoneOff,
  MicOff,
  Volume2,
  Minimize2,
  X,
  Crown,
  Star,
  Trash2,
  Pin,
  PinOff,
  UserCheck,
  UserX,
  Clock,
  AlertCircle,
  FileImage,
  FileText,
  Download,
  Play,
  Pause,
  PhoneIncoming,
  PhoneOutgoing
} from "lucide-react";
import { cn } from "@/lib/utils";

interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  phone: string;
  avatar: string;
  isOnline: boolean;
  lastSeen: string;
  about: string;
}

interface FriendRequest {
  id: string;
  from: User;
  to: User;
  status: 'pending' | 'accepted' | 'rejected';
  messagesSent: number;
  maxMessages: number;
  timestamp: string;
}

interface Chat {
  id: string;
  user: User;
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
  isPinned: boolean;
  isMuted: boolean;
  chatType: 'personal' | 'group';
  friendRequest?: FriendRequest;
}

interface Message {
  id: string;
  text?: string;
  timestamp: string;
  sender: 'me' | 'other';
  status?: 'sent' | 'delivered' | 'read';
  type: 'text' | 'emoji' | 'file' | 'voice';
  fileUrl?: string;
  fileName?: string;
  fileSize?: string;
  duration?: number;
}

interface CallState {
  isActive: boolean;
  type: 'voice' | 'video';
  user: User | null;
  duration: number;
  isMinimized: boolean;
  status: 'calling' | 'connecting' | 'connected' | 'ending';
  isIncoming: boolean;
  isMuted: boolean;
  isCameraOff: boolean;
}

interface SwipeState {
  chatId: string | null;
  translateX: number;
  isDragging: boolean;
  startX: number;
}

const currentUser: User = {
  id: 'me',
  name: 'Najmus Salehin Sakib',
  username: 'sakib',
  email: 'sakib@example.com',
  phone: '+8801234567890',
  avatar: '',
  isOnline: true,
  lastSeen: 'now',
  about: 'Creator of GoponKotha - Premium Chat Experience'
};

// Comprehensive emoji data
const emojiCategories = {
  'Smileys': ['😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓'],
  'Gestures': ['👍', '👎', '👌', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '🖕', '👇', '☝️', '👋', '🤚', '🖐️', '✋', '👏', '🙌', '👐', '🤲', '🤝', '🙏'],
  'Hearts': ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟'],
  'Animals': ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🐔', '🐧', '🐦', '🐤', '🦆', '🦅', '🦉', '🦇', '🐺', '🐗'],
  'Food': ['🍎', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🫐', '🍈', '🍒', '🍑', '🥭', '🍍', '🥥', '🥝', '🍅', '🍆', '🥑', '🥦', '🥬', '🥒', '🌶️', '🫒', '🌽', '🥕', '🫒', '🧄', '🧅', '🥔']
};

export default function Index() {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [message, setMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [chats, setChats] = useState<Chat[]>([]);
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isUserSearchOpen, setIsUserSearchOpen] = useState(false);
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
  const [callState, setCallState] = useState<CallState>({
    isActive: false,
    type: 'voice',
    user: null,
    duration: 0,
    isMinimized: false,
    status: 'calling',
    isIncoming: false,
    isMuted: false,
    isCameraOff: false
  });
  const [currentUserProfile, setCurrentUserProfile] = useState<User>(currentUser);
  const [swipeState, setSwipeState] = useState<SwipeState>({
    chatId: null,
    translateX: 0,
    isDragging: false,
    startX: 0
  });
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);

  // Mock users for search
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const chatListRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Mock user search functionality
  useEffect(() => {
    if (userSearchQuery.trim()) {
      const mockUsers: User[] = [
        {
          id: '1',
          name: 'Rahman Ahmed',
          username: 'rahman_a',
          email: 'rahman@example.com',
          phone: '+8801234567891',
          avatar: '',
          isOnline: true,
          lastSeen: '2 minutes ago',
          about: 'Software Engineer at TechCorp'
        },
        {
          id: '2',
          name: 'Fatima Khan',
          username: 'fatima_k',
          email: 'fatima.khan@example.com',
          phone: '+8801234567892',
          avatar: '',
          isOnline: false,
          lastSeen: '1 hour ago',
          about: 'Designer and Creative Director'
        },
        {
          id: '3',
          name: 'Arif Hassan',
          username: 'arif_h',
          email: 'arif.hassan@example.com',
          phone: '+8801234567893',
          avatar: '',
          isOnline: true,
          lastSeen: 'just now',
          about: 'Product Manager at StartupXYZ'
        }
      ];

      const filtered = mockUsers.filter(user => 
        user.name.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
        user.username.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
        user.phone.includes(userSearchQuery)
      );
      setSearchResults(filtered);
    } else {
      setSearchResults([]);
    }
  }, [userSearchQuery]);

  // Call timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (callState.isActive && callState.status === 'connected') {
      interval = setInterval(() => {
        setCallState(prev => ({ ...prev, duration: prev.duration + 1 }));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [callState.isActive, callState.status]);

  // Recording timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
    } else {
      setRecordingDuration(0);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  // Simulate incoming call
  const simulateIncomingCall = (user: User, type: 'voice' | 'video') => {
    setCallState({
      isActive: true,
      type,
      user,
      duration: 0,
      isMinimized: false,
      status: 'calling',
      isIncoming: true,
      isMuted: false,
      isCameraOff: false
    });

    // Play ringtone simulation
    toast({
      title: `Incoming ${type} call`,
      description: `${user.name} is calling you...`,
    });
  };

  const startCall = (user: User, type: 'voice' | 'video') => {
    setCallState({
      isActive: true,
      type,
      user,
      duration: 0,
      isMinimized: false,
      status: 'calling',
      isIncoming: false,
      isMuted: false,
      isCameraOff: false
    });

    // Simulate call connecting after 2 seconds
    setTimeout(() => {
      setCallState(prev => ({ ...prev, status: 'connecting' }));
      setTimeout(() => {
        setCallState(prev => ({ ...prev, status: 'connected' }));
        toast({
          title: "Call connected",
          description: `Connected to ${user.name}`,
        });
      }, 1500);
    }, 2000);
  };

  const answerCall = () => {
    setCallState(prev => ({ ...prev, status: 'connecting', isIncoming: false }));
    setTimeout(() => {
      setCallState(prev => ({ ...prev, status: 'connected' }));
      toast({
        title: "Call answered",
        description: "You are now connected",
      });
    }, 1000);
  };

  const endCall = () => {
    setCallState(prev => ({ ...prev, status: 'ending' }));
    setTimeout(() => {
      setCallState({
        isActive: false,
        type: 'voice',
        user: null,
        duration: 0,
        isMinimized: false,
        status: 'calling',
        isIncoming: false,
        isMuted: false,
        isCameraOff: false
      });
    }, 500);
  };

  const toggleMute = () => {
    setCallState(prev => ({ ...prev, isMuted: !prev.isMuted }));
    toast({
      title: callState.isMuted ? "Unmuted" : "Muted",
      description: `Microphone ${callState.isMuted ? 'enabled' : 'disabled'}`,
    });
  };

  const toggleCamera = () => {
    setCallState(prev => ({ ...prev, isCameraOff: !prev.isCameraOff }));
    toast({
      title: callState.isCameraOff ? "Camera on" : "Camera off",
      description: `Camera ${callState.isCameraOff ? 'enabled' : 'disabled'}`,
    });
  };

  const formatCallDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatRecordingDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const sendFriendRequest = (user: User) => {
    const newRequest: FriendRequest = {
      id: Date.now().toString(),
      from: currentUser,
      to: user,
      status: 'pending',
      messagesSent: 0,
      maxMessages: 3,
      timestamp: new Date().toISOString()
    };
    
    setFriendRequests(prev => [...prev, newRequest]);
    
    const newChat: Chat = {
      id: Date.now().toString(),
      user,
      lastMessage: '',
      timestamp: 'now',
      unreadCount: 0,
      isPinned: false,
      isMuted: false,
      chatType: 'personal',
      friendRequest: newRequest
    };
    
    setChats(prev => [newChat, ...prev]);
    setSelectedChat(newChat);
    setMessages([]);
    setIsUserSearchOpen(false);
    setIsMobileMenuOpen(false);

    toast({
      title: "Friend request sent",
      description: `You can send up to 3 messages to ${user.name} before they accept your request.`,
    });
  };

  const sendMessage = () => {
    if (!message.trim() || !selectedChat) return;
    
    const friendRequest = selectedChat.friendRequest;
    
    if (friendRequest && friendRequest.status === 'pending' && friendRequest.messagesSent >= friendRequest.maxMessages) {
      toast({
        title: "Message limit reached",
        description: "You've reached the 3 message limit. Wait for them to accept your friend request.",
        variant: "destructive"
      });
      return;
    }
    
    const newMessage: Message = {
      id: Date.now().toString(),
      text: message,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      sender: 'me',
      status: 'sent',
      type: 'text'
    };
    
    setMessages(prev => [...prev, newMessage]);
    setMessage('');
    
    // Update friend request message count
    if (friendRequest && friendRequest.status === 'pending') {
      const updatedRequest = { ...friendRequest, messagesSent: friendRequest.messagesSent + 1 };
      setFriendRequests(prev => prev.map(req => 
        req.id === friendRequest.id ? updatedRequest : req
      ));
      setChats(prev => prev.map(chat => 
        chat.id === selectedChat.id ? { ...chat, friendRequest: updatedRequest, lastMessage: message } : chat
      ));
    } else {
      setChats(prev => prev.map(chat => 
        chat.id === selectedChat.id ? { ...chat, lastMessage: message } : chat
      ));
    }

    // Simulate message delivery and read status
    setTimeout(() => {
      setMessages(prev => prev.map(msg => 
        msg.id === newMessage.id ? { ...msg, status: 'delivered' } : msg
      ));
    }, 1000);

    setTimeout(() => {
      setMessages(prev => prev.map(msg => 
        msg.id === newMessage.id ? { ...msg, status: 'read' } : msg
      ));
    }, 3000);
  };

  const sendEmoji = (emoji: string) => {
    if (!selectedChat) return;
    
    const newMessage: Message = {
      id: Date.now().toString(),
      text: emoji,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      sender: 'me',
      status: 'sent',
      type: 'emoji'
    };
    
    setMessages(prev => [...prev, newMessage]);
    setIsEmojiPickerOpen(false);
    
    setChats(prev => prev.map(chat => 
      chat.id === selectedChat.id ? { ...chat, lastMessage: emoji } : chat
    ));
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !selectedChat) return;

    const fileMessage: Message = {
      id: Date.now().toString(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      sender: 'me',
      status: 'sent',
      type: 'file',
      fileName: file.name,
      fileSize: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
      fileUrl: URL.createObjectURL(file)
    };

    setMessages(prev => [...prev, fileMessage]);
    setChats(prev => prev.map(chat => 
      chat.id === selectedChat.id ? { ...chat, lastMessage: `📎 ${file.name}` } : chat
    ));

    toast({
      title: "File uploaded",
      description: `${file.name} has been sent.`,
    });
  };

  const startVoiceRecording = () => {
    setIsRecording(true);
    toast({
      title: "Recording started",
      description: "Speak your message...",
    });
  };

  const stopVoiceRecording = () => {
    if (!selectedChat) return;
    
    setIsRecording(false);
    
    const voiceMessage: Message = {
      id: Date.now().toString(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      sender: 'me',
      status: 'sent',
      type: 'voice',
      duration: recordingDuration
    };

    setMessages(prev => [...prev, voiceMessage]);
    setChats(prev => prev.map(chat => 
      chat.id === selectedChat.id ? { ...chat, lastMessage: `🎤 Voice message (${formatRecordingDuration(recordingDuration)})` } : chat
    ));

    toast({
      title: "Voice message sent",
      description: `Recording (${formatRecordingDuration(recordingDuration)}) has been sent.`,
    });
  };

  const acceptFriendRequest = (requestId: string) => {
    setFriendRequests(prev => prev.map(req => 
      req.id === requestId ? { ...req, status: 'accepted' } : req
    ));
    setChats(prev => prev.map(chat => 
      chat.friendRequest?.id === requestId ? { ...chat, friendRequest: undefined } : chat
    ));
    toast({
      title: "Friend request accepted",
      description: "You can now chat freely!",
    });
  };

  const togglePinChat = (chatId: string) => {
    setChats(prev => {
      const updated = prev.map(chat => {
        if (chat.id === chatId) {
          const newPinned = !chat.isPinned;
          return { ...chat, isPinned: newPinned };
        }
        return chat;
      });
      
      const sorted = updated.sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        return 0;
      });
      
      return sorted;
    });
    
    const chat = chats.find(c => c.id === chatId);
    toast({
      title: "Chat updated",
      description: `Chat has been ${chat?.isPinned ? 'unpinned' : 'pinned'}.`,
    });
  };

  const deleteChat = (chatId: string) => {
    const chatToDelete = chats.find(c => c.id === chatId);
    
    setChats(prev => prev.filter(chat => chat.id !== chatId));
    
    if (selectedChat?.id === chatId) {
      setSelectedChat(null);
      setMessages([]);
    }
    
    setSwipeState({ chatId: null, translateX: 0, isDragging: false, startX: 0 });
    
    toast({
      title: "Chat deleted",
      description: `Conversation with ${chatToDelete?.user.name} has been removed.`,
    });
  };

  // Touch-only handlers for swipe (mobile/tablet)
  const handleSwipeStart = (e: React.TouchEvent, chatId: string) => {
    const clientX = e.touches[0].clientX;
    setSwipeState({
      chatId,
      translateX: 0,
      isDragging: true,
      startX: clientX
    });
  };

  const handleSwipeMove = (e: React.TouchEvent) => {
    if (!swipeState.isDragging || !swipeState.chatId) return;
    
    const clientX = e.touches[0].clientX;
    const deltaX = clientX - swipeState.startX;
    const clampedDelta = Math.max(-150, Math.min(0, deltaX));
    
    setSwipeState(prev => ({ ...prev, translateX: clampedDelta }));
  };

  const handleSwipeEnd = () => {
    if (!swipeState.isDragging) return;
    
    const threshold = -75;
    if (swipeState.translateX < threshold) {
      setSwipeState(prev => ({ ...prev, translateX: -150, isDragging: false }));
    } else {
      setSwipeState(prev => ({ ...prev, translateX: 0, isDragging: false }));
    }
  };

  const filteredChats = chats.filter(chat => 
    chat.user.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderMessage = (msg: Message) => {
    switch (msg.type) {
      case 'emoji':
        return (
          <div className="text-4xl">{msg.text}</div>
        );
      case 'file':
        return (
          <div className="flex items-center gap-3 p-3 bg-background/50 rounded-lg border border-border">
            <FileText className="h-8 w-8 text-primary" />
            <div className="flex-1">
              <p className="font-medium text-sm">{msg.fileName}</p>
              <p className="text-xs text-muted-foreground">{msg.fileSize}</p>
            </div>
            <Button size="icon" variant="ghost" className="h-8 w-8">
              <Download className="h-4 w-4" />
            </Button>
          </div>
        );
      case 'voice':
        return (
          <div className="flex items-center gap-3 p-3 bg-background/50 rounded-lg border border-border">
            <Button size="icon" variant="ghost" className="h-8 w-8">
              <Play className="h-4 w-4" />
            </Button>
            <div className="flex-1">
              <div className="w-24 h-1 bg-primary/20 rounded-full">
                <div className="w-1/3 h-full bg-primary rounded-full"></div>
              </div>
              <p className="text-xs text-muted-foreground mt-1">{formatRecordingDuration(msg.duration || 0)}</p>
            </div>
          </div>
        );
      default:
        return <p>{msg.text}</p>;
    }
  };

  return (
    <div className="h-screen bg-background text-foreground flex relative overflow-hidden pb-8">
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        className="hidden"
        accept="*/*"
      />

      {/* Call Interface */}
      {callState.isActive && (
        <div className={cn(
          "fixed inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 z-[100] flex items-center justify-center transition-all duration-500 ease-out",
          callState.isMinimized && "bottom-auto top-auto right-4 top-4 w-80 h-48 rounded-2xl shadow-2xl backdrop-blur-lg"
        )}>
          <div className="text-center text-white">
            {!callState.isMinimized && (
              <div className="flex justify-between items-center mb-8 w-full max-w-md">
                <div></div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setCallState(prev => ({ ...prev, isMinimized: !prev.isMinimized }))}
                    className="text-white hover:bg-white/20 transition-all duration-200"
                  >
                    <Minimize2 className="h-5 w-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={endCall}
                    className="text-white hover:bg-white/20 transition-all duration-200"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            )}
            
            {!callState.isMinimized && (
              <>
                <Avatar className="h-32 w-32 mx-auto mb-6 ring-4 ring-white/20 transition-all duration-300">
                  <AvatarImage src={callState.user?.avatar} />
                  <AvatarFallback className="text-4xl bg-primary text-primary-foreground">
                    {callState.user?.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <h2 className="text-2xl font-semibold mb-2">{callState.user?.name}</h2>
                <p className="text-lg text-white/80 mb-8 capitalize">
                  {callState.status === 'calling' && (callState.isIncoming ? 'Incoming call...' : 'Calling...')}
                  {callState.status === 'connecting' && 'Connecting...'}
                  {callState.status === 'connected' && formatCallDuration(callState.duration)}
                  {callState.status === 'ending' && 'Call ending...'}
                </p>
                
                {callState.isIncoming && callState.status === 'calling' ? (
                  <div className="flex justify-center gap-6">
                    <Button
                      size="icon"
                      onClick={endCall}
                      className="h-14 w-14 rounded-full bg-red-500 hover:bg-red-600 hover:scale-110 transition-all duration-200"
                    >
                      <PhoneOff className="h-6 w-6" />
                    </Button>
                    <Button
                      size="icon"
                      onClick={answerCall}
                      className="h-14 w-14 rounded-full bg-green-500 hover:bg-green-600 hover:scale-110 transition-all duration-200"
                    >
                      <Phone className="h-6 w-6" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex justify-center gap-6">
                    <Button 
                      size="icon" 
                      variant={callState.isMuted ? "destructive" : "secondary"} 
                      className="h-14 w-14 rounded-full hover:scale-110 transition-all duration-200"
                      onClick={toggleMute}
                    >
                      {callState.isMuted ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
                    </Button>
                    <Button size="icon" variant="secondary" className="h-14 w-14 rounded-full hover:scale-110 transition-all duration-200">
                      <Volume2 className="h-6 w-6" />
                    </Button>
                    <Button
                      size="icon"
                      onClick={endCall}
                      className="h-14 w-14 rounded-full bg-red-500 hover:bg-red-600 hover:scale-110 transition-all duration-200"
                    >
                      <PhoneOff className="h-6 w-6" />
                    </Button>
                    {callState.type === 'video' && (
                      <Button 
                        size="icon" 
                        variant={callState.isCameraOff ? "destructive" : "secondary"} 
                        className="h-14 w-14 rounded-full hover:scale-110 transition-all duration-200"
                        onClick={toggleCamera}
                      >
                        {callState.isCameraOff ? <VideoIcon className="h-6 w-6" /> : <Camera className="h-6 w-6" />}
                      </Button>
                    )}
                  </div>
                )}
              </>
            )}
            
            {callState.isMinimized && (
              <div className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={callState.user?.avatar} />
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {callState.user?.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-left">
                    <p className="font-medium">{callState.user?.name}</p>
                    <p className="text-sm text-white/70">
                      {callState.status === 'connected' ? formatCallDuration(callState.duration) : callState.status}
                    </p>
                  </div>
                </div>
                <div className="flex justify-center gap-2">
                  <Button size="icon" onClick={endCall} className="h-8 w-8 bg-red-500 hover:bg-red-600">
                    <PhoneOff className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Sidebar */}
      <div className={cn(
        "w-80 border-r border-border flex flex-col bg-card/95 transition-all duration-300 ease-out backdrop-blur-xl",
        "md:translate-x-0 md:relative md:block",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full",
        "fixed md:static inset-y-0 left-0 z-50 md:z-auto"
      )}>
        {/* Header */}
        <div className="p-4 border-b border-border bg-gradient-to-r from-primary/10 to-primary/5 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-primary via-primary/90 to-primary/80 rounded-2xl flex items-center justify-center shadow-lg ring-2 ring-primary/20 transition-all duration-300 hover:scale-105">
                  <span className="text-xl font-black text-primary-foreground tracking-tight">GK</span>
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse ring-2 ring-background"></div>
              </div>
              <div className="text-xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                GoponKotha
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" className="h-8 w-8 hover:scale-105 transition-all duration-200">
                <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              </Button>
              <Switch
                checked={isDarkMode}
                onCheckedChange={setIsDarkMode}
                className="data-[state=checked]:bg-primary scale-75"
              />
              <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 hover:scale-105 transition-all duration-200">
                    <Settings className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <Settings className="h-5 w-5" />
                      Settings
                    </DialogTitle>
                  </DialogHeader>
                  <Tabs defaultValue="profile" className="w-full">
                    <TabsList className="grid w-full grid-cols-4">
                      <TabsTrigger value="profile">Profile</TabsTrigger>
                      <TabsTrigger value="privacy">Privacy</TabsTrigger>
                      <TabsTrigger value="notifications">Notifications</TabsTrigger>
                      <TabsTrigger value="appearance">Appearance</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="profile" className="space-y-4">
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Edit3 className="h-4 w-4" />
                            Profile Information
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="flex items-center gap-4">
                            <Avatar className="h-20 w-20">
                              <AvatarImage src={currentUserProfile.avatar} />
                              <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                                {currentUserProfile.name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <Button variant="outline" size="sm">
                              <Camera className="h-4 w-4 mr-2" />
                              Change Photo
                            </Button>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="name">Name</Label>
                            <Input 
                              id="name" 
                              value={currentUserProfile.name}
                              onChange={(e) => setCurrentUserProfile(prev => ({ ...prev, name: e.target.value }))}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="username">Username</Label>
                            <Input 
                              id="username" 
                              value={currentUserProfile.username}
                              onChange={(e) => setCurrentUserProfile(prev => ({ ...prev, username: e.target.value }))}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="about">About</Label>
                            <Textarea 
                              id="about" 
                              value={currentUserProfile.about}
                              onChange={(e) => setCurrentUserProfile(prev => ({ ...prev, about: e.target.value }))}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="phone">Phone</Label>
                            <Input 
                              id="phone" 
                              value={currentUserProfile.phone}
                              onChange={(e) => setCurrentUserProfile(prev => ({ ...prev, phone: e.target.value }))}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input 
                              id="email" 
                              value={currentUserProfile.email}
                              onChange={(e) => setCurrentUserProfile(prev => ({ ...prev, email: e.target.value }))}
                            />
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>

                    <TabsContent value="privacy" className="space-y-4">
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Shield className="h-4 w-4" />
                            Privacy Settings
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <Label>Last Seen</Label>
                              <p className="text-sm text-muted-foreground">Who can see when you were last online</p>
                            </div>
                            <Select defaultValue="everyone">
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="everyone">Everyone</SelectItem>
                                <SelectItem value="contacts">Contacts</SelectItem>
                                <SelectItem value="nobody">Nobody</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="flex items-center justify-between">
                            <div>
                              <Label>Friend Requests</Label>
                              <p className="text-sm text-muted-foreground">Auto-accept friend requests</p>
                            </div>
                            <Switch />
                          </div>
                          <div className="flex items-center justify-between">
                            <div>
                              <Label>Read Receipts</Label>
                              <p className="text-sm text-muted-foreground">Show when you've read messages</p>
                            </div>
                            <Switch defaultChecked />
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>

                    <TabsContent value="notifications" className="space-y-4">
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Bell className="h-4 w-4" />
                            Notification Settings
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <Label>Message Notifications</Label>
                              <p className="text-sm text-muted-foreground">Get notified for new messages</p>
                            </div>
                            <Switch defaultChecked />
                          </div>
                          <div className="flex items-center justify-between">
                            <div>
                              <Label>Call Notifications</Label>
                              <p className="text-sm text-muted-foreground">Get notified for incoming calls</p>
                            </div>
                            <Switch defaultChecked />
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>

                    <TabsContent value="appearance" className="space-y-4">
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Palette className="h-4 w-4" />
                            Appearance Settings
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <Label>Theme</Label>
                              <p className="text-sm text-muted-foreground">Choose your preferred theme</p>
                            </div>
                            <Select defaultValue={isDarkMode ? "dark" : "light"}>
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="light">Light</SelectItem>
                                <SelectItem value="dark">Dark</SelectItem>
                                <SelectItem value="auto">Auto</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>
                  </Tabs>
                </DialogContent>
              </Dialog>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex gap-2 mb-4">
            <Dialog open={isUserSearchOpen} onOpenChange={setIsUserSearchOpen}>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline" className="flex-1 hover:scale-105 transition-all duration-200">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add Friend
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <UserPlus className="h-5 w-5" />
                    Find People
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="p-4 bg-muted/50 rounded-lg border border-dashed">
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Suggested Friends
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Find people you know by searching their name, username, email, or phone number. After sending a friend request, you can send up to 3 messages before they accept.
                    </p>
                  </div>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by name, username, email, or phone..."
                      value={userSearchQuery}
                      onChange={(e) => setUserSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <ScrollArea className="h-60">
                    {searchResults.map((user) => (
                      <div
                        key={user.id}
                        className="p-3 hover:bg-accent rounded-lg transition-all duration-200 group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={user.avatar} />
                              <AvatarFallback className="bg-muted text-muted-foreground">
                                {user.name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            {user.isOnline && (
                              <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 border-2 border-background rounded-full"></div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-sm">{user.name}</h3>
                            <p className="text-xs text-muted-foreground">@{user.username}</p>
                            <p className="text-xs text-muted-foreground truncate">{user.about}</p>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => sendFriendRequest(user)}
                            className="opacity-0 group-hover:opacity-100 transition-all duration-200"
                          >
                            <UserPlus className="h-3 w-3 mr-1" />
                            Add
                          </Button>
                        </div>
                      </div>
                    ))}
                    {userSearchQuery && searchResults.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p>No users found</p>
                      </div>
                    )}
                  </ScrollArea>
                </div>
              </DialogContent>
            </Dialog>
            <Button 
              size="sm" 
              variant="outline" 
              className="hover:scale-105 transition-all duration-200"
              onClick={() => {
                if (chats.length > 0) {
                  simulateIncomingCall(chats[0].user, 'voice');
                } else {
                  toast({
                    title: "Demo call",
                    description: "Add a friend to test the calling feature!",
                  });
                }
              }}
            >
              <Phone className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-background/50 border-border/50 backdrop-blur-sm transition-all duration-200 focus:bg-background focus:border-primary/50"
            />
          </div>
        </div>

        {/* Chat List */}
        <ScrollArea className="flex-1" ref={chatListRef}>
          {filteredChats.length === 0 ? (
            <div className="p-8 text-center">
              <MessageCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="font-semibold mb-2">No conversations yet</h3>
              <p className="text-sm text-muted-foreground mb-4">Start a new conversation by adding friends</p>
              <Button
                size="sm"
                onClick={() => setIsUserSearchOpen(true)}
                className="hover:scale-105 transition-all duration-200"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Find People
              </Button>
            </div>
          ) : (
            <div
              onTouchMove={handleSwipeMove}
              onTouchEnd={handleSwipeEnd}
            >
              {filteredChats.map((chat) => (
                <div
                  key={chat.id}
                  className="relative overflow-hidden group"
                  style={{
                    transform: swipeState.chatId === chat.id ? `translateX(${swipeState.translateX}px)` : 'translateX(0)',
                    transition: swipeState.isDragging ? 'none' : 'transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                  }}
                  onTouchStart={(e) => handleSwipeStart(e, chat.id)}
                >
                  {/* Chat Item */}
                  <div
                    onClick={() => {
                      if (swipeState.translateX === 0) {
                        setSelectedChat(chat);
                        setMessages([]);
                        setIsMobileMenuOpen(false);
                        setSwipeState({ chatId: null, translateX: 0, isDragging: false, startX: 0 });
                      } else {
                        setSwipeState({ chatId: null, translateX: 0, isDragging: false, startX: 0 });
                      }
                    }}
                    className={cn(
                      "p-3 cursor-pointer hover:bg-accent transition-all duration-200 border-b border-border/30 relative bg-card",
                      selectedChat?.id === chat.id && "bg-accent shadow-sm"
                    )}
                  >
                    {/* Desktop Actions - Show on hover */}
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 hidden md:flex gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200 z-10">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 hover:bg-muted transition-all duration-200"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          togglePinChat(chat.id);
                        }}
                      >
                        {chat.isPinned ? <PinOff className="h-3 w-3" /> : <Pin className="h-3 w-3" />}
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 hover:bg-destructive hover:text-destructive-foreground transition-all duration-200"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          deleteChat(chat.id);
                        }}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Avatar className="h-12 w-12 ring-2 ring-primary/10 group-hover:ring-primary/20 transition-all duration-200">
                          <AvatarImage src={chat.user.avatar} />
                          <AvatarFallback className="bg-muted text-muted-foreground">
                            {chat.user.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        {chat.user.isOnline && (
                          <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 border-2 border-background rounded-full animate-pulse"></div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-sm truncate flex items-center gap-1">
                            {chat.user.name}
                            {chat.isPinned && <Pin className="h-3 w-3 text-yellow-500" />}
                            {chat.friendRequest?.status === 'pending' && (
                              <Clock className="h-3 w-3 text-orange-500" />
                            )}
                          </h3>
                          <span className="text-xs text-muted-foreground">{chat.timestamp}</span>
                        </div>
                        <div className="flex items-center justify-between mt-1">
                          <p className="text-sm text-muted-foreground truncate">
                            {chat.friendRequest?.status === 'pending' ? (
                              <span className="flex items-center gap-1 text-orange-600">
                                <AlertCircle className="h-3 w-3" />
                                Friend request pending ({chat.friendRequest.messagesSent}/{chat.friendRequest.maxMessages} messages)
                              </span>
                            ) : (
                              chat.lastMessage || 'No messages yet'
                            )}
                          </p>
                          {chat.unreadCount > 0 && (
                            <Badge variant="default" className="ml-2 h-5 min-w-5 flex items-center justify-center text-xs bg-primary">
                              {chat.unreadCount}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Mobile Swipe Actions - Only visible when swiped on touch devices */}
                  <div 
                    className={cn(
                      "absolute right-0 top-0 h-full flex items-center bg-gradient-to-l from-red-500 to-orange-500 px-4 transition-all duration-200 md:hidden",
                      swipeState.chatId === chat.id && swipeState.translateX < -20 ? "opacity-100" : "opacity-0 pointer-events-none"
                    )}
                  >
                    <div className="flex gap-2">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="text-white hover:bg-white/20 transition-all duration-200"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          togglePinChat(chat.id);
                          setSwipeState({ chatId: null, translateX: 0, isDragging: false, startX: 0 });
                        }}
                      >
                        {chat.isPinned ? <PinOff className="h-4 w-4" /> : <Pin className="h-4 w-4" />}
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="text-white hover:bg-white/20 transition-all duration-200"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          deleteChat(chat.id);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm transition-all duration-300"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedChat ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-border bg-card/80 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="md:hidden hover:scale-105 transition-all duration-200"
                    onClick={() => {
                      setSelectedChat(null);
                      setMessages([]);
                    }}
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </Button>
                  <Avatar className="h-10 w-10 ring-2 ring-primary/10">
                    <AvatarImage src={selectedChat.user.avatar} />
                    <AvatarFallback className="bg-muted text-muted-foreground">
                      {selectedChat.user.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold flex items-center gap-2">
                      {selectedChat.user.name}
                      {selectedChat.friendRequest?.status === 'pending' && (
                        <Badge variant="outline" className="text-xs">
                          Pending Request
                        </Badge>
                      )}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {selectedChat.user.isOnline ? 'Online' : `Last seen ${selectedChat.user.lastSeen}`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {selectedChat.friendRequest?.status === 'pending' && selectedChat.friendRequest.from.id !== currentUser.id && (
                    <div className="flex gap-1">
                      <Button 
                        size="sm"
                        onClick={() => acceptFriendRequest(selectedChat.friendRequest!.id)}
                        className="hover:scale-105 transition-all duration-200"
                      >
                        <UserCheck className="h-4 w-4 mr-1" />
                        Accept
                      </Button>
                      <Button 
                        size="sm"
                        variant="outline"
                        className="hover:scale-105 transition-all duration-200"
                        onClick={() => {
                          setFriendRequests(prev => prev.map(req => 
                            req.id === selectedChat.friendRequest!.id ? { ...req, status: 'rejected' } : req
                          ));
                          deleteChat(selectedChat.id);
                          toast({
                            title: "Friend request declined",
                            description: "The friend request has been declined.",
                          });
                        }}
                      >
                        <UserX className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="hover:scale-105 transition-all duration-200"
                    onClick={() => startCall(selectedChat.user, 'voice')}
                  >
                    <Phone className="h-5 w-5" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="hover:scale-105 transition-all duration-200"
                    onClick={() => startCall(selectedChat.user, 'video')}
                  >
                    <Video className="h-5 w-5" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="hover:scale-105 transition-all duration-200"
                    onClick={() => {
                      toast({
                        title: "More options",
                        description: "Chat options menu - coming soon!",
                      });
                    }}
                  >
                    <MoreVertical className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Messages Area */}
            <ScrollArea className="flex-1 p-4 bg-background">
              {messages.length === 0 ? (
                <div className="flex-1 flex items-center justify-center h-full">
                  <div className="text-center">
                    <MessageCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                    <h3 className="font-semibold mb-2">Start the conversation</h3>
                    <p className="text-sm text-muted-foreground">
                      {selectedChat.friendRequest?.status === 'pending' ? (
                        `Send up to ${selectedChat.friendRequest.maxMessages} messages to ${selectedChat.user.name} before they accept your request`
                      ) : (
                        `Send a message to ${selectedChat.user.name}`
                      )}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((msg, index) => (
                    <div
                      key={msg.id}
                      className={cn(
                        "flex animate-in slide-in-from-bottom-2 duration-500 ease-out",
                        msg.sender === 'me' ? 'justify-end' : 'justify-start'
                      )}
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div
                        className={cn(
                          "max-w-xs lg:max-w-md px-4 py-2 rounded-2xl text-sm relative shadow-sm hover:shadow-md transition-all duration-300 transform hover:scale-[1.02]",
                          msg.sender === 'me'
                            ? 'bg-primary text-primary-foreground rounded-br-md'
                            : 'bg-card text-card-foreground border border-border rounded-bl-md'
                        )}
                      >
                        {renderMessage(msg)}
                        <div className={cn(
                          "flex items-center gap-1 mt-1",
                          msg.sender === 'me' ? 'justify-end' : 'justify-start'
                        )}>
                          <span className={cn(
                            "text-xs opacity-70",
                            msg.sender === 'me' ? 'text-primary-foreground' : 'text-muted-foreground'
                          )}>
                            {msg.timestamp}
                          </span>
                          {msg.sender === 'me' && msg.status && (
                            <div className="ml-1">
                              {msg.status === 'sent' && <Check className="h-3 w-3 opacity-70" />}
                              {msg.status === 'delivered' && <CheckCheck className="h-3 w-3 opacity-70" />}
                              {msg.status === 'read' && <CheckCheck className="h-3 w-3 text-blue-400" />}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>

            {/* Message Input */}
            <div className="p-4 border-t border-border bg-card/80 backdrop-blur-sm">
              {selectedChat.friendRequest?.status === 'pending' && selectedChat.friendRequest.messagesSent >= selectedChat.friendRequest.maxMessages && (
                <div className="mb-3 p-3 bg-orange-100 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
                  <p className="text-sm text-orange-800 dark:text-orange-200 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    You've reached the 3 message limit. Wait for {selectedChat.user.name} to accept your friend request.
                  </p>
                </div>
              )}
              {isRecording && (
                <div className="mb-3 p-3 bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <p className="text-sm text-red-800 dark:text-red-200 flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                    Recording... {formatRecordingDuration(recordingDuration)}
                  </p>
                </div>
              )}
              <div className="flex items-end gap-2">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="mb-2 hover:bg-accent hover:scale-105 transition-all duration-200"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Paperclip className="h-5 w-5" />
                </Button>
                <div className="flex-1 relative">
                  <Textarea
                    placeholder="Type a message..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage();
                      }
                    }}
                    disabled={selectedChat.friendRequest?.status === 'pending' && selectedChat.friendRequest.messagesSent >= selectedChat.friendRequest.maxMessages}
                    className="min-h-[2.5rem] max-h-32 resize-none pr-12 bg-background/50 border-border/50 focus:ring-2 focus:ring-primary/20 transition-all duration-200 backdrop-blur-sm rounded-2xl"
                    rows={1}
                  />
                  <Popover open={isEmojiPickerOpen} onOpenChange={setIsEmojiPickerOpen}>
                    <PopoverTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="absolute right-2 bottom-1 hover:bg-accent hover:scale-105 transition-all duration-200"
                      >
                        <Smile className="h-5 w-5" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80 p-0" side="top" align="end">
                      <div className="p-4">
                        <h4 className="font-medium mb-3">Choose an emoji</h4>
                        <Tabs defaultValue="Smileys" className="w-full">
                          <TabsList className="grid w-full grid-cols-5">
                            {Object.keys(emojiCategories).map((category) => (
                              <TabsTrigger key={category} value={category} className="text-xs">
                                {category === 'Smileys' && '😀'}
                                {category === 'Gestures' && '👍'}
                                {category === 'Hearts' && '❤️'}
                                {category === 'Animals' && '🐶'}
                                {category === 'Food' && '🍎'}
                              </TabsTrigger>
                            ))}
                          </TabsList>
                          {Object.entries(emojiCategories).map(([category, emojis]) => (
                            <TabsContent key={category} value={category} className="mt-3">
                              <div className="grid grid-cols-8 gap-2 max-h-48 overflow-y-auto">
                                {emojis.map((emoji) => (
                                  <Button
                                    key={emoji}
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0 text-lg hover:bg-accent"
                                    onClick={() => sendEmoji(emoji)}
                                  >
                                    {emoji}
                                  </Button>
                                ))}
                              </div>
                            </TabsContent>
                          ))}
                        </Tabs>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
                {message.trim() ? (
                  <Button 
                    onClick={sendMessage} 
                    size="icon" 
                    className="mb-2 hover:scale-105 transition-all duration-200 bg-primary hover:bg-primary/90 rounded-full"
                    disabled={selectedChat.friendRequest?.status === 'pending' && selectedChat.friendRequest.messagesSent >= selectedChat.friendRequest.maxMessages}
                  >
                    <Send className="h-5 w-5" />
                  </Button>
                ) : (
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="mb-2 hover:bg-accent hover:scale-105 transition-all duration-200 rounded-full"
                    onMouseDown={startVoiceRecording}
                    onMouseUp={stopVoiceRecording}
                    onTouchStart={startVoiceRecording}
                    onTouchEnd={stopVoiceRecording}
                  >
                    <Mic className={cn("h-5 w-5", isRecording && "text-red-500")} />
                  </Button>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col bg-background">
            <div className="p-4 border-b border-border bg-card/80 backdrop-blur-sm md:hidden">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setIsMobileMenuOpen(true)}
                className="hover:scale-105 transition-all duration-200"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </div>
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center max-w-md px-4">
                <div className="w-28 h-28 bg-gradient-to-br from-primary via-primary/90 to-primary/80 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl ring-4 ring-primary/20 transition-all duration-500 hover:scale-110">
                  <span className="text-4xl font-black text-primary-foreground tracking-tight">GK</span>
                </div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent mb-4">
                  Welcome to GoponKotha
                </h2>
                <p className="text-muted-foreground mb-6">
                  Experience premium messaging with real-time calling, emoji reactions, file sharing, and voice messages. Connect with friends seamlessly.
                </p>
                <Button
                  onClick={() => setIsUserSearchOpen(true)}
                  className="hover:scale-105 transition-all duration-200"
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Start Your First Chat
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Global Watermark */}
      <div className="fixed bottom-0 left-0 right-0 p-2 bg-background/80 backdrop-blur-sm border-t border-border/50 z-30">
        <p className="text-xs text-center text-muted-foreground flex items-center justify-center gap-1">
          <Star className="h-3 w-3" />
          Designed by Najmus Salehin Sakib
        </p>
      </div>
    </div>
  );
}
