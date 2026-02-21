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

  // Use a ref to track the latest currentY so handlers can access it
  // without needing currentY in the effect's dependency array.
  const currentYRef = useRef(0);
  useEffect(() => {
    currentYRef.current = dragState.currentY;
  }, [dragState.currentY]);

  // Track whether touch was canceled (DOM mutation on real phones)
  const wasCanceledRef = useRef(false);

  useEffect(() => {
    if (!dragState.isDragging) {
      wasCanceledRef.current = false;
      return;
    }

    const handleMove = (clientY: number) => {
      setDragState(prev => ({
        ...prev,
        prevY: prev.currentY,
        currentY: clientY,
        offsetY: clientY - prev.startY,
      }));
    };

    const handleEnd = (clientY: number) => {
      wasCanceledRef.current = false;
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
      // Always prevent default to stop scrolling and ensure we keep receiving events
      if (e.cancelable) e.preventDefault();
      if (e.touches.length > 0) {
        wasCanceledRef.current = false; // touch is alive again
        handleMove(e.touches[0].clientY);
      }
    };
    const handleTouchEnd = (e: TouchEvent) => {
      if (e.cancelable) e.preventDefault();
      const clientY = e.changedTouches[0]?.clientY ?? currentYRef.current;
      handleEnd(clientY);
    };

    // On real phones, DOM mutations (drop zone expanding) can fire touchcancel.
    // Instead of ending the drag, we keep it alive and seamlessly continue
    // tracking via document-level touchmove/touchend. No user action needed.
    const handleTouchCancel = () => {
      wasCanceledRef.current = true;
      // Intentionally do NOT call handleEnd — drag stays active.
      // The existing document-level touchmove/touchend listeners will
      // continue to fire because the finger is still on the screen.
    };

    // If the drag was interrupted by touchcancel AND somehow a new touchstart
    // fires (e.g. user lifted and re-touched), resume from the new position.
    const handleDocTouchStart = (e: TouchEvent) => {
      if (wasCanceledRef.current && e.touches.length > 0) {
        wasCanceledRef.current = false;
        if (e.cancelable) e.preventDefault();
        const newY = e.touches[0].clientY;
        setDragState(prev => ({
          ...prev,
          startY: newY - prev.offsetY, // preserve visual offset
          currentY: newY,
          prevY: newY,
        }));
      }
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("touchstart", handleDocTouchStart, { passive: false });
    document.addEventListener("touchmove", handleTouchMove, { passive: false });
    document.addEventListener("touchend", handleTouchEnd, { passive: false });
    document.addEventListener("touchcancel", handleTouchCancel);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("touchstart", handleDocTouchStart);
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleTouchEnd);
      document.removeEventListener("touchcancel", handleTouchCancel);
    };
  }, [dragState.isDragging]); // Only re-attach listeners when drag starts/stops

  return { dragState, startDrag };
}
