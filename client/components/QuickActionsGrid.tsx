import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Phone, 
  Video, 
  Camera, 
  Mic, 
  FileText, 
  Image, 
  MapPin, 
  Calendar,
  Users,
  Settings,
  Archive,
  Star,
  Send,
  Smile,
  Paperclip,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuickActionsGridProps {
  isOpen: boolean;
  onClose: () => void;
  onAction: (action: string) => void;
}

const quickActions = [
  { id: 'camera', icon: Camera, label: 'Camera', color: 'text-yellow-400' },
  { id: 'gallery', icon: Image, label: 'Gallery', color: 'text-yellow-400' },
  { id: 'document', icon: FileText, label: 'Document', color: 'text-yellow-400' },
  { id: 'location', icon: MapPin, label: 'Location', color: 'text-yellow-400' },
  
  { id: 'voice', icon: Mic, label: 'Voice', color: 'text-white' },
  { id: 'video-call', icon: Video, label: 'Video Call', color: 'text-white' },
  { id: 'audio-call', icon: Phone, label: 'Call', color: 'text-white' },
  { id: 'contact', icon: Users, label: 'Contact', color: 'text-white' },
  
  { id: 'calendar', icon: Calendar, label: 'Calendar', color: 'text-white' },
  { id: 'favorite', icon: Star, label: 'Favorite', color: 'text-white' },
  { id: 'archive', icon: Archive, label: 'Archive', color: 'text-white' },
  { id: 'emoji', icon: Smile, label: 'Emoji', color: 'text-yellow-400' },
  
  { id: 'attach', icon: Paperclip, label: 'Attach', color: 'text-yellow-400' },
  { id: 'settings', icon: Settings, label: 'Settings', color: 'text-white' },
  { id: 'send', icon: Send, label: 'Send', color: 'text-white' },
];

export function QuickActionsGrid({ isOpen, onClose, onAction }: QuickActionsGridProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="relative">
        {/* Calculator-style Grid Container */}
        <div className={cn(
          "bg-gradient-to-b from-slate-800 to-slate-900 rounded-3xl p-6 shadow-2xl",
          "border border-slate-600/50 backdrop-blur-xl",
          "w-80 max-w-sm mx-auto"
        )}>
          {/* Display/Header Area */}
          <div className="mb-6 p-4 bg-slate-900/80 rounded-2xl border border-slate-700/50">
            <div className="flex items-center justify-between">
              <h3 className="text-white text-xl font-semibold">Quick Actions</h3>
              <Button
                onClick={onClose}
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-slate-400 hover:text-white hover:bg-slate-700/50"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-slate-400 text-sm mt-1">Choose an action to perform</p>
          </div>

          {/* Calculator-style Button Grid */}
          <div className="grid grid-cols-4 gap-3">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              const isLastButton = index === quickActions.length - 1;
              
              return (
                <Button
                  key={action.id}
                  onClick={() => {
                    onAction(action.id);
                    onClose();
                  }}
                  className={cn(
                    "h-16 w-full rounded-2xl border border-slate-600/30 transition-all duration-200",
                    "bg-gradient-to-b from-slate-700/80 to-slate-800/80",
                    "hover:from-slate-600/80 hover:to-slate-700/80",
                    "hover:scale-105 hover:shadow-lg",
                    "active:scale-95",
                    "flex flex-col items-center justify-center space-y-1",
                    // Special styling for the "send" button like the calculator's equals button
                    isLastButton && "bg-gradient-to-b from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 border-red-500/50"
                  )}
                >
                  <Icon className={cn(
                    "h-5 w-5",
                    isLastButton ? "text-white" : action.color
                  )} />
                  <span className={cn(
                    "text-xs font-medium",
                    isLastButton ? "text-white" : action.color
                  )}>
                    {action.label}
                  </span>
                </Button>
              );
            })}
          </div>

          {/* Calculator-style bottom indicator */}
          <div className="flex justify-center mt-4 space-x-2">
            <div className="w-2 h-2 bg-slate-500 rounded-full"></div>
            <div className="w-2 h-2 bg-slate-600 rounded-full"></div>
            <div className="w-2 h-2 bg-slate-500 rounded-full"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
