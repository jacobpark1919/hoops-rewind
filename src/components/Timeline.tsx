import { useRef, useEffect, useState, useCallback } from "react";
import { SportsEvent } from "@/data/sportsEvents";
import { EventCard } from "./EventCard";
import { DropZone } from "./DropZone";
import { Button } from "@/components/ui/button";

interface TimelineProps {
  placedEvents: Array<{ event: SportsEvent; status: "correct" | "incorrect" | "pending" | "corrected" | null }>;
  activeDropZone: number | null;
  isDragging: boolean;
  isDraggingDown: boolean;
  draggingCardHeight: number;
  incorrectEventIds?: Set<string>;
  dragY: number | null;
  onDrop: (position: number) => void;
  onDropZoneChange: (position: number | null) => void;
  onConfirm?: () => void;
  onCancel?: () => void;
  onPendingDragStart?: (e: React.MouseEvent | React.TouchEvent, element: HTMLElement) => void;
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
  isDraggingDown,
  draggingCardHeight,
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

  // Lock gap when dragging OR when a pending placement exists (card just dropped).
  // This prevents any layout recalculation from shifting the timeline during the
  // drag → drop → confirm flow. Gap is only released after the placement is resolved.
  const hasPending = placedEvents.some(item => item.status === "pending");
  const lockedRef = useRef<number | null>(null);
  useEffect(() => {
    if (isDragging || hasPending) {
      // Only capture once — don't overwrite once locked
      if (lockedRef.current === null) {
        lockedRef.current = dynamicGap;
        setLockedGap(dynamicGap);
      }
    } else {
      lockedRef.current = null;
      setLockedGap(null);
    }
  }, [isDragging, hasPending]); // intentionally only depend on isDragging / hasPending

  const activeGap = lockedGap !== null ? lockedGap : dynamicGap;
  const isOverlapping = activeGap < 0;

  // Pending card (if any)
  const pendingItem = placedEvents.find(item => item.status === "pending");

  // Filter out pending items for drop position calculation
  const nonPendingEvents = placedEvents.filter((item) => item.status !== "pending");

  // Snapshot card centers at the moment drag begins (before any zone expansion).
  const snapshotCenters = useRef<number[]>([]);

  useEffect(() => {
    if (isDragging && snapshotCenters.current.length === 0) {
      const centers: number[] = [];
      nonPendingEvents.forEach((item) => {
        const el = cardRefs.current.get(item.event.id);
        if (el) {
          const rect = el.getBoundingClientRect();
          centers.push((rect.top + rect.bottom) / 2);
        }
      });
      snapshotCenters.current = centers;
    }
    if (!isDragging) {
      snapshotCenters.current = [];
    }
  }, [isDragging]);

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

