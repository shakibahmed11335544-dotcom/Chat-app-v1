import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

interface EmojiGridProps {
  isOpen: boolean;
  onClose: () => void;
  onEmojiSelect: (emoji: string) => void;
}

const emojiCategories = {
  recent: ['😊', '😂', '❤️', '👍', '😍', '🥰', '😘', '😎'],
  smileys: ['😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰'],
  gestures: ['👋', '🤚', '🖐️', '✋', '🖖', '👌', '🤏', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '🖕'],
  hearts: ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖'],
  objects: ['🎉', '🎊', '🎈', '🎁', '🏆', '🥇', '⭐', '✨', '💫', '⚡', '🔥', '💯', '💎', '🌟', '🎯', '🎪']
};

export function EmojiGrid({ isOpen, onClose, onEmojiSelect }: EmojiGridProps) {
  const [activeCategory, setActiveCategory] = useState<keyof typeof emojiCategories>('recent');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end justify-center p-4 md:items-center">
      <div className="relative w-full max-w-sm">
        {/* Calculator-style Emoji Grid Container */}
        <div className={cn(
          "bg-gradient-to-b from-slate-800 to-slate-900 rounded-t-3xl md:rounded-3xl p-6 shadow-2xl",
          "border border-slate-600/50 backdrop-blur-xl",
          "max-h-[70vh] overflow-hidden flex flex-col"
        )}>
          {/* Header */}
          <div className="flex items-center justify-between mb-4 p-3 bg-slate-900/80 rounded-2xl border border-slate-700/50">
            <h3 className="text-white text-lg font-semibold">Emojis</h3>
            <Button
              onClick={onClose}
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-slate-400 hover:text-white hover:bg-slate-700/50"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Category Tabs */}
          <div className="flex space-x-2 mb-4 overflow-x-auto">
            {Object.keys(emojiCategories).map((category) => (
              <Button
                key={category}
                onClick={() => setActiveCategory(category as keyof typeof emojiCategories)}
                className={cn(
                  "px-3 py-2 rounded-xl text-xs font-medium transition-all whitespace-nowrap",
                  activeCategory === category
                    ? "bg-gradient-to-r from-primary to-primary/80 text-white"
                    : "bg-slate-700/50 text-slate-300 hover:bg-slate-600/50"
                )}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </Button>
            ))}
          </div>

          {/* Emoji Grid - Calculator Style */}
          <div className="flex-1 overflow-y-auto">
            <div className="grid grid-cols-8 gap-2">
              {emojiCategories[activeCategory].map((emoji, index) => (
                <Button
                  key={`${activeCategory}-${index}`}
                  onClick={() => {
                    onEmojiSelect(emoji);
                    onClose();
                  }}
                  className={cn(
                    "h-12 w-12 rounded-2xl border border-slate-600/30 transition-all duration-200",
                    "bg-gradient-to-b from-slate-700/80 to-slate-800/80",
                    "hover:from-slate-600/80 hover:to-slate-700/80",
                    "hover:scale-110 hover:shadow-lg active:scale-95",
                    "text-xl p-0 flex items-center justify-center"
                  )}
                >
                  {emoji}
                </Button>
              ))}
            </div>
          </div>

          {/* Bottom indicator */}
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
