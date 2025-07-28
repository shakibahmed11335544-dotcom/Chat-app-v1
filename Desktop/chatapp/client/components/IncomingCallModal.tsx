import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Phone, PhoneOff, Video, Mic } from 'lucide-react';
import { cn } from '@/lib/utils';

interface IncomingCallModalProps {
  isOpen: boolean;
  callerName: string;
  callType: 'audio' | 'video';
  onAnswer: () => void;
  onReject: () => void;
}

export function IncomingCallModal({ 
  isOpen, 
  callerName, 
  callType, 
  onAnswer, 
  onReject 
}: IncomingCallModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="relative w-full h-full flex flex-col items-center justify-center text-white">
        {/* Background with subtle animation */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 animate-pulse opacity-50"></div>
        
        <div className="relative z-10 flex flex-col items-center space-y-8 p-8">
          {/* Caller Info */}
          <div className="text-center space-y-4">
            <div className="relative">
              <Avatar className="h-32 w-32 ring-4 ring-white/20 shadow-2xl">
                <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${callerName}`} />
                <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                  {callerName.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              
              {/* Pulsing ring animation */}
              <div className="absolute inset-0 rounded-full border-4 border-white/30 animate-ping"></div>
              <div className="absolute inset-0 rounded-full border-4 border-white/20 animate-ping" style={{ animationDelay: '0.5s' }}></div>
            </div>
            
            <div className="space-y-2">
              <h2 className="text-3xl font-bold text-white">{callerName}</h2>
              <p className="text-lg text-white/70 flex items-center justify-center space-x-2">
                {callType === 'video' ? (
                  <>
                    <Video className="h-5 w-5" />
                    <span>Video calling...</span>
                  </>
                ) : (
                  <>
                    <Phone className="h-5 w-5" />
                    <span>Audio calling...</span>
                  </>
                )}
              </p>
            </div>
          </div>

          {/* Call Actions */}
          <div className="flex items-center space-x-8">
            {/* Reject Button */}
            <Button
              onClick={onReject}
              className={cn(
                "h-16 w-16 rounded-full bg-red-600 hover:bg-red-700 border-4 border-white/20",
                "shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110",
                "flex items-center justify-center"
              )}
              size="lg"
            >
              <PhoneOff className="h-6 w-6 text-white" />
            </Button>

            {/* Answer Button */}
            <Button
              onClick={onAnswer}
              className={cn(
                "h-16 w-16 rounded-full bg-green-600 hover:bg-green-700 border-4 border-white/20",
                "shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110",
                "flex items-center justify-center animate-pulse"
              )}
              size="lg"
            >
              <Phone className="h-6 w-6 text-white" />
            </Button>
          </div>

          {/* Swipe indicators for mobile */}
          <div className="md:hidden flex items-center space-x-4 text-white/60 text-sm">
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <span>Decline</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>Answer</span>
            </div>
          </div>
        </div>

        {/* Ringtone visualization */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
          <div className="flex space-x-1">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="w-1 bg-white/40 rounded-full animate-pulse"
                style={{
                  height: Math.random() * 20 + 10,
                  animationDelay: `${i * 0.1}s`,
                  animationDuration: '0.8s'
                }}
              ></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
