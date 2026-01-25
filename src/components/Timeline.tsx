import { SportsEvent } from "@/data/sportsEvents";
import { EventCard } from "./EventCard";
import { DropZone } from "./DropZone";
import { Button } from "@/components/ui/button";

interface TimelineProps {
  placedEvents: Array<{ event: SportsEvent; status: "correct" | "incorrect" | "pending" | null }>;
  activeDropZone: number | null;
  isDragging: boolean;
  onDrop: (position: number) => void;
  onDragOver: (position: number) => void;
  onDragLeave: () => void;
  onConfirm?: () => void;
  onCancel?: () => void;
  onPendingDragStart?: () => void;
  onPendingDragEnd?: () => void;
}

export function Timeline({
  placedEvents,
  activeDropZone,
  isDragging,
  onDrop,
  onDragOver,
  onDragLeave,
  onConfirm,
  onCancel,
  onPendingDragStart,
  onPendingDragEnd,
}: TimelineProps) {
  const items: JSX.Element[] = [];

  // Find the pending card's current index (if any)
  const pendingIndex = placedEvents.findIndex((item) => item.status === "pending");

  // Add drop zone at start if dragging
  if (isDragging) {
    items.push(
      <DropZone
        key="drop-start"
        position={0}
        isActive={activeDropZone === 0}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
      />
    );
  }

  // Track the position offset for drop zones when pending card is being dragged
  let dropPositionOffset = 0;

  placedEvents.forEach((item, index) => {
    const isPending = item.status === "pending";

    // Skip rendering the pending card if it's being dragged
    if (isPending && isDragging) {
      dropPositionOffset = -1; // Offset future drop positions since pending card is removed
      return;
    }
    
    items.push(
      <div key={item.event.id} className="relative flex items-center gap-3 animate-slide-in">
        {/* Year badge on the left */}
        {!isPending && (
          <div className="absolute -left-12 top-1/2 -translate-y-1/2 w-10 flex justify-center">
            <span className="year-badge text-xs px-2 py-0.5">{item.event.year}</span>
          </div>
        )}
        
        <div className="flex-1">
          {isPending ? (
            <EventCard
              event={item.event}
              showYear={false}
              status={item.status}
              isDragging={false}
              onDragStart={onPendingDragStart}
              onDragEnd={onPendingDragEnd}
            />
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

    // Add drop zone after each card if dragging
    if (isDragging) {
      // Calculate the actual drop position
      const dropPosition = index + 1 + dropPositionOffset;
      items.push(
        <DropZone
          key={`drop-${dropPosition}`}
          position={dropPosition}
          isActive={activeDropZone === dropPosition}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
        />
      );
    }
  });

  return (
    <div className="relative">
      {/* Timeline line */}
      <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border" />
      
      {/* Timeline content */}
      <div className="relative space-y-4 pl-14">
        {items}
      </div>
    </div>
  );
}
