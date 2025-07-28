import { useState, useEffect } from 'react';
import { Search, User, MessageCircle, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { useMessaging } from '@/contexts/MessagingContext';
import { cn } from '@/lib/utils';

interface User {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  status: string;
  isOnline: boolean;
}

interface NewChatDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NewChatDialog({ open, onOpenChange }: NewChatDialogProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const { createChat } = useMessaging();

  useEffect(() => {
    if (open) {
      loadUsers();
    }
  }, [open]);

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const sessionId = localStorage.getItem('goponkotha_session');
      const response = await fetch('/api/auth/users', {
        headers: {
          'Authorization': `Bearer ${sessionId}`
        }
      });
      const data = await response.json();
      
      if (data.success) {
        // Filter out current user
        const otherUsers = data.users.filter((u: User) => u.id !== user?.id);
        setUsers(otherUsers);
      }
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredUsers = users.filter(u => 
    u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleStartChat = async (userId: string) => {
    const chatId = await createChat(userId);
    if (chatId) {
      onOpenChange(false);
      window.location.href = `/chat/${chatId}`;
    }
  };

  const getUserAvatar = (user: User) => {
    return user.avatar || user.username?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || 'U';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md mx-auto animate-modal-in">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-semibold">New Chat</DialogTitle>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => onOpenChange(false)}
              className="h-8 w-8 icon-btn-hover"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search for contacts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-muted border-0 focus-visible:ring-1 focus-visible:ring-primary"
            />
          </div>

          {/* Users List */}
          <div className="max-h-80 overflow-y-auto space-y-2">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-8">
                <User className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">
                  {searchQuery ? 'No contacts found' : 'No contacts available'}
                </p>
              </div>
            ) : (
              filteredUsers.map((u) => (
                <div
                  key={u.id}
                  onClick={() => handleStartChat(u.id)}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 btn-hover-scale cursor-pointer group"
                >
                  {/* Avatar */}
                  <div className="relative">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center text-white font-semibold">
                      {getUserAvatar(u)}
                    </div>
                    {u.isOnline && (
                      <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-online-indicator border-2 border-background rounded-full"></div>
                    )}
                  </div>

                  {/* User Info */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-foreground truncate group-hover:text-primary transition-colors">
                      {u.username || u.email}
                    </h4>
                    <p className="text-sm text-muted-foreground truncate">
                      {u.status} • {u.isOnline ? 'Online' : 'Offline'}
                    </p>
                  </div>

                  {/* Message Icon */}
                  <MessageCircle className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
              ))
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
