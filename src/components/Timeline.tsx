import { useState, useRef, useEffect } from "react";
import { SportsEvent } from "@/data/sportsEvents";
import { EventCard } from "./EventCard";
import { DropZone } from "./DropZone";
import { Button } from "@/components/ui/button";

interface TimelineProps {
  placedEvents: Array<{ event: SportsEvent; status: "correct" | "incorrect" | "pending" | "corrected" | null }>;
  activeDropZone: number | null;
  isDragging: boolean;
  dragY: number | null;
  onDrop: (position: number) => void;
  onDropZoneChange: (position: number | null) => void;
  onConfirm?: () => void;
  onCancel?: () => void;
  onPendingDragStart?: (e: React.MouseEvent, element: HTMLElement) => void;
  onPendingDragEnd?: () => void;
}

export function Timeline({
  placedEvents,
  activeDropZone,
  isDragging,
  dragY,
  onDrop,
  onDropZoneChange,
  onConfirm,
  onCancel,
  onPendingDragStart,
  onPendingDragEnd,
}: TimelineProps) {
  const timelineRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const [isOverTimeline, setIsOverTimeline] = useState(false);

  // Filter out non-pending items for drop position calculation
  const nonPendingEvents = placedEvents.filter((item) => item.status !== "pending");

  // Calculate which drop zone the cursor is over based on Y position relative to cards
  useEffect(() => {
    if (!isDragging || dragY === null || !timelineRef.current) {
      setIsOverTimeline(false);
      onDropZoneChange(null);
      return;
    }

    const timelineRect = timelineRef.current.getBoundingClientRect();
    const isOver = dragY >= timelineRect.top - 100 && dragY <= timelineRect.bottom + 100;
    setIsOverTimeline(isOver);

    if (!isOver) {
      onDropZoneChange(null);
      return;
    }

    // Get card positions for non-pending events
    const cardPositions: { id: string; top: number; bottom: number; index: number }[] = [];
    
    nonPendingEvents.forEach((item, index) => {
      const element = cardRefs.current.get(item.event.id);
      if (element) {
        const rect = element.getBoundingClientRect();
        cardPositions.push({
          id: item.event.id,
          top: rect.top,
          bottom: rect.bottom,
          index,
        });
      }
    });

    if (cardPositions.length === 0) {
      // No cards yet, drop at position 0
      onDropZoneChange(0);
      return;
    }

    // Sort by top position
    cardPositions.sort((a, b) => a.top - b.top);

    // Find the drop position based on cursor Y
    // Position 0 = before first card
    // Position N = after card N-1
    
    // Check if above the first card
    if (dragY < cardPositions[0].top) {
      onDropZoneChange(0);
      return;
    }

    // Check between cards and after
    for (let i = 0; i < cardPositions.length; i++) {
      const card = cardPositions[i];
      const nextCard = cardPositions[i + 1];
      
      if (nextCard) {
        // Check if cursor is between this card and next
        const midpoint = (card.bottom + nextCard.top) / 2;
        if (dragY < midpoint) {
          onDropZoneChange(i + 1);
          return;
        }
      } else {
        // This is the last card, drop after it
        onDropZoneChange(i + 1);
        return;
      }
    }

    onDropZoneChange(cardPositions.length);
  }, [isDragging, dragY, nonPendingEvents.length, onDropZoneChange]);

  const showDropZones = isDragging && isOverTimeline;
  const items: JSX.Element[] = [];

  placedEvents.forEach((item, index) => {
    const isPending = item.status === "pending";
    const isPendingAndDragging = isPending && isDragging;
    const nonPendingIndex = nonPendingEvents.findIndex((e) => e.event.id === item.event.id);
    const isActiveTarget = showDropZones && !isPending && activeDropZone === nonPendingIndex + 1;
    const isFirstActiveTarget = showDropZones && index === 0 && activeDropZone === 0;
    
    items.push(
      <div 
        key={item.event.id}
        ref={(el) => {
          if (el) cardRefs.current.set(item.event.id, el);
          else cardRefs.current.delete(item.event.id);
        }}
        className={`relative flex items-center gap-3 animate-slide-in ${isPendingAndDragging ? 'opacity-50 pointer-events-none' : ''}`}
      >
        {/* Drop indicator above card */}
        {isFirstActiveTarget && (
          <div className="absolute -top-2 left-0 right-0 h-1 bg-primary rounded-full animate-pulse" />
        )}
        
        {/* Drop indicator below card */}
        {isActiveTarget && (
          <div className="absolute -bottom-2 left-0 right-0 h-1 bg-primary rounded-full animate-pulse" />
        )}
        {/* Year badge centered on timeline line */}
        {!isPending && (
          <div className="absolute -left-8 top-1/2 -translate-y-1/2 -translate-x-1/2 z-10">
            <span className="year-badge">{item.event.year}</span>
          </div>
        )}
        
        <div className="flex-1">
          {isPending ? (
            <div
              onMouseDown={(e) => {
                const target = e.currentTarget;
                onPendingDragStart?.(e, target);
              }}
              className="cursor-grab active:cursor-grabbing"
            >
              <EventCard
                event={item.event}
                showYear={false}
                status={item.status}
              />
            </div>
          ) : (
            <EventCard
              event={item.event}
              showYear={false}
              status={item.status}
            />
          )}
        </div>
        
        {/* Small popup button for pending card */}
        {isPending && onConfirm && !isDragging && (
          <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 z-10">
            <Button
              onClick={onConfirm}
              size="sm"
              className="rounded-full shadow-lg px-4 text-sm font-medium"
            >
              Tap to place
            </Button>
          </div>
        )}
      </div>
    );

    // No drop zones between cards - we use visual indicator only
  });

  return (
    <div 
      ref={timelineRef}
      className="relative"
    >
      {/* Timeline line */}
      <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border" />
      
      {/* Timeline content */}
      <div className="relative space-y-4 pl-14">
        {items}
      </div>
    </div>
  );
}
