import { useState, useCallback, useEffect, useRef } from "react";

const DIRECTION_FLIP_THRESHOLD_PX = 6;

export interface DragState {
  isDragging: boolean;
  startY: number;
  currentY: number;
  prevY: number;
  offsetY: number;
  cardRect: DOMRect | null;
  direction: 'up' | 'down';
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
    direction: 'down',
  });

  const optionsRef = useRef(options);
  optionsRef.current = options;

  // Track the active pointer id so we only respond to the pointer that started the drag
  const pointerIdRef = useRef<number | null>(null);
  const currentYRef = useRef(0);
  const directionRef = useRef<'up' | 'down'>('down');
  const dirAccumulatorRef = useRef(0);

  useEffect(() => {
    currentYRef.current = dragState.currentY;
  }, [dragState.currentY]);

  useEffect(() => {
    directionRef.current = dragState.direction;
  }, [dragState.direction]);

  const startDragAt = useCallback((clientY: number, cardElement: HTMLElement, pointerId: number) => {
    const rect = cardElement.getBoundingClientRect();
    // Capture the pointer so all future events route to this element,
    // surviving DOM mutations that would otherwise fire pointercancel.
    try {
      cardElement.setPointerCapture(pointerId);
    } catch {
      // setPointerCapture can throw if the pointer is already released
    }
    pointerIdRef.current = pointerId;
    dirAccumulatorRef.current = 0;
    setDragState({
      isDragging: true,
      startY: clientY,
      currentY: clientY,
      prevY: clientY,
      offsetY: 0,
      cardRect: rect,
      direction: 'down',
    });
  }, []);

  const startDrag = useCallback((e: React.MouseEvent | React.TouchEvent, cardElement: HTMLElement) => {
    // We need to handle this as a pointer event at the native level.
    // React synthetic events wrap the native event — extract pointerId from it.
    const nativeEvent = e.nativeEvent as PointerEvent;
    const clientY = nativeEvent.clientY;
    const pointerId = nativeEvent.pointerId;

    if (pointerId == null) {
      // Fallback for non-pointer environments (shouldn't happen on modern browsers)
      return;
    }

    e.preventDefault();
    startDragAt(clientY, cardElement, pointerId);
  }, [startDragAt]);

  useEffect(() => {
    if (!dragState.isDragging) {
      pointerIdRef.current = null;
      return;
    }

    const handlePointerMove = (e: PointerEvent) => {
      if (e.pointerId !== pointerIdRef.current) return;
      e.preventDefault();
      const dy = e.clientY - currentYRef.current;
      const currentDir = directionRef.current;
      let nextDir = currentDir;
      const movingDown = dy > 0;
      const movingUp = dy < 0;
      const sameDirection =
        dy === 0 ||
        (movingDown && currentDir === 'down') ||
        (movingUp && currentDir === 'up');
      if (sameDirection) {
        dirAccumulatorRef.current = 0;
      } else {
        dirAccumulatorRef.current += Math.abs(dy);
        if (dirAccumulatorRef.current > DIRECTION_FLIP_THRESHOLD_PX) {
          nextDir = currentDir === 'down' ? 'up' : 'down';
          directionRef.current = nextDir;
          dirAccumulatorRef.current = 0;
        }
      }
      setDragState(prev => ({
        ...prev,
        prevY: prev.currentY,
        currentY: e.clientY,
        offsetY: e.clientY - prev.startY,
        direction: nextDir,
      }));
    };

    const handlePointerUp = (e: PointerEvent) => {
      if (e.pointerId !== pointerIdRef.current) return;
      e.preventDefault();
      const clientY = e.clientY;
      try {
        (e.target as Element)?.releasePointerCapture(e.pointerId);
      } catch {
        // already released
      }
      pointerIdRef.current = null;
      optionsRef.current.onDragEnd?.(clientY);
      setDragState(prev => ({
        ...prev,
        isDragging: false,
        prevY: prev.currentY,
        offsetY: 0,
        cardRect: null,
      }));
    };

    const handlePointerCancel = (e: PointerEvent) => {
      if (e.pointerId !== pointerIdRef.current) return;
      // DO NOT end the drag — pointer capture may have been lost due to DOM
      // mutations but the user's finger is still on screen.
      // We simply wait for pointerup to arrive instead.
    };

    document.addEventListener("pointermove", handlePointerMove, { passive: false });
    document.addEventListener("pointerup", handlePointerUp, { passive: false });
    document.addEventListener("pointercancel", handlePointerCancel);

    return () => {
      document.removeEventListener("pointermove", handlePointerMove);
      document.removeEventListener("pointerup", handlePointerUp);
      document.removeEventListener("pointercancel", handlePointerCancel);
    };
  }, [dragState.isDragging]);

  return { dragState, startDrag };
}
