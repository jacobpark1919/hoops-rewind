import { useRef, useEffect, useState } from "react";
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

// Constants for card sizing and overlap behavior
const CARD_HEIGHT = 72; // Approximate card height in px
const NORMAL_GAP = 16; // Normal gap between cards
const MIN_VISIBLE_HEIGHT = 28; // Minimum visible portion when overlapped
const MAX_CONTAINER_HEIGHT = 380; // Maximum height before overlapping kicks in
const DROP_ZONE_HEIGHT = 64; // Height of expanded drop zone

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
  const [hoveredCardId, setHoveredCardId] = useState<string | null>(null);

  // Filter out pending items for drop position calculation
  const nonPendingEvents = placedEvents.filter((item) => item.status !== "pending");
  const totalCards = placedEvents.length;

  // Calculate spacing - keep cards compact, only compress when needed
  const calculateSpacing = () => {
    const normalSpacing = CARD_HEIGHT + NORMAL_GAP; // 88px per card slot
    const neededHeight = totalCards * CARD_HEIGHT + (totalCards - 1) * NORMAL_GAP;
    
    // If everything fits with normal spacing, use normal spacing
    if (neededHeight <= MAX_CONTAINER_HEIGHT) {
      return normalSpacing;
    }
    
    // Need to compress - calculate how much space we have per card
    const availableHeight = MAX_CONTAINER_HEIGHT;
    const spacing = (availableHeight - CARD_HEIGHT) / Math.max(1, totalCards - 1);
    return Math.max(MIN_VISIBLE_HEIGHT, spacing);
  };

  const cardSpacing = calculateSpacing();
  const isOverlapping = cardSpacing < CARD_HEIGHT;

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

  // Calculate vertical offset for each card
  const getCardStyle = (index: number, isPending: boolean, eventId: string) => {
    const isHovered = hoveredCardId === eventId && isOverlapping && !isDragging;
    const baseZIndex = index + 1; // Later cards have higher z-index (overlap on top)
    
    return {
      zIndex: isHovered ? 50 : baseZIndex,
      transform: isHovered ? 'translateY(-20px) scale(1.02)' : 'none',
      transition: 'transform 0.2s ease-out, z-index 0s',
    };
  };

  // Build items - drop zones overlay between cards
  const items: JSX.Element[] = [];

  // Drop zone BEFORE first card
  if (isDragging) {
    items.push(
      <div 
        key="drop-0"
        className={`relative transition-all duration-200 ease-out rounded-xl border-2 border-dashed flex items-center justify-center z-40 ${
          activeDropZone === 0 
            ? 'h-20 border-primary bg-primary/20 mb-3 shadow-lg' 
            : 'h-0 border-transparent overflow-hidden'
        }`}
      >
        {activeDropZone === 0 && (
          <span className="text-primary text-sm font-semibold">Drop here</span>
        )}
      </div>
    );
  }

  placedEvents.forEach((item, index) => {
    const isPending = item.status === "pending";
    const isPendingAndDragging = isPending && isDragging;
    
    // Calculate margin for stacking effect - ALWAYS use compressed spacing
    const marginTop = index === 0 ? 0 : cardSpacing - CARD_HEIGHT;
    
    // Get drop position for after this card
    const nonPendingIndex = nonPendingEvents.findIndex((e) => e.event.id === item.event.id);
    const dropPositionAfter = nonPendingIndex + 1;
    const showDropAfter = !isPending && isDragging && activeDropZone === dropPositionAfter;
    
    items.push(
      <div 
        key={item.event.id}
        ref={(el) => {
          if (el) cardRefs.current.set(item.event.id, el);
          else cardRefs.current.delete(item.event.id);
        }}
        className={`relative flex items-center gap-3 ${isPendingAndDragging ? 'opacity-50 pointer-events-none' : ''}`}
        style={{
          marginTop,
          ...getCardStyle(index, isPending, item.event.id),
        }}
        onMouseEnter={() => !isDragging && setHoveredCardId(item.event.id)}
        onMouseLeave={() => setHoveredCardId(null)}
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
          <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 z-20">
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

    // Drop zone AFTER this non-pending card
    if (!isPending && isDragging) {
      items.push(
        <div 
          key={`drop-${dropPositionAfter}`}
          className={`relative transition-all duration-200 ease-out rounded-xl border-2 border-dashed flex items-center justify-center z-40 ${
            activeDropZone === dropPositionAfter 
              ? 'h-20 border-primary bg-primary/20 mt-3 shadow-lg' 
              : 'h-0 border-transparent overflow-hidden'
          }`}
        >
          {activeDropZone === dropPositionAfter && (
            <span className="text-primary text-sm font-semibold">Drop here</span>
          )}
        </div>
      );
    }
  });

  return (
    <div 
      ref={timelineRef}
      className="relative"
      style={{ minHeight: 100 }}
    >
      {/* Timeline line - absolutely positioned, won't move */}
      <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border" />
      
      {/* Timeline content */}
      <div className="relative pl-14 flex flex-col">
        {items}
      </div>
    </div>
  );
}
