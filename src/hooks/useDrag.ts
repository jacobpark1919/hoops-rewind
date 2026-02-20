import { useState, useCallback, useEffect, useRef } from "react";

export interface DragState {
  isDragging: boolean;
  startY: number;
  currentY: number;
  prevY: number;
  offsetY: number;
  cardRect: DOMRect | null;
}

interface UseDragOptions {
  onDragEnd?: (clientY: number) => void;
}

export function useDrag(options: UseDragOptions = {}) {
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    startY: 0,
    currentY: 0,
    prevY: 0,
    offsetY: 0,
    cardRect: null,
  });

  const optionsRef = useRef(options);
  optionsRef.current = options;

  // Helper to start a drag from either a mouse or touch clientY
  const startDragAt = useCallback((clientY: number, cardElement: HTMLElement) => {
    const rect = cardElement.getBoundingClientRect();
    setDragState({
      isDragging: true,
      startY: clientY,
      currentY: clientY,
      prevY: clientY,
      offsetY: 0,
      cardRect: rect,
    });
  }, []);

  const startDrag = useCallback((e: React.MouseEvent | React.TouchEvent, cardElement: HTMLElement) => {
    e.preventDefault();
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    startDragAt(clientY, cardElement);
  }, [startDragAt]);

  useEffect(() => {
    if (!dragState.isDragging) return;

    const handleMove = (clientY: number) => {
      setDragState(prev => ({
        ...prev,
        prevY: prev.currentY,
        currentY: clientY,
        offsetY: clientY - prev.startY,
      }));
    };

    const handleEnd = (clientY: number) => {
      optionsRef.current.onDragEnd?.(clientY);
      setDragState(prev => ({
        ...prev,
        isDragging: false,
        prevY: prev.currentY,
        offsetY: 0,
        cardRect: null,
      }));
    };

    // Mouse handlers
    const handleMouseMove = (e: MouseEvent) => handleMove(e.clientY);
    const handleMouseUp = (e: MouseEvent) => handleEnd(e.clientY);

    // Touch handlers
    const handleTouchMove = (e: TouchEvent) => {
      if (e.cancelable) e.preventDefault(); // prevent page scroll while dragging
      if (e.touches.length > 0) {
        handleMove(e.touches[0].clientY);
      }
    };
    const handleTouchEnd = (e: TouchEvent) => {
      if (e.cancelable) e.preventDefault();
      const clientY = e.changedTouches[0]?.clientY ?? dragState.currentY;
      handleEnd(clientY);
    };
    const handleTouchCancel = (e: TouchEvent) => {
      const clientY = e.changedTouches[0]?.clientY ?? dragState.currentY;
      handleEnd(clientY);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("touchmove", handleTouchMove, { passive: false });
    document.addEventListener("touchend", handleTouchEnd, { passive: false });
    document.addEventListener("touchcancel", handleTouchCancel);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleTouchEnd);
      document.removeEventListener("touchcancel", handleTouchCancel);
    };
  }, [dragState.isDragging, dragState.currentY]);

  return { dragState, startDrag };
}
