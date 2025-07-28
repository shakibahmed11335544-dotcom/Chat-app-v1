import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  MessageCircle,
  Phone,
  Video,
  MoreVertical,
  Search,
  Paperclip,
  Mic,
  Send,
  ArrowDown,
  Settings,
  UserPlus,
  Check,
  CheckCheck,
  Image as ImageIcon,
  File,
  Smile,
  X,
  Menu,
  LogOut,
  User,
  Bell,
  Moon,
  Sun,
  Archive,
  Star,
  Trash2,
  Palette
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTheme } from '@/contexts/ThemeContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from '@/components/ui/textarea';
import { QuickActionsGrid } from '@/components/QuickActionsGrid';
import { EmojiGrid } from '@/components/EmojiGrid';
import { IncomingCallModal } from '@/components/IncomingCallModal';
import { InCallScreen } from '@/components/InCallScreen';
import { ChatActions } from '@/components/ChatActions';
import { ContactListItem } from '@/components/ContactListItem';
import { useWebRTC } from '@/hooks/useWebRTC';
import { authService } from '@/services/auth';

interface Contact {
  id: string;
  name: string;
  phone: string;
  avatar?: string;
  lastSeen: string;
  isOnline: boolean;
  unreadCount?: number;
  lastMessage?: string;
  lastMessageTime?: string;
  isTyping?: boolean;
  isPinned?: boolean;
  isArchived?: boolean;
  isBlocked?: boolean;
}

interface Message {
  id: string;
  text: string;
  timestamp: string;
  isSent: boolean;
  isDelivered: boolean;
  isRead: boolean;
  type: 'text' | 'image' | 'file' | 'voice';
  fileName?: string;
  fileSize?: string;
}

