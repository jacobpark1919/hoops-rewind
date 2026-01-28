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
  const dropZoneRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  const [isOverTimeline, setIsOverTimeline] = useState(false);

  // Filter out non-pending items for drop position calculation
  const nonPendingEvents = placedEvents.filter((item) => item.status !== "pending");
  const totalDropZones = nonPendingEvents.length + 1;

  // Calculate which drop zone the cursor is over based on Y position
  useEffect(() => {
    if (!isDragging || dragY === null || !timelineRef.current) {
      setIsOverTimeline(false);
      return;
    }

    const timelineRect = timelineRef.current.getBoundingClientRect();
    const isOver = dragY >= timelineRect.top - 50 && dragY <= timelineRect.bottom + 50;
    setIsOverTimeline(isOver);

    if (!isOver) {
      onDropZoneChange(null);
      return;
    }

    // Find the closest drop zone based on Y position
    let closestZone: number | null = null;
    let closestDistance = Infinity;

    dropZoneRefs.current.forEach((element, position) => {
      const rect = element.getBoundingClientRect();
      const zoneCenterY = rect.top + rect.height / 2;
      const distance = Math.abs(dragY - zoneCenterY);
      
      if (distance < closestDistance) {
        closestDistance = distance;
        closestZone = position;
      }
    });

    // Only activate if within reasonable distance
    if (closestDistance < 80) {
      onDropZoneChange(closestZone);
    } else {
      onDropZoneChange(null);
    }
  }, [isDragging, dragY, onDropZoneChange]);

  // Handle drop when dragging ends over timeline
  useEffect(() => {
    if (!isDragging && activeDropZone !== null && isOverTimeline) {
      onDrop(activeDropZone);
    }
  }, [isDragging]);

  const showDropZones = isDragging && isOverTimeline;
  const items: JSX.Element[] = [];

  // Add drop zone at start if hovering over timeline while dragging
  if (showDropZones) {
    items.push(
      <div
        key="drop-start"
        ref={(el) => {
          if (el) dropZoneRefs.current.set(0, el);
          else dropZoneRefs.current.delete(0);
        }}
      >
        <DropZone
          position={0}
          isActive={activeDropZone === 0}
          onDrop={onDrop}
          onDragOver={onDropZoneChange}
          onDragLeave={() => onDropZoneChange(null)}
        />
      </div>
    );
  }

  placedEvents.forEach((item, index) => {
    const isPending = item.status === "pending";
    const isPendingAndDragging = isPending && isDragging;
    
    items.push(
      <div 
        key={item.event.id} 
        className={`relative flex items-center gap-3 animate-slide-in ${isPendingAndDragging ? 'opacity-50 pointer-events-none' : ''}`}
      >
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

    // Add drop zone after each non-pending card if hovering over timeline while dragging
    if (showDropZones && !isPending) {
      // Find this card's position in the non-pending list to determine drop position
      const nonPendingIndex = nonPendingEvents.findIndex((e) => e.event.id === item.event.id);
      const dropPosition = nonPendingIndex + 1;
      items.push(
        <div
          key={`drop-${dropPosition}`}
          ref={(el) => {
            if (el) dropZoneRefs.current.set(dropPosition, el);
            else dropZoneRefs.current.delete(dropPosition);
          }}
        >
          <DropZone
            position={dropPosition}
            isActive={activeDropZone === dropPosition}
            onDrop={onDrop}
            onDragOver={onDropZoneChange}
            onDragLeave={() => onDropZoneChange(null)}
          />
        </div>
      );
    }
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
