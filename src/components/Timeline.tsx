import { useRef, useEffect, useLayoutEffect, useState, useCallback } from "react";
import { SportsEvent } from "@/data/sportsEvents";
import { EventCard } from "./EventCard";
import { DropZone } from "./DropZone";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";

interface TimelineProps {
  placedEvents: Array<{ event: SportsEvent; status: "correct" | "incorrect" | "pending" | "corrected" | null }>;
  activeDropZone: number | null;
  isDragging: boolean;
  isDraggingDown: boolean;
  draggingCardHeight: number;
  incorrectEventIds?: Set<string>;
  correctEventIds?: Set<string>;
  dragY: number | null;
  onDrop: (position: number) => void;
  onDropZoneChange: (position: number | null) => void;
  onConfirm?: () => void;
  onCancel?: () => void;
  onPendingDragStart?: (e: React.PointerEvent, element: HTMLElement) => void;
  onPendingDragEnd?: () => void;
  isViewingTimeline?: boolean;
  sportFilter?: string | null;
  onRetry?: () => void;
  onSportChange?: (sport: string | null) => void;
}

const NORMAL_GAP = 8;
const MIN_VISIBLE_HEIGHT = 10;
const PENDING_EXTRA_SPACE = 36;
const BOTTOM_PADDING = 80;

const SPORT_MODE_OPTIONS = [
  { label: "Everything", value: null, icon: "🏆", path: "/" },
  { label: "Football", value: "American Football", icon: "🏈", path: "/?sport=American+Football" },
  { label: "Basketball", value: "Basketball", icon: "🏀", path: "/?sport=Basketball" },
];