export function Chat() {
  const { theme, toggleTheme } = useTheme();
  const {
    callState,
    localVideoRef,
    remoteVideoRef,
    startCall,
    answerCall,
    rejectCall,
    endCall,
    toggleMute,
    toggleVideo,
    simulateIncomingCall,
    formatCallDuration
  } = useWebRTC();

  const [currentUser, setCurrentUser] = useState(authService.getCurrentUser());

  useEffect(() => {
    // Check authentication
    if (!authService.isAuthenticated()) {
      window.location.href = '/login';
      return;
    }

    // Load real connections
    loadConnections();
  }, []);

  const loadConnections = async () => {
    try {
      const connections = await authService.getConnections();
      const mappedContacts = connections.map(user => ({
        id: user.id,
        name: user.displayName,
        phone: `@${user.username}`,
        avatar: user.avatar,
        lastSeen: user.isOnline ? 'online' : user.lastSeen,
        isOnline: user.isOnline,
        lastMessage: 'No messages yet',
        isPinned: false,
        isArchived: false,
        isBlocked: false
      }));
      setContacts(mappedContacts);
    } catch (error) {
      console.error('Failed to load connections:', error);
    }
  };
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showAddContact, setShowAddContact] = useState(false);
  const [newContactName, setNewContactName] = useState('');
  const [newContactPhone, setNewContactPhone] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [showEmojiGrid, setShowEmojiGrid] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const recordingInterval = useRef<NodeJS.Timeout>();

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const handleScroll = () => {
    if (chatContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
      setShowScrollButton(!isNearBottom);
    }
  };

  const handleSendMessage = useCallback(() => {
    if (newMessage.trim() && selectedContact) {
      const message: Message = {
        id: Date.now().toString(),
        text: newMessage,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isSent: true,
        isDelivered: false,
        isRead: false,
        type: 'text'
      };
      
      setMessages(prev => [...prev, message]);
      setNewMessage('');
      
      // Update contact's last message
      setContacts(prev => prev.map(contact => 
        contact.id === selectedContact.id 
          ? { ...contact, lastMessage: newMessage, lastMessageTime: 'now' }
          : contact
      ));
      
      // Simulate delivery and read status
      setTimeout(() => {
        setMessages(prev => prev.map(msg => 
          msg.id === message.id ? { ...msg, isDelivered: true } : msg
        ));
      }, 1000);
      
      setTimeout(() => {
        setMessages(prev => prev.map(msg => 
          msg.id === message.id ? { ...msg, isRead: true } : msg
        ));
      }, 2000);
      
      // Simulate typing response
      if (Math.random() > 0.5) {
        setTimeout(() => {
          setIsTyping(true);
          setTimeout(() => {
            setIsTyping(false);
            const responses = [
              "Thanks for the message!",
              "Got it 👍",
              "That sounds great!",
              "Let me think about it",
              "Absolutely!",
              "I'll get back to you soon"
            ];
            const response = responses[Math.floor(Math.random() * responses.length)];
            const responseMessage: Message = {
              id: (Date.now() + 1).toString(),
              text: response,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              isSent: false,
              isDelivered: true,
              isRead: false,
              type: 'text'
            };
            setMessages(prev => [...prev, responseMessage]);
          }, 2000);
        }, 1000);
      }
    }
  }, [newMessage, selectedContact]);

  const handleAddContact = () => {
    if (newContactName.trim() && newContactPhone.trim()) {
      const newContact: Contact = {
        id: Date.now().toString(),
        name: newContactName,
        phone: newContactPhone,
        lastSeen: 'last seen recently',
        isOnline: Math.random() > 0.5,
        lastMessage: 'No messages yet'
      };
      
      setContacts(prev => [...prev, newContact]);
      setNewContactName('');
      setNewContactPhone('');
      setShowAddContact(false);
    }
  };

  const handleFileUpload = (type: 'file' | 'image') => {
    if (type === 'file') {
      fileInputRef.current?.click();
    } else {
      imageInputRef.current?.click();
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>, type: 'file' | 'image') => {
    const file = event.target.files?.[0];
    if (file && selectedContact) {
      const message: Message = {
        id: Date.now().toString(),
        text: `${type === 'image' ? '📷' : '📎'} ${file.name}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isSent: true,
        isDelivered: true,
        isRead: false,
        type: type,
        fileName: file.name,
        fileSize: `${(file.size / 1024 / 1024).toFixed(1)} MB`
      };
      
      setMessages(prev => [...prev, message]);
    }
  };

  const startRecording = () => {
    setIsRecording(true);
    setRecordingTime(0);
    recordingInterval.current = setInterval(() => {
      setRecordingTime(prev => prev + 1);
    }, 1000);
  };

  const stopRecording = () => {
    setIsRecording(false);
    if (recordingInterval.current) {
      clearInterval(recordingInterval.current);
    }
    
    if (recordingTime > 0 && selectedContact) {
      const message: Message = {
        id: Date.now().toString(),
        text: `🎤 Voice message (${Math.floor(recordingTime / 60)}:${(recordingTime % 60).toString().padStart(2, '0')})`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isSent: true,
        isDelivered: true,
        isRead: false,
        type: 'voice'
      };
      
      setMessages(prev => [...prev, message]);
    }
    setRecordingTime(0);
  };

  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.phone.includes(searchQuery)
  );

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleQuickAction = (action: string) => {
    console.log('Quick action:', action);
    // Handle different actions
    switch (action) {
      case 'camera':
        // Open camera
        break;
      case 'gallery':
        imageInputRef.current?.click();
        break;
      case 'document':
        fileInputRef.current?.click();
        break;
      case 'voice':
        startRecording();
        break;
      case 'video-call':
        if (selectedContact) {
          startCall(selectedContact.id, 'video');
        }
        break;
      case 'audio-call':
        if (selectedContact) {
          startCall(selectedContact.id, 'audio');
        }
        break;
      case 'send':
        handleSendMessage();
        break;
      case 'emoji':
        setShowEmojiGrid(true);
        break;
      default:
        // Handle other actions
        break;
    }
  };

  const handleEmojiSelect = (emoji: string) => {
    setNewMessage(prev => prev + emoji);
  };

  // Chat Action Handlers
  const handlePinChat = (contactId: string) => {
    setContacts(prev => prev.map(contact =>
      contact.id === contactId
        ? { ...contact, isPinned: true }
        : contact
    ));
    console.log('Pinned chat:', contactId);
  };

  const handleUnpinChat = (contactId: string) => {
    setContacts(prev => prev.map(contact =>
      contact.id === contactId
        ? { ...contact, isPinned: false }
        : contact
    ));
    console.log('Unpinned chat:', contactId);
  };

  const handleArchiveChat = (contactId: string) => {
    setContacts(prev => prev.map(contact =>
      contact.id === contactId
        ? { ...contact, isArchived: true }
        : contact
    ));
    console.log('Archived chat:', contactId);
  };

  const handleUnarchiveChat = (contactId: string) => {
    setContacts(prev => prev.map(contact =>
      contact.id === contactId
        ? { ...contact, isArchived: false }
        : contact
    ));
    console.log('Unarchived chat:', contactId);
  };

  const handleBlockContact = (contactId: string) => {
    setContacts(prev => prev.map(contact =>
      contact.id === contactId
        ? { ...contact, isBlocked: true }
        : contact
    ));
    if (selectedContact?.id === contactId) {
      setSelectedContact(null);
    }
    console.log('Blocked contact:', contactId);
  };

  const handleUnblockContact = (contactId: string) => {
    setContacts(prev => prev.map(contact =>
      contact.id === contactId
        ? { ...contact, isBlocked: false }
        : contact
    ));
    console.log('Unblocked contact:', contactId);
  };

  const handleDeleteChat = (contactId: string) => {
    setContacts(prev => prev.filter(contact => contact.id !== contactId));
    if (selectedContact?.id === contactId) {
      setSelectedContact(null);
    }
    console.log('Deleted chat:', contactId);
  };

  // Settings Action Handlers
  const handleProfileView = () => {
    console.log('Opening profile...');
    window.location.href = '/profile';
  };

  const handleOpenSettings = () => {
    console.log('Opening settings...');
    // Navigate to settings page
    window.location.href = '/settings';
  };

  const handleViewArchivedChats = () => {
    console.log('Viewing archived chats...');
    // Show archived chats or navigate to archived chats view
    setSearchQuery('archived:');
  };

  const handleSignOut = () => {
    console.log('Signing out...');
    authService.logout();
    window.location.href = '/login';
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSendMessage();
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [handleSendMessage]);

  return (
    <div className="flex h-screen bg-chat-background overflow-hidden relative">
      {/* Floating Theme Toggle */}
      <Button
        onClick={toggleTheme}
        className={cn(
          "fixed top-4 right-4 z-50 h-12 w-12 rounded-full shadow-lg transition-all duration-300 hover:scale-110 professional-button",
          "bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary purple-glow",
          "border-2 border-background/50 backdrop-blur-sm",
          theme === 'dark'
            ? "hover:shadow-[0_0_30px_rgba(139,69,255,0.4)]"
            : "hover:shadow-[0_0_20px_rgba(139,69,255,0.3)]"
        )}
        size="sm"
      >
        {theme === 'dark' ? (
          <Sun className="h-5 w-5 text-primary-foreground transition-transform hover:rotate-12" />
        ) : (
          <Moon className="h-5 w-5 text-primary-foreground transition-transform hover:rotate-12" />
        )}
      </Button>
      <input
        type="file"
        ref={fileInputRef}
        onChange={(e) => handleFileSelect(e, 'file')}
        className="hidden"
        accept=".pdf,.doc,.docx,.txt,.zip"
      />
      <input
        type="file"
        ref={imageInputRef}
        onChange={(e) => handleFileSelect(e, 'image')}
        className="hidden"
        accept="image/*"
      />

      {/* Sidebar */}
      <div className={cn(
        "w-full md:w-80 border-r border-border flex flex-col transition-all duration-300 ease-in-out",
        "bg-gradient-to-b from-chat-sidebar to-chat-sidebar/95 backdrop-blur-xl",
        !isSidebarOpen && "md:-translate-x-full"
      )}>
        {/* Sidebar Header */}
        <div className="p-4 bg-gradient-to-r from-chat-header to-chat-header/95 border-b border-border/50 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-primary via-primary to-primary/80 rounded-2xl flex items-center justify-center shadow-lg professional-button">
                  <span className="text-primary-foreground font-bold text-lg tracking-tight">GK</span>
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-online rounded-full animate-pulse"></div>
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-primary via-primary to-primary/70 bg-clip-text text-transparent">
                  GoponKotha
                </h1>
                <p className="text-xs text-muted-foreground">
                  {currentUser ? `@${currentUser.username}` : 'Always connected'}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-1">
              <Dialog open={showAddContact} onOpenChange={setShowAddContact}>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-accent/50 transition-colors">
                    <UserPlus className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md bg-card border-border">
                  <DialogHeader>
                    <DialogTitle>Add New Contact</DialogTitle>
                    <DialogDescription>
                      Add a new contact to start chatting
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label htmlFor="contact-name" className="text-sm font-medium">Name</label>
                      <Input
                        id="contact-name"
                        value={newContactName}
                        onChange={(e) => setNewContactName(e.target.value)}
                        placeholder="Enter contact name"
                        className="bg-input/50 border-border/50"
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="contact-phone" className="text-sm font-medium">Phone Number</label>
                      <Input
                        id="contact-phone"
                        value={newContactPhone}
                        onChange={(e) => setNewContactPhone(e.target.value)}
                        placeholder="+1 (555) 000-0000"
                        className="bg-input/50 border-border/50"
                      />
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" onClick={() => setShowAddContact(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleAddContact} className="bg-primary hover:bg-primary/90">
                        Add Contact
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-accent/50 transition-colors">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-popover border-border">
                  <DropdownMenuItem
                    onClick={handleProfileView}
                    className="cursor-pointer hover:bg-accent/50 transition-colors"
                  >
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={handleOpenSettings}
                    className="cursor-pointer hover:bg-accent/50 transition-colors"
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={handleViewArchivedChats}
                    className="cursor-pointer hover:bg-accent/50 transition-colors"
                  >
                    <Archive className="mr-2 h-4 w-4" />
                    Archived Chats
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-border" />
                  <DropdownMenuItem
                    className="cursor-pointer hover:bg-accent/50 transition-colors"
                    onClick={toggleTheme}
                  >
                    {theme === 'dark' ? <Sun className="mr-2 h-4 w-4" /> : <Moon className="mr-2 h-4 w-4" />}
                    {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-border" />
                  <DropdownMenuItem
                    onClick={handleSignOut}
                    className="cursor-pointer hover:bg-destructive/10 text-destructive transition-colors"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground transition-colors" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search conversations..."
              className={cn(
                "pl-9 h-11 rounded-xl transition-all duration-200",
                "bg-input/20 border-border/30 hover:bg-input/30 focus:bg-input/40",
                "placeholder:text-muted-foreground/70",
                "focus:border-primary/30 focus:ring-2 focus:ring-primary/10"
              )}
            />
          </div>
        </div>

        {/* Contacts List */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {filteredContacts.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center">
              <UserPlus className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No contacts yet</h3>
              <p className="text-muted-foreground mb-4">Add your first contact to start chatting</p>
              <Button
                onClick={() => setShowAddContact(true)}
                className="bg-primary hover:bg-primary/90"
              >
                Add Contact
              </Button>
            </div>
          ) : (
            // Sort contacts: pinned first, then by activity
            [...filteredContacts]
              .sort((a, b) => {
                if (a.isPinned && !b.isPinned) return -1;
                if (!a.isPinned && b.isPinned) return 1;
                return 0;
              })
              .filter(contact => !contact.isArchived) // Hide archived chats in main view
              .map((contact) => {
                return (
                  <ContactListItem
                    key={contact.id}
                    contact={contact}
                    isSelected={selectedContact?.id === contact.id}
                    onSelect={() => {
                      setSelectedContact(contact);
                      setMessages([]);
                      // Remove unread count when opening chat
                      setContacts(prev => prev.map(c =>
                        c.id === contact.id ? { ...c, unreadCount: 0 } : c
                      ));
                    }}
                    onPin={handlePinChat}
                    onUnpin={handleUnpinChat}
                    onArchive={handleArchiveChat}
                    onUnarchive={handleUnarchiveChat}
                    onDelete={handleDeleteChat}
                    onBlock={handleBlockContact}
                    onUnblock={handleUnblockContact}
                  />
                );
              })
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedContact ? (
          <>
            {/* Chat Header */}
            <div className="p-4 bg-chat-header border-b border-border backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="md:hidden h-8 w-8 p-0"
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                  >
                    <Menu className="h-4 w-4" />
                  </Button>
                  
                  <div className="relative">
                    <Avatar className="h-10 w-10 ring-2 ring-primary/20">
                      <AvatarImage src={selectedContact.avatar} />
                      <AvatarFallback className="bg-primary/20 text-primary font-semibold">
                        {selectedContact.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    {selectedContact.isOnline && (
                      <div className="absolute -bottom-1 -right-1 h-3 w-3 bg-online border-2 border-chat-header rounded-full"></div>
                    )}
                  </div>
                  <div>
                    <h2 className="font-semibold text-foreground">{selectedContact.name}</h2>
                    <p className="text-sm text-muted-foreground">
                      {selectedContact.isTyping ? (
                        <span className="text-primary">typing...</span>
                      ) : (
                        selectedContact.isOnline ? 'online' : selectedContact.lastSeen
                      )}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-1">
                  <Button
                    onClick={() => selectedContact && startCall(selectedContact.id, 'audio')}
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 hover:bg-accent/50 transition-colors"
                  >
                    <Phone className="h-4 w-4" />
                  </Button>
                  <Button
                    onClick={() => selectedContact && startCall(selectedContact.id, 'video')}
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 hover:bg-accent/50 transition-colors"
                  >
                    <Video className="h-4 w-4" />
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-accent/50 transition-colors">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-popover border-border">
                      <DropdownMenuItem className="cursor-pointer hover:bg-accent/50">
                    <Star className="mr-2 h-4 w-4" />
                    Star Contact
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer hover:bg-accent/50">
                    <Bell className="mr-2 h-4 w-4" />
                    Mute Notifications
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-border" />
                  <DropdownMenuItem
                    onClick={() => simulateIncomingCall(selectedContact?.name || 'Unknown', 'audio')}
                    className="cursor-pointer hover:bg-accent/50"
                  >
                    <Phone className="mr-2 h-4 w-4" />
                    Test Audio Call
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => simulateIncomingCall(selectedContact?.name || 'Unknown', 'video')}
                    className="cursor-pointer hover:bg-accent/50"
                  >
                    <Video className="mr-2 h-4 w-4" />
                    Test Video Call
                  </DropdownMenuItem>
                      <DropdownMenuSeparator className="bg-border" />
                      <DropdownMenuItem className="cursor-pointer hover:bg-destructive/10 text-destructive">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Chat
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div 
              ref={chatContainerRef}
              onScroll={handleScroll}
              className="flex-1 overflow-y-auto p-4 space-y-4 relative bg-gradient-to-b from-chat-background to-chat-background/95"
            >
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                    <MessageCircle className="h-10 w-10 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Start a conversation</h3>
                  <p className="text-muted-foreground">Send a message to {selectedContact.name}</p>
                </div>
              ) : (
                messages.map((message, index) => (
                  <div
                    key={message.id}
                    className={cn(
                      "flex animate-in slide-in-from-bottom-2 duration-300",
                      message.isSent ? "justify-end" : "justify-start"
                    )}
                  >
                    <div
                      className={cn(
                        "chat-bubble smooth-transition shadow-sm hover:shadow-md max-w-[70%] group",
                        message.isSent 
                          ? "chat-bubble-sent bg-gradient-to-r from-primary to-primary/90" 
                          : "chat-bubble-received backdrop-blur-sm"
                      )}
                    >
                      {message.type === 'text' ? (
                        <p className="text-sm leading-relaxed break-words">{message.text}</p>
                      ) : (
                        <div className="flex items-center space-x-2">
                          {message.type === 'image' && <ImageIcon className="h-4 w-4" />}
                          {message.type === 'file' && <File className="h-4 w-4" />}
                          {message.type === 'voice' && <Mic className="h-4 w-4" />}
                          <div>
                            <p className="text-sm font-medium">{message.text}</p>
                            {message.fileSize && (
                              <p className="text-xs opacity-70">{message.fileSize}</p>
                            )}
                          </div>
                        </div>
                      )}
                      
                      <div className={cn(
                        "flex items-center justify-end space-x-1 mt-1 opacity-70 group-hover:opacity-100 transition-opacity",
                        message.isSent ? "text-message-sent-foreground" : "text-message-received-foreground"
                      )}>
                        <span className="text-xs">{message.timestamp}</span>
                        {message.isSent && (
                          <div className="flex">
                            {message.isRead ? (
                              <CheckCheck className="h-3 w-3 text-blue-400" />
                            ) : message.isDelivered ? (
                              <CheckCheck className="h-3 w-3" />
                            ) : (
                              <Check className="h-3 w-3" />
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
              
              {isTyping && (
                <div className="flex justify-start animate-in slide-in-from-bottom-2 duration-300">
                  <div className="chat-bubble chat-bubble-received backdrop-blur-sm">
                    <div className="flex space-x-1 py-1">
                      <div className="w-2 h-2 bg-typing rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-typing rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-typing rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
              
              {/* Scroll to bottom button */}
              {showScrollButton && (
                <Button
                  onClick={scrollToBottom}
                  className="fixed bottom-24 right-6 h-10 w-10 rounded-full bg-primary hover:bg-primary/90 shadow-lg smooth-transition z-10 animate-in slide-in-from-bottom-2"
                  size="sm"
                >
                  <ArrowDown className="h-4 w-4" />
                </Button>
              )}
            </div>

            {/* Message Input */}
            <div className="p-4 bg-chat-header border-t border-border backdrop-blur-sm">
              {isRecording && (
                <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-destructive rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium">Recording: {formatTime(recordingTime)}</span>
                  </div>
                  <Button
                    onClick={stopRecording}
                    variant="outline"
                    size="sm"
                    className="border-destructive/20 text-destructive hover:bg-destructive/10"
                  >
                    <X className="h-4 w-4 mr-1" />
                    Stop
                  </Button>
                </div>
              )}
              
              <div className="flex items-end space-x-2">
                <Button
                  onClick={() => setShowQuickActions(true)}
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "h-9 w-9 p-0 shrink-0 transition-all duration-200",
                    "hover:bg-primary/10 hover:text-primary hover:scale-110",
                    "bg-gradient-to-r from-slate-700/50 to-slate-800/50 hover:from-primary/20 hover:to-primary/30",
                    "border border-slate-600/30 rounded-xl"
                  )}
                >
                  <Paperclip className="h-4 w-4" />
                </Button>
                
                <div className="flex-1 relative">
                  <Textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="min-h-[40px] max-h-32 resize-none pr-12 bg-input/30 border-border/50 focus:bg-input/50 transition-colors rounded-full py-2 px-4"
                    rows={1}
                  />
                  <Button
                    onClick={() => setShowEmojiGrid(true)}
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "absolute right-1 bottom-1 h-8 w-8 p-0 transition-all duration-200",
                      "hover:bg-primary/10 hover:text-primary hover:scale-110",
                      "bg-gradient-to-r from-slate-700/50 to-slate-800/50 hover:from-primary/20 hover:to-primary/30",
                      "border border-slate-600/30 rounded-lg"
                    )}
                  >
                    <Smile className="h-4 w-4" />
                  </Button>
                </div>
                
                {newMessage.trim() ? (
                  <Button 
                    onClick={handleSendMessage}
                    className="h-9 w-9 p-0 shrink-0 bg-primary hover:bg-primary/90 rounded-full transition-all duration-200 transform hover:scale-105"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button 
                    onMouseDown={startRecording}
                    onMouseUp={stopRecording}
                    onMouseLeave={stopRecording}
                    className={cn(
                      "h-9 w-9 p-0 shrink-0 rounded-full transition-all duration-200 transform hover:scale-105",
                      isRecording ? "bg-destructive hover:bg-destructive/90" : "bg-primary hover:bg-primary/90"
                    )}
                  >
                    <Mic className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </>
        ) : (
          /* No chat selected */
          <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-chat-background to-chat-background/80">
            <div className="text-center space-y-6 max-w-md px-8">
              <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <MessageCircle className="h-12 w-12 text-primary" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-foreground">Welcome to GoponKotha</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Your conversations, reimagined. Select a contact to start chatting or add new contacts to expand your network.
                </p>
              </div>
              <Button 
                onClick={() => setShowAddContact(true)}
                className="bg-primary hover:bg-primary/90 transition-all duration-200 transform hover:scale-105"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Add Your First Contact
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Calculator-style Quick Actions Grid */}
      <QuickActionsGrid
        isOpen={showQuickActions}
        onClose={() => setShowQuickActions(false)}
        onAction={handleQuickAction}
      />

      {/* Calculator-style Emoji Grid */}
      <EmojiGrid
        isOpen={showEmojiGrid}
        onClose={() => setShowEmojiGrid(false)}
        onEmojiSelect={handleEmojiSelect}
      />

      {/* WebRTC Call Components */}
      <IncomingCallModal
        isOpen={callState.isIncomingCall}
        callerName={callState.callerName || 'Unknown Caller'}
        callType={callState.callType || 'audio'}
        onAnswer={answerCall}
        onReject={rejectCall}
      />

      <InCallScreen
        isOpen={callState.isInCall}
        callState={callState}
        localVideoRef={localVideoRef}
        remoteVideoRef={remoteVideoRef}
        onEndCall={endCall}
        onToggleMute={toggleMute}
        onToggleVideo={toggleVideo}
        formatCallDuration={formatCallDuration}
      />
    </div>
  );
}
