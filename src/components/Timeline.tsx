import { useRef, useEffect } from "react";
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

  // Filter out pending items for drop position calculation
  const nonPendingEvents = placedEvents.filter((item) => item.status !== "pending");

  // Calculate which drop zone the cursor is over based on Y position relative to cards
  useEffect(() => {
    if (!isDragging || dragY === null || !timelineRef.current) {
      onDropZoneChange(null);
      return;
    }

    const timelineRect = timelineRef.current.getBoundingClientRect();
    const isOver = dragY >= timelineRect.top - 40 && dragY <= timelineRect.bottom + 40;

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
      onDropZoneChange(0);
      return;
    }

    // Sort by top position
    cardPositions.sort((a, b) => a.top - b.top);

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
        const midpoint = (card.bottom + nextCard.top) / 2;
        if (dragY < midpoint) {
          onDropZoneChange(i + 1);
          return;
        }
      } else {
        onDropZoneChange(i + 1);
        return;
      }
    }

    onDropZoneChange(cardPositions.length);
  }, [isDragging, dragY, nonPendingEvents.length, onDropZoneChange]);

  // Build items with drop zones always present (but collapsed when inactive)
  const items: JSX.Element[] = [];

  // Drop zone at start (always present, just collapsed when not active)
  items.push(
    <DropZone
      key="drop-start"
      position={0}
      isActive={isDragging && activeDropZone === 0}
      onDrop={onDrop}
      onDragOver={onDropZoneChange}
      onDragLeave={() => onDropZoneChange(null)}
    />
  );

  placedEvents.forEach((item, index) => {
    const isPending = item.status === "pending";
    const isPendingAndDragging = isPending && isDragging;
    
    items.push(
      <div 
        key={item.event.id}
        ref={(el) => {
          if (el) cardRefs.current.set(item.event.id, el);
          else cardRefs.current.delete(item.event.id);
        }}
        className={`relative flex items-center gap-3 ${isPendingAndDragging ? 'opacity-50 pointer-events-none' : ''}`}
      >
        {/* Year badge centered on timeline line - fixed position */}
        <div 
          className="absolute -left-8 top-1/2 -translate-y-1/2 -translate-x-1/2 z-10"
          style={{ opacity: isPending ? 0 : 1 }}
        >
          <span className="year-badge">{item.event.year}</span>
        </div>
        
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

    // Add drop zone after each non-pending card (always present)
    if (!isPending) {
      const nonPendingIndex = nonPendingEvents.findIndex((e) => e.event.id === item.event.id);
      const dropPosition = nonPendingIndex + 1;
      items.push(
        <DropZone
          key={`drop-${dropPosition}`}
          position={dropPosition}
          isActive={isDragging && activeDropZone === dropPosition}
          onDrop={onDrop}
          onDragOver={onDropZoneChange}
          onDragLeave={() => onDropZoneChange(null)}
        />
      );
    }
  });

  return (
    <div 
      ref={timelineRef}
      className="relative min-h-[200px]"
    >
      {/* Timeline line - absolutely positioned, won't move */}
      <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border" />
      
      {/* Timeline content */}
      <div className="relative pl-14 flex flex-col gap-4">
        {items}
      </div>
    </div>
  );
}
