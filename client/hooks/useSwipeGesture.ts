import { useState, useRef, useEffect } from 'react';

interface SwipeGestureProps {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  threshold?: number;
}

export function useSwipeGesture({ 
  onSwipeLeft, 
  onSwipeRight, 
  threshold = 100 
}: SwipeGestureProps) {
  const [isSwipeActive, setIsSwipeActive] = useState(false);
  const [swipeOffset, setSwipeOffset] = useState(0);
  const startX = useRef<number>(0);
  const startY = useRef<number>(0);
  const currentX = useRef<number>(0);
  const isDragging = useRef<boolean>(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
    startY.current = e.touches[0].clientY;
    isDragging.current = true;
    setIsSwipeActive(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging.current) return;

    currentX.current = e.touches[0].clientX;
    const currentY = e.touches[0].clientY;
    
    const deltaX = currentX.current - startX.current;
    const deltaY = Math.abs(currentY - startY.current);

    // Only allow horizontal swipes
    if (deltaY > 30) {
      isDragging.current = false;
      setIsSwipeActive(false);
      setSwipeOffset(0);
      return;
    }

    // Limit swipe distance
    const limitedOffset = Math.max(-150, Math.min(0, deltaX));
    setSwipeOffset(limitedOffset);
  };

  const handleTouchEnd = () => {
    if (!isDragging.current) return;

    const deltaX = currentX.current - startX.current;

    if (deltaX < -threshold && onSwipeLeft) {
      onSwipeLeft();
    } else if (deltaX > threshold && onSwipeRight) {
      onSwipeRight();
    }

    // Reset
    isDragging.current = false;
    setIsSwipeActive(false);
    setSwipeOffset(0);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    startX.current = e.clientX;
    startY.current = e.clientY;
    isDragging.current = true;
    setIsSwipeActive(true);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current) return;

    currentX.current = e.clientX;
    const deltaX = currentX.current - startX.current;
    const limitedOffset = Math.max(-150, Math.min(0, deltaX));
    setSwipeOffset(limitedOffset);
  };

  const handleMouseUp = () => {
    if (!isDragging.current) return;

    const deltaX = currentX.current - startX.current;

    if (deltaX < -threshold && onSwipeLeft) {
      onSwipeLeft();
    } else if (deltaX > threshold && onSwipeRight) {
      onSwipeRight();
    }

    isDragging.current = false;
    setIsSwipeActive(false);
    setSwipeOffset(0);
  };

  return {
    swipeOffset,
    isSwipeActive,
    swipeHandlers: {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
      onMouseDown: handleMouseDown,
      onMouseMove: handleMouseMove,
      onMouseUp: handleMouseUp,
    },
  };
}
