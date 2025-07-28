import { Button } from '@/components/ui/button';
import { 
  Pin, 
  Archive, 
  Trash2, 
  UserX, 
  MoreVertical,
  PinOff,
  ArchiveRestore
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ChatActionsProps {
  contactId: string;
  isPinned?: boolean;
  isArchived?: boolean;
  isBlocked?: boolean;
  showAsButtons?: boolean;
  onPin: (contactId: string) => void;
  onUnpin: (contactId: string) => void;
  onArchive: (contactId: string) => void;
  onUnarchive: (contactId: string) => void;
  onDelete: (contactId: string) => void;
  onBlock: (contactId: string) => void;
  onUnblock: (contactId: string) => void;
}

export function ChatActions({
  contactId,
  isPinned = false,
  isArchived = false,
  isBlocked = false,
  showAsButtons = false,
  onPin,
  onUnpin,
  onArchive,
  onUnarchive,
  onDelete,
  onBlock,
  onUnblock
}: ChatActionsProps) {
  if (showAsButtons) {
    return (
      <div className="flex items-center space-x-3 px-4 py-3 bg-gradient-to-r from-slate-800/95 to-slate-900/95 border-l border-slate-600/50 enhanced-blur">
        {/* Pin/Unpin */}
        <Button
          onClick={() => isPinned ? onUnpin(contactId) : onPin(contactId)}
          className={cn(
            "h-14 w-14 rounded-2xl transition-all duration-200 hover:scale-110 active:scale-95",
            "professional-shadow hover:shadow-xl ripple",
            isPinned
              ? "bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-500 hover:to-yellow-400 text-white shadow-yellow-500/25"
              : "bg-gradient-to-r from-slate-700 to-slate-800 hover:from-yellow-600 hover:to-yellow-500 text-yellow-400 hover:text-white border border-slate-600/50"
          )}
        >
          {isPinned ? <PinOff className="h-5 w-5" /> : <Pin className="h-5 w-5" />}
        </Button>

        {/* Archive/Unarchive */}
        <Button
          onClick={() => isArchived ? onUnarchive(contactId) : onArchive(contactId)}
          className={cn(
            "h-14 w-14 rounded-2xl transition-all duration-200 hover:scale-110 active:scale-95",
            "professional-shadow hover:shadow-xl ripple",
            isArchived
              ? "bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white shadow-blue-500/25"
              : "bg-gradient-to-r from-slate-700 to-slate-800 hover:from-blue-600 hover:to-blue-500 text-blue-400 hover:text-white border border-slate-600/50"
          )}
        >
          {isArchived ? <ArchiveRestore className="h-5 w-5" /> : <Archive className="h-5 w-5" />}
        </Button>

        {/* Block/Unblock */}
        <Button
          onClick={() => isBlocked ? onUnblock(contactId) : onBlock(contactId)}
          className={cn(
            "h-14 w-14 rounded-2xl transition-all duration-200 hover:scale-110 active:scale-95",
            "professional-shadow hover:shadow-xl ripple",
            isBlocked
              ? "bg-gradient-to-r from-gray-600 to-gray-500 hover:from-gray-500 hover:to-gray-400 text-white shadow-gray-500/25"
              : "bg-gradient-to-r from-slate-700 to-slate-800 hover:from-orange-600 hover:to-orange-500 text-orange-400 hover:text-white border border-slate-600/50"
          )}
        >
          <UserX className="h-5 w-5" />
        </Button>

        {/* Delete */}
        <Button
          onClick={() => onDelete(contactId)}
          className={cn(
            "h-14 w-14 rounded-2xl transition-all duration-200 hover:scale-110 active:scale-95",
            "bg-gradient-to-r from-slate-700 to-slate-800 hover:from-red-600 hover:to-red-500",
            "text-red-400 hover:text-white professional-shadow hover:shadow-xl ripple",
            "border border-slate-600/50 hover:shadow-red-500/25"
          )}
        >
          <Trash2 className="h-5 w-5" />
        </Button>
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-8 w-8 p-0 hover:bg-accent/50 transition-colors opacity-0 group-hover:opacity-100"
        >
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48 bg-popover border-border">
        <DropdownMenuItem 
          onClick={() => isPinned ? onUnpin(contactId) : onPin(contactId)}
          className="cursor-pointer hover:bg-accent/50"
        >
          {isPinned ? (
            <>
              <PinOff className="mr-2 h-4 w-4" />
              Unpin Chat
            </>
          ) : (
            <>
              <Pin className="mr-2 h-4 w-4" />
              Pin Chat
            </>
          )}
        </DropdownMenuItem>
        
        <DropdownMenuItem 
          onClick={() => isArchived ? onUnarchive(contactId) : onArchive(contactId)}
          className="cursor-pointer hover:bg-accent/50"
        >
          {isArchived ? (
            <>
              <ArchiveRestore className="mr-2 h-4 w-4" />
              Unarchive Chat
            </>
          ) : (
            <>
              <Archive className="mr-2 h-4 w-4" />
              Archive Chat
            </>
          )}
        </DropdownMenuItem>

        <DropdownMenuSeparator className="bg-border" />
        
        <DropdownMenuItem 
          onClick={() => isBlocked ? onUnblock(contactId) : onBlock(contactId)}
          className="cursor-pointer hover:bg-accent/50"
        >
          <UserX className="mr-2 h-4 w-4" />
          {isBlocked ? 'Unblock Contact' : 'Block Contact'}
        </DropdownMenuItem>
        
        <DropdownMenuSeparator className="bg-border" />
        
        <DropdownMenuItem 
          onClick={() => onDelete(contactId)}
          className="cursor-pointer hover:bg-destructive/10 text-destructive"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Delete Chat
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
