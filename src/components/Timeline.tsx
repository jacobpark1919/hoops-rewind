import { useRef, useEffect, useState, useCallback } from "react";
import { SportsEvent } from "@/data/sportsEvents";
import { EventCard } from "./EventCard";
import { DropZone } from "./DropZone";
import { Button } from "@/components/ui/button";

interface TimelineProps {
  placedEvents: Array<{ event: SportsEvent; status: "correct" | "incorrect" | "pending" | "corrected" | null }>;
  activeDropZone: number | null;
  isDragging: boolean;
  incorrectEventIds?: Set<string>;
  dragY: number | null;
  onDrop: (position: number) => void;
  onDropZoneChange: (position: number | null) => void;
  onConfirm?: () => void;
  onCancel?: () => void;
  onPendingDragStart?: (e: React.MouseEvent, element: HTMLElement) => void;
  onPendingDragEnd?: () => void;
}

const NORMAL_GAP = 8;
const MIN_VISIBLE_HEIGHT = 28;
const PENDING_EXTRA_SPACE = 36;
const BOTTOM_PADDING = 20;

export function Timeline({
  placedEvents,
  activeDropZone,
  isDragging,
  incorrectEventIds,
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
  const [dynamicGap, setDynamicGap] = useState<number>(NORMAL_GAP);
  const [lockedGap, setLockedGap] = useState<number | null>(null);

  // Measure available space
  useEffect(() => {
    const measure = () => {
      if (timelineRef.current) {
        requestAnimationFrame(() => {
          if (timelineRef.current) {
            const rect = timelineRef.current.getBoundingClientRect();
            const height = window.innerHeight - rect.top - BOTTOM_PADDING;
            setAvailableHeight(Math.max(200, height));
          }
        });
      }
    };
    measure();
    window.addEventListener('resize', measure);
    const observer = new ResizeObserver(measure);
    if (timelineRef.current?.parentElement) {
      observer.observe(timelineRef.current.parentElement);
    }
    return () => {
      window.removeEventListener('resize', measure);
      observer.disconnect();
    };
  }, [placedEvents.length]);

  // Calculate dynamic gap based on measured card heights vs available space
  useEffect(() => {
    if (placedEvents.length <= 1) {
      setDynamicGap(NORMAL_GAP);
      return;
    }

    requestAnimationFrame(() => {
      const heights: number[] = [];
      placedEvents.forEach(item => {
        const el = cardRefs.current.get(item.event.id);
        if (el) heights.push(el.offsetHeight);
      });

      if (heights.length <= 1) {
        setDynamicGap(NORMAL_GAP);
        return;
      }

      const hasPending = placedEvents.some(item => item.status === "pending");
      const extra = hasPending ? PENDING_EXTRA_SPACE : 0;
      const totalCardHeight = heights.reduce((a, b) => a + b, 0);
      const naturalTotal = totalCardHeight + (heights.length - 1) * NORMAL_GAP + extra;

      if (naturalTotal <= availableHeight) {
        setDynamicGap(NORMAL_GAP);
        return;
      }

      const overflow = naturalTotal - availableHeight;
      const newGap = NORMAL_GAP - overflow / (heights.length - 1);
      const maxH = Math.max(...heights);
      const minGap = -(maxH - MIN_VISIBLE_HEIGHT);

      setDynamicGap(Math.max(minGap, newGap));
    });
  }, [placedEvents, availableHeight]);

  // Lock gap when drag starts
  useEffect(() => {
    if (isDragging) {
      setLockedGap(dynamicGap);
    } else {
      setLockedGap(null);
    }
  }, [isDragging]); // intentionally only depend on isDragging

  const activeGap = lockedGap !== null ? lockedGap : dynamicGap;
  const isOverlapping = activeGap < 0;

  // Filter out pending items for drop position calculation
  const nonPendingEvents = placedEvents.filter((item) => item.status !== "pending");
  const totalCards = placedEvents.length;

  // Calculate which drop zone the cursor is over
  // We use a simple approach: divide the space evenly by card count using
  // the original (pre-expansion) card center positions captured on drag start.
  const originalCardCenters = useRef<number[]>([]);

  // Capture card centers when drag starts (before any drop zones expand)
  useEffect(() => {
    if (isDragging && originalCardCenters.current.length === 0) {
      const centers: number[] = [];
      nonPendingEvents.forEach((item) => {
        const element = cardRefs.current.get(item.event.id);
        if (element) {
          const rect = element.getBoundingClientRect();
          centers.push((rect.top + rect.bottom) / 2);
        }
      });
      centers.sort((a, b) => a - b);
      originalCardCenters.current = centers;
    }
    if (!isDragging) {
      originalCardCenters.current = [];
    }
  }, [isDragging]); // intentionally only depend on isDragging to capture once

  useEffect(() => {
    if (!isDragging || dragY === null || !timelineRef.current) {
      onDropZoneChange(null);
      return;
    }

    const timelineRect = timelineRef.current.getBoundingClientRect();
    const isOver = dragY >= timelineRect.top - 60 && dragY <= timelineRect.bottom + 60;

    if (!isOver) {
      onDropZoneChange(null);
      return;
    }

    const centers = originalCardCenters.current;

    if (centers.length === 0) {
      onDropZoneChange(0);
      return;
    }

    // dragY is already the trailing edge of the dragged card:
    // - bottom edge when dragging down
    // - top edge when dragging up
    // Activate a drop zone when that edge crosses the center of the adjacent card.

    // Position 0: dragged card's edge is above the center of the first card
    if (dragY < centers[0]) {
      onDropZoneChange(0);
      return;
    }

    // Between cards: activate zone i+1 when edge crosses center of card i+1
    for (let i = 0; i < centers.length - 1; i++) {
      if (dragY < centers[i + 1]) {
        onDropZoneChange(i + 1);
        return;
      }
    }

    // Position after last card
    onDropZoneChange(centers.length);
  }, [isDragging, dragY, onDropZoneChange]);

  // Card style for z-index and hover effects
  const getCardStyle = (index: number, isPending: boolean, eventId: string) => {
    const isHovered = hoveredCardId === eventId && isOverlapping && !isDragging;
    const baseZIndex = index + 1;

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

  // Build items
  const items: JSX.Element[] = [];

  // Drop zone BEFORE first card
  if (isDragging) {
    items.push(
      <div
        key="drop-0"
        className={`relative transition-all duration-200 ease-out rounded-xl border-2 border-dashed flex items-center justify-center z-40 ${
          activeDropZone === 0
            ? 'h-36 border-primary bg-primary/20 mb-3 shadow-lg'
            : 'h-0 border-transparent overflow-hidden'
        }`}
      >
        {activeDropZone === 0 && (
          <span className="text-primary text-sm font-semibold">Drop here</span>
        )}
      </div>
    );
  }

  let prevWasActiveDropZone = activeDropZone === 0;

  placedEvents.forEach((item, index) => {
    const isPending = item.status === "pending";
    const isPendingAndDragging = isPending && isDragging;

    const isPrevPending = index > 0 && placedEvents[index - 1].status === "pending";
    // Pending cards always get normal gap to stay readable
    const gap = index === 0 ? 0 : (isPending || isPrevPending) ? Math.max(NORMAL_GAP, activeGap) : activeGap;
    const marginTop = prevWasActiveDropZone ? Math.max(gap, NORMAL_GAP) : gap;

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
        className={`relative flex items-center gap-3 ${isPendingAndDragging ? 'hidden' : ''}`}
        style={{
          marginTop,
          ...getCardStyle(index, isPending, item.event.id),
        }}
        onMouseEnter={() => !isDragging && setHoveredCardId(item.event.id)}
        onMouseLeave={() => setHoveredCardId(null)}
      >
        {/* Year badge */}
        <div
          className="absolute -left-8 top-1/2 -translate-y-1/2 -translate-x-1/2 z-10"
          style={{ opacity: isPending ? 0 : 1 }}
        >
          <span className={`year-badge ${incorrectEventIds?.has(item.event.id) ? 'year-badge-incorrect' : ''}`}>{item.event.year}</span>
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
              <EventCard event={item.event} showYear={false} status={item.status} />
            </div>
          ) : (
            <EventCard event={item.event} showYear={false} status={item.status} />
          )}
        </div>

        {/* Tap to place button for pending card */}
        {isPending && onConfirm && !isDragging && (
          <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 z-20">
            <Button onClick={onConfirm} size="sm" className="rounded-full shadow-lg px-4 text-sm font-medium">
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
          className={`relative transition-all duration-200 ease-out rounded-xl border-2 border-dashed flex items-center justify-center z-40 ${
            isActive
              ? 'h-36 border-primary bg-primary/20 mt-3 shadow-lg'
              : 'h-0 border-transparent overflow-hidden'
          }`}
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
      {/* Timeline line */}
      <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border" />

      {/* Timeline content */}
      <div className="relative pl-14 flex flex-col">
        {items}
      </div>
    </div>
  );
}
