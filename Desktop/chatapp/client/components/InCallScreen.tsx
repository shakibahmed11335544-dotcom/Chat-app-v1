import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Phone, 
  PhoneOff, 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  Volume2,
  VolumeX,
  MoreVertical,
  Minimize2,
  Maximize2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { CallState } from '@/services/webrtc';
import { RefObject, useState } from 'react';

interface InCallScreenProps {
  isOpen: boolean;
  callState: CallState;
  localVideoRef: RefObject<HTMLVideoElement>;
  remoteVideoRef: RefObject<HTMLVideoElement>;
  onEndCall: () => void;
  onToggleMute: () => void;
  onToggleVideo: () => void;
  formatCallDuration: (seconds: number) => string;
}

export function InCallScreen({
  isOpen,
  callState,
  localVideoRef,
  remoteVideoRef,
  onEndCall,
  onToggleMute,
  onToggleVideo,
  formatCallDuration
}: InCallScreenProps) {
  const [isMinimized, setIsMinimized] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(false);

  if (!isOpen) return null;

  const isVideoCall = callState.callType === 'video';

  return (
    <div className={cn(
      "fixed inset-0 bg-black z-50 flex flex-col",
      isMinimized && "bottom-auto top-4 right-4 w-80 h-60 rounded-2xl border border-white/20 shadow-2xl"
    )}>
      {/* Video Container */}
      <div className="flex-1 relative overflow-hidden">
        {isVideoCall ? (
          <>
            {/* Remote Video (main) */}
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover bg-slate-900"
            />
            
            {/* Local Video (picture-in-picture) */}
            <div className="absolute top-4 right-4 w-32 h-24 md:w-48 md:h-36 rounded-2xl overflow-hidden border-2 border-white/20 shadow-lg bg-slate-800">
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover mirror"
              />
            </div>
          </>
        ) : (
          /* Audio Call View */
          <div className="w-full h-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col items-center justify-center">
            <div className="text-center space-y-6">
              <div className="relative">
                <Avatar className="h-48 w-48 ring-4 ring-white/20 shadow-2xl">
                  <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${callState.callerName || 'Contact'}`} />
                  <AvatarFallback className="text-4xl bg-primary text-primary-foreground">
                    {(callState.callerName || 'Contact').split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                
                {/* Audio waves animation */}
                <div className="absolute inset-0 rounded-full border-4 border-primary/30 animate-pulse"></div>
                <div className="absolute inset-0 rounded-full border-4 border-primary/20 animate-ping"></div>
              </div>
              
              <div className="space-y-2">
                <h2 className="text-3xl font-bold text-white">{callState.callerName || 'Contact'}</h2>
                <p className="text-xl text-white/70">
                  {callState.connectionState === 'connected' 
                    ? formatCallDuration(callState.callDuration)
                    : 'Connecting...'
                  }
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Minimize/Maximize Button */}
        {!isMinimized && (
          <Button
            onClick={() => setIsMinimized(true)}
            className="absolute top-4 left-4 h-10 w-10 rounded-full bg-black/50 hover:bg-black/70 border border-white/20"
            size="sm"
          >
            <Minimize2 className="h-4 w-4 text-white" />
          </Button>
        )}

        {isMinimized && (
          <Button
            onClick={() => setIsMinimized(false)}
            className="absolute top-2 left-2 h-8 w-8 rounded-full bg-black/50 hover:bg-black/70 border border-white/20"
            size="sm"
          >
            <Maximize2 className="h-3 w-3 text-white" />
          </Button>
        )}

        {/* Call Duration (for video calls) */}
        {isVideoCall && callState.connectionState === 'connected' && !isMinimized && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-black/50 backdrop-blur-sm rounded-full px-4 py-2 border border-white/20">
            <span className="text-white font-medium">
              {formatCallDuration(callState.callDuration)}
            </span>
          </div>
        )}
      </div>

      {/* Call Controls */}
      {!isMinimized && (
        <div className="p-6 bg-gradient-to-t from-black to-transparent">
          <div className="flex items-center justify-center space-x-6">
            {/* Mute Button */}
            <Button
              onClick={onToggleMute}
              className={cn(
                "h-14 w-14 rounded-full transition-all duration-200 hover:scale-110",
                callState.isMuted 
                  ? "bg-red-600 hover:bg-red-700" 
                  : "bg-white/20 hover:bg-white/30",
                "border border-white/20 backdrop-blur-sm"
              )}
              size="lg"
            >
              {callState.isMuted ? (
                <MicOff className="h-6 w-6 text-white" />
              ) : (
                <Mic className="h-6 w-6 text-white" />
              )}
            </Button>

            {/* End Call Button */}
            <Button
              onClick={onEndCall}
              className="h-16 w-16 rounded-full bg-red-600 hover:bg-red-700 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110"
              size="lg"
            >
              <PhoneOff className="h-7 w-7 text-white" />
            </Button>

            {/* Video Toggle (only for video calls) */}
            {isVideoCall && (
              <Button
                onClick={onToggleVideo}
                className={cn(
                  "h-14 w-14 rounded-full transition-all duration-200 hover:scale-110",
                  !callState.isVideoEnabled 
                    ? "bg-red-600 hover:bg-red-700" 
                    : "bg-white/20 hover:bg-white/30",
                  "border border-white/20 backdrop-blur-sm"
                )}
                size="lg"
              >
                {callState.isVideoEnabled ? (
                  <Video className="h-6 w-6 text-white" />
                ) : (
                  <VideoOff className="h-6 w-6 text-white" />
                )}
              </Button>
            )}

            {/* Speaker Toggle (for audio calls) */}
            {!isVideoCall && (
              <Button
                onClick={() => setIsSpeakerOn(!isSpeakerOn)}
                className={cn(
                  "h-14 w-14 rounded-full transition-all duration-200 hover:scale-110",
                  isSpeakerOn 
                    ? "bg-primary hover:bg-primary/90" 
                    : "bg-white/20 hover:bg-white/30",
                  "border border-white/20 backdrop-blur-sm"
                )}
                size="lg"
              >
                {isSpeakerOn ? (
                  <Volume2 className="h-6 w-6 text-white" />
                ) : (
                  <VolumeX className="h-6 w-6 text-white" />
                )}
              </Button>
            )}

            {/* More Options */}
            <Button
              className="h-14 w-14 rounded-full bg-white/20 hover:bg-white/30 border border-white/20 backdrop-blur-sm transition-all duration-200 hover:scale-110"
              size="lg"
            >
              <MoreVertical className="h-6 w-6 text-white" />
            </Button>
          </div>
        </div>
      )}

      {/* Minimized Controls */}
      {isMinimized && (
        <div className="p-2 bg-black/80 backdrop-blur-sm rounded-b-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-white text-xs font-medium">
                {formatCallDuration(callState.callDuration)}
              </span>
            </div>
            
            <div className="flex items-center space-x-1">
              <Button
                onClick={onToggleMute}
                className={cn(
                  "h-8 w-8 rounded-full",
                  callState.isMuted ? "bg-red-600" : "bg-white/20"
                )}
                size="sm"
              >
                {callState.isMuted ? (
                  <MicOff className="h-3 w-3 text-white" />
                ) : (
                  <Mic className="h-3 w-3 text-white" />
                )}
              </Button>
              
              <Button
                onClick={onEndCall}
                className="h-8 w-8 rounded-full bg-red-600 hover:bg-red-700"
                size="sm"
              >
                <PhoneOff className="h-3 w-3 text-white" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
