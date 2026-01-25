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
}: TimelineProps) {
  const items: JSX.Element[] = [];

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

  placedEvents.forEach((item, index) => {
    const isPending = item.status === "pending";
    
    items.push(
      <div key={item.event.id} className="relative flex items-center gap-3 animate-slide-in">
        {/* Year badge on the left */}
        {!isPending && (
          <div className="absolute -left-12 top-1/2 -translate-y-1/2 w-10 flex justify-center">
            <span className="year-badge text-xs px-2 py-0.5">{item.event.year}</span>
          </div>
        )}
        
        <div className="flex-1">
          <EventCard
            event={item.event}
            showYear={false}
            status={item.status}
          />
        </div>
        
        {/* Small popup button for pending card */}
        {isPending && onConfirm && (
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
      items.push(
        <DropZone
          key={`drop-${index + 1}`}
          position={index + 1}
          isActive={activeDropZone === index + 1}
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
