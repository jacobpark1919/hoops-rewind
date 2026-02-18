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

  // Calculate which drop zone the cursor is over using live card measurements.
  // Since drop zones no longer shift layout, live measurements are always accurate.
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

    // Measure card centers live from the DOM
    const centers: number[] = [];
    nonPendingEvents.forEach((item) => {
      const element = cardRefs.current.get(item.event.id);
      if (element) {
        const rect = element.getBoundingClientRect();
        centers.push((rect.top + rect.bottom) / 2);
      }
    });

    if (centers.length === 0) {
      onDropZoneChange(0);
      return;
    }

    // Position 0: above first card center
    if (dragY < centers[0]) {
      onDropZoneChange(0);
      return;
    }

    // Between cards: use midpoints between consecutive card centers
    for (let i = 0; i < centers.length - 1; i++) {
      const midpoint = (centers[i] + centers[i + 1]) / 2;
      if (dragY < midpoint) {
        onDropZoneChange(i + 1);
        return;
      }
    }

    // Position after last card
    onDropZoneChange(centers.length);
  }, [isDragging, dragY, onDropZoneChange, nonPendingEvents]);

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

  placedEvents.forEach((item, index) => {
    const isPending = item.status === "pending";
    const isPendingAndDragging = isPending && isDragging;

    const isPrevPending = index > 0 && placedEvents[index - 1].status === "pending";
    const gap = index === 0 ? 0 : (isPending || isPrevPending) ? Math.max(NORMAL_GAP, activeGap) : activeGap;

    const nonPendingIndex = nonPendingEvents.findIndex((e) => e.event.id === item.event.id);
    const dropPositionBefore = nonPendingIndex;
    const isFirstNonPending = nonPendingIndex === 0;
    const showDropBefore = isFirstNonPending && !isPending && isDragging && activeDropZone === 0;

    items.push(
      <div
        key={item.event.id}
        ref={(el) => {
          if (el) cardRefs.current.set(item.event.id, el);
          else cardRefs.current.delete(item.event.id);
        }}
        className={`relative flex items-center gap-3 ${isPendingAndDragging ? 'hidden' : ''}`}
        style={{
          marginTop: gap,
          ...getCardStyle(index, isPending, item.event.id),
        }}
        onMouseEnter={() => !isDragging && setHoveredCardId(item.event.id)}
        onMouseLeave={() => setHoveredCardId(null)}
      >
        {/* Drop indicator BEFORE this card (only for first non-pending card, position 0) */}
        {showDropBefore && (
          <div className="absolute -top-1 left-0 right-0 z-40 flex items-center justify-center pointer-events-none" style={{ transform: 'translateY(-100%)' }}>
            <div className="rounded-full bg-primary/20 border-2 border-dashed border-primary px-4 py-1.5 shadow-lg">
              <span className="text-primary text-sm font-semibold">Drop here</span>
            </div>
          </div>
        )}

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

        {/* Drop indicator AFTER this card (overlay, no layout shift) */}
        {!isPending && isDragging && activeDropZone === nonPendingIndex + 1 && (
          <div className="absolute -bottom-1 left-0 right-0 z-40 flex items-center justify-center pointer-events-none" style={{ transform: 'translateY(100%)' }}>
            <div className="rounded-full bg-primary/20 border-2 border-dashed border-primary px-4 py-1.5 shadow-lg">
              <span className="text-primary text-sm font-semibold">Drop here</span>
            </div>
          </div>
        )}

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