export function Timeline({
  placedEvents,
  activeDropZone,
  isDragging,
  isDraggingDown,
  draggingCardHeight,
  incorrectEventIds,
  correctEventIds,
  dragY,
  onDrop,
  onDropZoneChange,
  onConfirm,
  onCancel,
  onPendingDragStart,
  onPendingDragEnd,
  isViewingTimeline,
  sportFilter,
  onRetry,
  onSportChange,
}: TimelineProps) {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const bottomPadding = isMobile ? BOTTOM_PADDING : Math.round(window.innerHeight / 12);
  const timelineRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const [hoveredCardId, setHoveredCardId] = useState<string | null>(null);
  const [availableHeight, setAvailableHeight] = useState<number>(9999);
  const [dynamicGap, setDynamicGap] = useState<number>(NORMAL_GAP);
  const [lockedGap, setLockedGap] = useState<number | null>(null);
  const [naturalPaddingTop, setNaturalPaddingTop] = useState(0);
  const innerWrapperRef = useRef<HTMLDivElement>(null);

  // Measure available space
  useEffect(() => {
    const measure = () => {
      if (timelineRef.current) {
        requestAnimationFrame(() => {
          if (timelineRef.current) {
            const rect = timelineRef.current.getBoundingClientRect();
            const height = window.innerHeight - rect.top - bottomPadding;
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

  useEffect(() => {
    if (!isDragging && !hasPending && innerWrapperRef.current) {
      const contentHeight = innerWrapperRef.current.offsetHeight;
      setNaturalPaddingTop(Math.max(0, (availableHeight - contentHeight) / 2));
    }
  }, [placedEvents, availableHeight, isDragging, hasPending, dynamicGap]);

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

  // Build the effective events list — append CTA card when viewing timeline
  const CTA_EVENT_ID = "__cta__";
  const ctaEvent: { event: SportsEvent; status: "correct" | "incorrect" | "pending" | "corrected" | null } = {
    event: { id: CTA_EVENT_ID, title: "", year: 9999, sport: "", icon: "" } as SportsEvent,
    status: null,
  };
  const effectivePlacedEvents = isViewingTimeline
    ? [...placedEvents, ctaEvent]
    : placedEvents;

  // Pending card (if any)
  const pendingItem = effectivePlacedEvents.find(item => item.status === "pending");

  // Filter out pending items for drop position calculation
  const nonPendingEvents = effectivePlacedEvents.filter((item) => item.status !== "pending");

  // Snapshot card centers at the moment drag begins (before any zone expansion).
  const snapshotCenters = useRef<number[]>([]);

  useLayoutEffect(() => {
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

      if (dragY < liveCenters[0]) { onDropZoneChange(0); return; }

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
          className={`relative rounded-xl border-2 border-dashed border-primary bg-primary/10 z-40 min-h-28 sm:min-h-32 flex flex-col justify-center p-2 ${marginClass ?? ''}`}
        >
          <div
            ref={(el) => {
              if (el) cardRefs.current.set(pendingItem.event.id, el);
              else cardRefs.current.delete(pendingItem.event.id);
            }}
            onPointerDown={(e) => {
              const target = e.currentTarget;
              onPendingDragStart?.(e, target);
            }}
            className="cursor-grab active:cursor-grabbing relative touch-none"
          >
            <EventCard event={pendingItem.event} showYear={false} status={pendingItem.status} />
            {onConfirm && (
              <div
                className="absolute -bottom-5 left-1/2 -translate-x-1/2 z-20"
                onPointerDown={(e) => e.stopPropagation()}
              >
                <Button
                  onPointerUp={(e) => {
                    e.stopPropagation();
                    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                    const { clientX, clientY } = e;
                    if (clientX >= rect.left && clientX <= rect.right && clientY >= rect.top && clientY <= rect.bottom) {
                      onConfirm();
                    }
                  }}
                  size="sm"
                  className="rounded-full shadow-lg px-5 py-3 text-sm font-medium min-h-[44px] bg-accent text-accent-foreground hover:bg-accent/90"
                >
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
        className={`relative rounded-xl border-2 border-dashed flex items-center justify-center z-40 ${
          isActive
            ? 'border-primary bg-primary/20 shadow-lg'
            : 'border-transparent overflow-hidden'
        }`}
        style={{
          height: isActive ? (window.innerWidth >= 640 ? 128 : 112) : 0,
          marginTop: isActive && marginClass?.includes('mt-3') ? 12 : 0,
          marginBottom: isActive && marginClass?.includes('mb-3') ? 12 : 0,
          transition: 'height 350ms cubic-bezier(0.25, 0.1, 0.25, 1), margin 350ms cubic-bezier(0.25, 0.1, 0.25, 1)',
        }}
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
    const isCta = item.event.id === CTA_EVENT_ID;
    const otherModes = SPORT_MODE_OPTIONS.filter(s => s.value !== (sportFilter ?? null));

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
          transition: 'margin-top 0.3s ease-out, transform 0.2s ease-out, z-index 0s',
        }}
        onMouseEnter={() => !isDragging && setHoveredCardId(item.event.id)}
        onMouseLeave={() => setHoveredCardId(null)}
      >
        {/* Year badge or dot for CTA */}
        <div className="absolute -left-6 sm:-left-8 top-1/2 -translate-y-1/2 -translate-x-1/2 z-10">
          {isCta ? (
            <span className="w-3 h-3 rounded-full bg-primary block" />
          ) : (
            <span className={`year-badge ${incorrectEventIds?.has(item.event.id) ? 'year-badge-incorrect' : correctEventIds?.has(item.event.id) ? 'year-badge-correct' : ''}`}>
              {item.event.year}
            </span>
          )}
        </div>

        <div className="flex-1">
          {isCta ? (
            <div
              className="timeline-card bg-card hover:bg-card-hover select-none transition-colors"
              style={{
                boxShadow: '0 4px 12px -2px rgba(0, 0, 0, 0.15), 0 2px 6px -2px rgba(0, 0, 0, 0.1)',
              }}
            >
              <div className="flex items-center gap-1.5 flex-wrap justify-center py-0.5">
                  <p className="font-display text-xs sm:text-sm font-semibold text-foreground leading-tight">
                    Come back tomorrow for a new puzzle!
                  </p>
                  <button
                    onClick={onRetry}
                    className="px-2.5 py-0.5 rounded-full bg-primary text-primary-foreground font-display font-bold text-xs sm:text-sm hover:bg-primary/80 transition-colors whitespace-nowrap"
                  >
                    Retry
                  </button>
              </div>
            </div>
          ) : (
            <EventCard event={item.event} showYear={false} status={item.status} />
          )}
        </div>
      </div>
    );

    // Drop zone AFTER this non-pending card (skip for CTA)
    if (showDropZones && !isCta) {
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
      className="relative flex-1 flex flex-col"
      style={{ minHeight: 100 }}
    >
      {/* Earliest label - centered above timeline */}
      <div className="relative mb-2">
        <p className="absolute text-[10px] sm:text-xs text-muted-foreground font-bold uppercase tracking-wider left-4 sm:left-6 whitespace-nowrap">
          Before
        </p>
        <div className="h-3" />
      </div>

      {/* Timeline content wrapper */}
      <div className="relative flex-1 flex flex-col">
        {/* Timeline line - starts below Earliest, ends above Latest */}
        <div className="absolute left-4 sm:left-6 top-0 bottom-0 w-0.5 bg-border" />

        {/* Timeline content - centered via dynamic padding so it doesn't shift during drag */}
        <div 
          className="relative pl-10 sm:pl-14 flex flex-col flex-1"
          style={{ paddingTop: naturalPaddingTop }}
        >
          <div className="flex flex-col" ref={innerWrapperRef}>
            {items}
          </div>
        </div>
      </div>

      {/* Latest label - centered below timeline */}
      <div className="relative mt-2">
        <p className="absolute text-[10px] sm:text-xs text-muted-foreground font-bold uppercase tracking-wider left-4 sm:left-6 whitespace-nowrap">
          After
        </p>
        <div className="h-3" />
      </div>
    </div>
  );
}
