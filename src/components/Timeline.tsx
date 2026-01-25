import { SportsEvent } from "@/data/sportsEvents";
import { EventCard } from "./EventCard";
import { DropZone } from "./DropZone";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";

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
      <div key={item.event.id} className="relative">
        <EventCard
          event={item.event}
          showYear={!isPending}
          status={item.status}
        />
        {/* Small popup buttons for pending card */}
        {isPending && onConfirm && onCancel && (
          <div className="absolute -right-2 top-1/2 -translate-y-1/2 flex gap-1 z-10">
            <Button
              onClick={onConfirm}
              size="icon"
              className="h-8 w-8 rounded-full shadow-lg"
            >
              <Check className="w-4 h-4" />
            </Button>
            <Button
              onClick={onCancel}
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-full shadow-lg bg-background"
            >
              <X className="w-4 h-4" />
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
      <div className="relative space-y-3 pl-12">
        {items}
      </div>
    </div>
  );
}
