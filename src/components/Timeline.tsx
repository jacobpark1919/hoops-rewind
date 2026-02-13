import { useRef, useEffect, useState, useCallback } from "react";
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
const CARD_HEIGHT = 80; // Approximate card height in px
const NORMAL_GAP = 16; // Normal gap between cards
const MIN_VISIBLE_HEIGHT = 32; // Minimum visible portion when overlapped
const PENDING_EXTRA_SPACE = 48; // Extra space for pending card's "Tap to place" button

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
  const [availableHeight, setAvailableHeight] = useState<number>(9999);
  const [lockedSpacing, setLockedSpacing] = useState<number | null>(null);

  // Measure available space: viewport height minus timeline's absolute page position
  // Uses scroll-independent calculation so overlapping is consistent
  useEffect(() => {
    const measure = () => {
      if (timelineRef.current) {
        requestAnimationFrame(() => {
          if (timelineRef.current) {
            // absoluteTop = distance from document top (scroll-independent)
            const rect = timelineRef.current.getBoundingClientRect();
            const absoluteTop = rect.top + window.scrollY;
            const height = window.innerHeight - absoluteTop - 24;
            setAvailableHeight(Math.max(200, height));
          }
        });
      }
    };
    measure();
    window.addEventListener('resize', measure);
    // Also re-measure when content above changes (e.g. card placed, instructions dismissed)
    const observer = new ResizeObserver(measure);
    if (timelineRef.current?.parentElement) {
      observer.observe(timelineRef.current.parentElement);
    }
    return () => {
      window.removeEventListener('resize', measure);
      observer.disconnect();
    };
  }, [placedEvents.length]);

  // Filter out pending items for drop position calculation
  const nonPendingEvents = placedEvents.filter((item) => item.status !== "pending");
  const totalCards = placedEvents.length;

  // Calculate spacing - only compress when cards would overflow available space
  const hasPending = placedEvents.some(item => item.status === "pending");
  
  const calculateSpacing = () => {
    const normalSpacing = CARD_HEIGHT + NORMAL_GAP;
    const extraForPending = hasPending ? PENDING_EXTRA_SPACE : 0;
    const neededHeight = totalCards * CARD_HEIGHT + (totalCards - 1) * NORMAL_GAP + extraForPending;
    
    if (neededHeight <= availableHeight) {
      return normalSpacing;
    }
    
    const effectiveAvailable = availableHeight - extraForPending;
    const spacing = (effectiveAvailable - CARD_HEIGHT) / Math.max(1, totalCards - 1);
    return Math.max(MIN_VISIBLE_HEIGHT, spacing);
  };

  const computedSpacing = calculateSpacing();
  
  // Lock spacing when drag starts so timeline doesn't shift
  useEffect(() => {
    if (isDragging) {
      setLockedSpacing(computedSpacing);
    } else {
      setLockedSpacing(null);
    }
  }, [isDragging]); // intentionally only depend on isDragging, not computedSpacing

  const cardSpacing = lockedSpacing !== null ? lockedSpacing : computedSpacing;
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

    // Buffer: how far into a card the cursor can be and still trigger the adjacent gap
    const TRIGGER_BUFFER = 20;

    // Check if above the first card (with buffer into the card)
    if (dragY < cardPositions[0].top + TRIGGER_BUFFER) {
      onDropZoneChange(0);
      return;
    }

    // Check if below the last card (with buffer into the card)
    const lastCard = cardPositions[cardPositions.length - 1];
    if (dragY > lastCard.bottom - TRIGGER_BUFFER) {
      onDropZoneChange(cardPositions.length);
      return;
    }

    // Check between cards — only trigger when cursor is actually in/near the gap
    for (let i = 0; i < cardPositions.length - 1; i++) {
      const card = cardPositions[i];
      const nextCard = cardPositions[i + 1];
      
      // The gap region, expanded by TRIGGER_BUFFER into each card
      const gapTop = card.bottom - TRIGGER_BUFFER;
      const gapBottom = nextCard.top + TRIGGER_BUFFER;
      
      if (dragY >= gapTop && dragY <= gapBottom) {
        onDropZoneChange(i + 1);
        return;
      }
    }

    // Cursor is solidly on a card, not near any gap — no drop zone
    onDropZoneChange(null);
  }, [isDragging, dragY, nonPendingEvents.length, onDropZoneChange]);

  // Calculate vertical offset for each card
  const getCardStyle = (index: number, isPending: boolean, eventId: string) => {
    const isHovered = hoveredCardId === eventId && isOverlapping && !isDragging;
    const baseZIndex = index + 1;
    
    // Pending cards always get high z-index so they're fully visible and clickable
    if (isPending && !isDragging) {
      return {
        zIndex: 50,
        transform: 'none',
        transition: 'transform 0.2s ease-out, z-index 0s',
        marginBottom: isOverlapping ? `${PENDING_EXTRA_SPACE}px` : undefined,
      };
    }
    
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
        className={`relative rounded-xl border-2 border-dashed flex items-center justify-center z-40 ${
          activeDropZone === 0 
            ? 'h-36 border-primary bg-primary/20 mb-3 shadow-lg' 
            : 'h-0 border-transparent overflow-hidden'
        }`}
        style={{ transition: 'height 0.35s cubic-bezier(0.25, 0.1, 0.25, 1), margin 0.35s cubic-bezier(0.25, 0.1, 0.25, 1), border-color 0.2s, background-color 0.2s, box-shadow 0.2s' }}
      >
        {activeDropZone === 0 && (
          <span className="text-primary text-sm font-semibold">Drop here</span>
        )}
      </div>
    );
  }

  // Track which drop zone positions are active for margin adjustments
  let prevWasActiveDropZone = activeDropZone === 0;

  placedEvents.forEach((item, index) => {
    const isPending = item.status === "pending";
    const isPendingAndDragging = isPending && isDragging;
    
    // Calculate margin - pending cards get extra space around them for readability
    const isPrevPending = index > 0 && placedEvents[index - 1].status === "pending";
    // If the previous drop zone is active, use normal gap so the card doesn't overlap into the drop zone
    const baseMargin = index === 0 ? 0 : isPending ? NORMAL_GAP : isPrevPending ? NORMAL_GAP : cardSpacing - CARD_HEIGHT;
    const marginTop = prevWasActiveDropZone ? Math.max(baseMargin, NORMAL_GAP) : baseMargin;
    
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
          transition: 'margin-top 0.4s cubic-bezier(0.25, 0.1, 0.25, 1), transform 0.3s ease-out, z-index 0s',
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
      const isActive = activeDropZone === dropPositionAfter;
      items.push(
        <div 
          key={`drop-${dropPositionAfter}`}
          className={`relative rounded-xl border-2 border-dashed flex items-center justify-center z-40 ${
            isActive 
              ? 'h-36 border-primary bg-primary/20 mt-3 shadow-lg' 
              : 'h-0 border-transparent overflow-hidden'
          }`}
          style={{ transition: 'height 0.35s cubic-bezier(0.25, 0.1, 0.25, 1), margin 0.35s cubic-bezier(0.25, 0.1, 0.25, 1), border-color 0.2s, background-color 0.2s, box-shadow 0.2s' }}
        >
          {isActive && (
            <span className="text-primary text-sm font-semibold">Drop here</span>
          )}
        </div>
      );
      prevWasActiveDropZone = isActive;
    } else {
      prevWasActiveDropZone = false;
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