    if (isDraggingDown) {
      const liveCenters: number[] = [];
      nonPendingEvents.forEach((item) => {
        const el = cardRefs.current.get(item.event.id);
        if (el) {
          const rect = el.getBoundingClientRect();
          liveCenters.push((rect.top + rect.bottom) / 2);
        }
      });
      liveCenters.sort((a, b) => a - b);

      if (liveCenters.length === 0) { onDropZoneChange(0); return; }

      const zone0Threshold = liveCenters[0] + draggingCardHeight / 2;
      if (dragY < zone0Threshold) { onDropZoneChange(0); return; }

      for (let i = 0; i < liveCenters.length - 1; i++) {
        if (dragY < liveCenters[i + 1]) { onDropZoneChange(i + 1); return; }
      }
      onDropZoneChange(liveCenters.length);
    } else {
      const centers = snapshotCenters.current;

      if (centers.length === 0) { onDropZoneChange(0); return; }
      if (dragY < centers[0]) { onDropZoneChange(0); return; }
      for (let i = 0; i < centers.length - 1; i++) {
        if (dragY < centers[i + 1]) { onDropZoneChange(i + 1); return; }
      }
      onDropZoneChange(centers.length);
    }
  }, [isDragging, isDraggingDown, dragY, onDropZoneChange, nonPendingEvents]);


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

  // Render a drop zone slot — if frozen (not dragging) and this is the active slot,
  // render the pending card inside it instead of "Drop here" text.
  const renderDropZone = (position: number, marginClass?: string) => {
    const isActive = activeDropZone === position;
    const isFrozen = isActive && !isDragging && pendingItem;

    if (isFrozen) {
      // Render the pending card living inside the drop zone area.
      // No CSS transitions on this container — prevents any height animation on drop.
      // min-h-28 matches the active drop zone height so the layout stays pixel-perfect static.
      return (
        <div
          key={`drop-${position}`}
          className={`relative rounded-xl border-2 border-dashed border-primary bg-primary/10 z-40 min-h-28 flex flex-col justify-center p-2 ${marginClass ?? ''}`}
        >
          <div
            ref={(el) => {
              if (el) cardRefs.current.set(pendingItem.event.id, el);
              else cardRefs.current.delete(pendingItem.event.id);
            }}
            onMouseDown={(e) => {
              const target = e.currentTarget;
              onPendingDragStart?.(e, target);
            }}
            onTouchStart={(e) => {
              const target = e.currentTarget;
              onPendingDragStart?.(e, target);
            }}
            className="cursor-grab active:cursor-grabbing relative touch-none"
          >
            <EventCard event={pendingItem.event} showYear={false} status={pendingItem.status} />
            {onConfirm && (
              <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 z-20">
                <Button onClick={onConfirm} size="sm" className="rounded-full shadow-lg px-4 text-sm font-medium">
                  Tap to place
                </Button>
              </div>
            )}
          </div>
        </div>
      );
    }

    // Normal drop zone (during drag, or collapsed)
    return (
      <div
        key={`drop-${position}`}
        className={`relative transition-all duration-300 ease-out rounded-xl border-2 border-dashed flex items-center justify-center z-40 ${
          isActive
            ? `h-28 border-primary bg-primary/20 shadow-lg ${marginClass ?? ''}`
            : 'h-0 border-transparent overflow-hidden'
        }`}
      >
        {isActive && (
          <span className="text-primary text-sm font-semibold">Drop here</span>
        )}
      </div>
    );
  };

  // Build items
  const items: JSX.Element[] = [];

  // Whether to show drop zones (during drag OR frozen/pending state)
  const showDropZones = isDragging || activeDropZone !== null;

  // Drop zone BEFORE first card
  if (showDropZones) {
    items.push(renderDropZone(0, activeDropZone === 0 ? 'mb-3' : ''));
  }

  let prevWasActiveDropZone = activeDropZone === 0;

  nonPendingEvents.forEach((item, nonPendingIndex) => {
    const index = placedEvents.findIndex(p => p.event.id === item.event.id);
    const dropPositionAfter = nonPendingIndex + 1;

    const isPrevActiveZone = prevWasActiveDropZone;
    const gap = nonPendingIndex === 0 ? 0 : activeGap;
    const marginTop = isPrevActiveZone ? Math.max(gap, NORMAL_GAP) : gap;

    const isHovered = hoveredCardId === item.event.id && isOverlapping && !isDragging;
    const baseZIndex = nonPendingIndex + 1;

    items.push(
      <div
        key={item.event.id}
        ref={(el) => {
          if (el) cardRefs.current.set(item.event.id, el);
          else cardRefs.current.delete(item.event.id);
        }}
        className="relative flex items-center gap-3"
        style={{
          marginTop,
          zIndex: isHovered ? 50 : baseZIndex,
          transform: isHovered ? 'translateY(-20px) scale(1.02)' : 'none',
          transition: 'transform 0.2s ease-out, z-index 0s',
        }}
        onMouseEnter={() => !isDragging && setHoveredCardId(item.event.id)}
        onMouseLeave={() => setHoveredCardId(null)}
      >
        {/* Year badge */}
        <div className="absolute -left-8 top-1/2 -translate-y-1/2 -translate-x-1/2 z-10">
          <span className={`year-badge ${incorrectEventIds?.has(item.event.id) ? 'year-badge-incorrect' : ''}`}>
            {item.event.year}
          </span>
        </div>

        <div className="flex-1">
          <EventCard event={item.event} showYear={false} status={item.status} />
        </div>
      </div>
    );

    // Drop zone AFTER this non-pending card
    if (showDropZones) {
      const marginClass = activeDropZone === dropPositionAfter ? 'mt-3' : '';
      items.push(renderDropZone(dropPositionAfter, marginClass));
      prevWasActiveDropZone = activeDropZone === dropPositionAfter;
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
