import { useState, useCallback, useEffect, useRef } from "react";

export interface DragState {
  isDragging: boolean;
  startY: number;
  currentY: number;
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
    offsetY: 0,
    cardRect: null,
  });

  const optionsRef = useRef(options);
  optionsRef.current = options;

  const startDrag = useCallback((e: React.MouseEvent, cardElement: HTMLElement) => {
    e.preventDefault();
    const rect = cardElement.getBoundingClientRect();
    setDragState({
      isDragging: true,
      startY: e.clientY,
      currentY: e.clientY,
      offsetY: 0,
      cardRect: rect,
    });
  }, []);

  useEffect(() => {
    if (!dragState.isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      setDragState(prev => ({
        ...prev,
        currentY: e.clientY,
        offsetY: e.clientY - prev.startY,
      }));
    };

    const handleMouseUp = (e: MouseEvent) => {
      optionsRef.current.onDragEnd?.(e.clientY);
      setDragState(prev => ({
        ...prev,
        isDragging: false,
        offsetY: 0,
        cardRect: null,
      }));
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [dragState.isDragging]);

  return { dragState, startDrag };
}
