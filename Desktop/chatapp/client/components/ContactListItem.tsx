import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Pin, UserX } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSwipeGesture } from '@/hooks/useSwipeGesture';
import { ChatActions } from './ChatActions';

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

interface ContactListItemProps {
  contact: Contact;
  isSelected: boolean;
  onSelect: () => void;
  onPin: (contactId: string) => void;
  onUnpin: (contactId: string) => void;
  onArchive: (contactId: string) => void;
  onUnarchive: (contactId: string) => void;
  onDelete: (contactId: string) => void;
  onBlock: (contactId: string) => void;
  onUnblock: (contactId: string) => void;
}

export function ContactListItem({
  contact,
  isSelected,
  onSelect,
  onPin,
  onUnpin,
  onArchive,
  onUnarchive,
  onDelete,
  onBlock,
  onUnblock
}: ContactListItemProps) {
  const [showActions, setShowActions] = useState(false);

  const { swipeOffset, isSwipeActive, swipeHandlers } = useSwipeGesture({
    onSwipeLeft: () => {
      setShowActions(true);
    },
    onSwipeRight: () => {
      setShowActions(false);
    },
    threshold: 50
  });

  const handleClick = () => {
    if (showActions) {
      setShowActions(false);
    } else if (swipeOffset === 0) {
      onSelect();
    }
  };

  return (
    <div className="relative overflow-hidden">
      {/* Main Contact Item */}
      <div
        {...swipeHandlers}
        style={{ transform: `translateX(${swipeOffset}px)` }}
        onClick={handleClick}
        className={cn(
          "relative p-4 border-b elegant-border cursor-pointer transition-all duration-200 ease-in-out group contact-swipe ripple",
          "hover:bg-accent/30 active:bg-accent/40 smooth-scale",
          "professional-shadow hover:shadow-lg",
          isSelected && "bg-accent/50 hover:bg-accent/60 shadow-md",
          contact.isPinned && "bg-gradient-to-r from-primary/5 to-transparent border-l-4 border-l-primary/60",
          contact.isBlocked && "opacity-60 saturate-50",
          isSwipeActive && "cursor-grab scale-[0.99]"
        )}
      >
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Avatar className={cn(
              "h-12 w-12 ring-2 ring-transparent transition-all duration-300",
              "group-hover:ring-primary/30 group-hover:ring-4 group-hover:scale-105",
              "professional-shadow hover:shadow-xl",
              contact.isBlocked && "grayscale"
            )}>
              <AvatarImage src={contact.avatar} className="object-cover" />
              <AvatarFallback className={cn(
                "font-semibold text-sm transition-colors",
                contact.isBlocked
                  ? "bg-muted text-muted-foreground"
                  : "bg-gradient-to-br from-primary/20 to-primary/10 text-primary"
              )}>
                {contact.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            {contact.isOnline && !contact.isBlocked && (
              <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-gradient-to-r from-online to-green-400 border-2 border-chat-sidebar rounded-full animate-pulse shadow-lg">
                <div className="w-full h-full bg-online rounded-full animate-ping opacity-75"></div>
              </div>
            )}
            {contact.isPinned && (
              <div className="absolute -top-1 -left-1 h-5 w-5 bg-gradient-to-r from-yellow-500 to-yellow-400 rounded-full flex items-center justify-center shadow-lg">
                <Pin className="h-2.5 w-2.5 text-white drop-shadow-sm" />
              </div>
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <h3 className={cn(
                  "font-medium truncate group-hover:text-primary transition-colors",
                  contact.isBlocked ? "text-muted-foreground" : "text-foreground"
                )}>
                  {contact.name}
                </h3>
                {contact.isBlocked && (
                  <UserX className="h-3 w-3 text-muted-foreground" />
                )}
              </div>
              <div className="flex items-center space-x-2">
                {contact.lastMessageTime && (
                  <span className="text-xs text-muted-foreground">{contact.lastMessageTime}</span>
                )}
                {contact.unreadCount && (
                  <Badge className="bg-primary text-primary-foreground text-xs min-w-[20px] h-5 flex items-center justify-center">
                    {contact.unreadCount}
                  </Badge>
                )}
                {/* Desktop three-dot menu */}
                <div className="hidden md:block">
                  <ChatActions
                    contactId={contact.id}
                    isPinned={contact.isPinned}
                    isArchived={contact.isArchived}
                    isBlocked={contact.isBlocked}
                    onPin={onPin}
                    onUnpin={onUnpin}
                    onArchive={onArchive}
                    onUnarchive={onUnarchive}
                    onDelete={onDelete}
                    onBlock={onBlock}
                    onUnblock={onUnblock}
                  />
                </div>
              </div>
            </div>
            {contact.isTyping ? (
              <div className="flex items-center space-x-1 text-primary text-sm">
                <span>typing</span>
                <div className="flex space-x-1">
                  <div className="w-1 h-1 bg-primary rounded-full animate-bounce"></div>
                  <div className="w-1 h-1 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-1 h-1 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground truncate">
                {contact.isBlocked ? 'Contact blocked' : (contact.lastMessage || contact.lastSeen)}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Swipe Actions */}
      {(showActions || Math.abs(swipeOffset) > 50) && (
        <div className="absolute top-0 right-0 h-full md:hidden">
          <ChatActions
            contactId={contact.id}
            isPinned={contact.isPinned}
            isArchived={contact.isArchived}
            isBlocked={contact.isBlocked}
            showAsButtons={true}
            onPin={onPin}
            onUnpin={onUnpin}
            onArchive={onArchive}
            onUnarchive={onUnarchive}
            onDelete={onDelete}
            onBlock={onBlock}
            onUnblock={onUnblock}
          />
        </div>
      )}
    </div>
  );
}
