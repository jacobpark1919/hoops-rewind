import { SportsEvent } from "@/data/sportsEvents";
import { EventCard } from "./EventCard";
import { DropZone } from "./DropZone";

interface TimelineProps {
  placedEvents: Array<{ event: SportsEvent; status: "correct" | "incorrect" | "pending" | null }>;
  activeDropZone: number | null;
  isDragging: boolean;
  onDrop: (position: number) => void;
  onDragOver: (position: number) => void;
  onDragLeave: () => void;
}

export function Timeline({
  placedEvents,
  activeDropZone,
  isDragging,
  onDrop,
  onDragOver,
  onDragLeave,
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
    items.push(
      <EventCard
        key={item.event.id}
        event={item.event}
        showYear
        status={item.status}
      />
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
      <div className="relative space-y-3 pl-12">
        {items}
      </div>
    </div>
  );
}
