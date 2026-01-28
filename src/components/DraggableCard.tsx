import { useState, useRef, useEffect } from "react";
import { SportsEvent } from "@/data/sportsEvents";
import { EventCard } from "./EventCard";

interface DraggableCardProps {
  event: SportsEvent;
  isDragging: boolean;
  onDragStart: () => void;
  onDragEnd: () => void;
}

export function DraggableCard({
  event,
  isDragging,
  onDragStart,
  onDragEnd,
}: DraggableCardProps) {
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const startPosRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (!isDragging) {
      setDragOffset({ x: 0, y: 0 });
      // Reset animation state after transition
      const timer = setTimeout(() => setIsAnimatingOut(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isDragging]);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    startPosRef.current = { x: e.clientX, y: e.clientY };
    setIsAnimatingOut(true);
    onDragStart();

    const handleMouseMove = (moveEvent: MouseEvent) => {
      // Only track vertical movement (Y axis)
      const deltaY = moveEvent.clientY - startPosRef.current.y;
      setDragOffset({ x: 0, y: deltaY });
    };

    const handleMouseUp = () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      onDragEnd();
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  return (
    <div className="relative">
      {/* Placeholder that collapses when dragging */}
      <div
        className={`transition-all duration-300 ease-out overflow-hidden ${
          isAnimatingOut ? "h-0 opacity-0" : "h-auto opacity-100"
        }`}
      >
        <div className="invisible">
          <EventCard event={event} />
        </div>
      </div>

      {/* The actual draggable card */}
      <div
        ref={cardRef}
        onMouseDown={handleMouseDown}
        className={`
          ${isAnimatingOut ? "fixed z-50 pointer-events-auto" : ""}
          cursor-grab active:cursor-grabbing
          transition-transform duration-75
        `}
        style={
          isAnimatingOut
            ? {
                transform: `translateY(${dragOffset.y}px)`,
                left: cardRef.current?.getBoundingClientRect().left ?? 0,
                top: startPosRef.current.y - (cardRef.current?.getBoundingClientRect().height ?? 0) / 2,
                width: cardRef.current?.getBoundingClientRect().width ?? "auto",
              }
            : undefined
        }
      >
        <EventCard
          event={event}
          isDragging={isDragging}
        />
      </div>
    </div>
  );
}
