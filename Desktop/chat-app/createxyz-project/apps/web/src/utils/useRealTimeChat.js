import { useState, useEffect, useCallback, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';

export function useRealTimeChat() {
  const [isConnected, setIsConnected] = useState(false);
  const [typingUsers, setTypingUsers] = useState(new Set());
  const queryClient = useQueryClient();
  const intervalRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Simulate real-time connection
  useEffect(() => {
    // Simulate connection
    const connectTimer = setTimeout(() => {
      setIsConnected(true);
      console.log('Real-time chat connected');
    }, 1000);

    // Set up polling for new messages (simulating real-time updates)
    intervalRef.current = setInterval(() => {
      // Invalidate queries to fetch new messages
      queryClient.invalidateQueries(['messages']);
      queryClient.invalidateQueries(['chats']);
    }, 2000);

    return () => {
      clearTimeout(connectTimer);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      setIsConnected(false);
    };
  }, [queryClient]);

  // Join chat room
  const joinChat = useCallback(async (chatId, userId) => {
    try {
      await fetch('/api/websocket', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'join-chat',
          data: { chatId, userId }
        })
      });
      console.log(`Joined chat ${chatId}`);
    } catch (error) {
      console.error('Error joining chat:', error);
    }
  }, []);

  // Send message in real-time
  const sendMessage = useCallback(async (messageData) => {
    try {
      // Send via API
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(messageData)
      });

      if (response.ok) {
        const newMessage = await response.json();
        
        // Immediately update the cache for instant UI update
        queryClient.setQueryData(['messages', messageData.chatId], (oldMessages) => {
          return oldMessages ? [...oldMessages, newMessage] : [newMessage];
        });

        // Also update chat list cache
        queryClient.invalidateQueries(['chats']);

        return newMessage;
      }
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }, [queryClient]);

  // Simulate typing indicator
  const startTyping = useCallback((chatId, userId, userName) => {
    // In a real implementation, this would send to other users
    console.log(`${userName} is typing in chat ${chatId}`);
    
    // Simulate receiving typing indicator from others
    setTimeout(() => {
      setTypingUsers(prev => new Set([...prev, `${userName}`]));
    }, 100);

    // Clear typing indicator after 3 seconds
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    typingTimeoutRef.current = setTimeout(() => {
      setTypingUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(userName);
        return newSet;
      });
    }, 3000);
  }, []);

  const stopTyping = useCallback((chatId, userId, userName) => {
    console.log(`${userName} stopped typing in chat ${chatId}`);
    setTypingUsers(prev => {
      const newSet = new Set(prev);
      newSet.delete(userName);
      return newSet;
    });
  }, []);

  // Simulate user status updates
  const updateUserStatus = useCallback(async (userId, status) => {
    try {
      // In a real implementation, this would update the user's status
      console.log(`User ${userId} status changed to ${status}`);
      
      // Invalidate queries to refresh user statuses
      queryClient.invalidateQueries(['chats']);
    } catch (error) {
      console.error('Error updating user status:', error);
    }
  }, [queryClient]);

  // Call-related functions
  const initiateCall = useCallback(async (fromUserId, toUserId, isVideo = false) => {
    try {
      const roomId = `call-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      await fetch('/api/websocket', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'start-call',
          data: {
            from: fromUserId,
            to: toUserId,
            isVideo,
            roomId
          }
        })
      });

      console.log(`Call initiated from ${fromUserId} to ${toUserId}, video: ${isVideo}`);
      return roomId;
    } catch (error) {
      console.error('Error initiating call:', error);
      throw error;
    }
  }, []);

  const sendWebRTCSignal = useCallback(async (fromUserId, toUserId, signal) => {
    try {
      await fetch('/api/websocket', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'webrtc-signal',
          data: {
            from: fromUserId,
            to: toUserId,
            signal
          }
        })
      });

      console.log(`WebRTC signal sent from ${fromUserId} to ${toUserId}`);
    } catch (error) {
      console.error('Error sending WebRTC signal:', error);
      throw error;
    }
  }, []);

  return {
    isConnected,
    typingUsers,
    joinChat,
    sendMessage,
    startTyping,
    stopTyping,
    updateUserStatus,
    initiateCall,
    sendWebRTCSignal
  };
}