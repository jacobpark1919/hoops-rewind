import { SportsEvent } from "@/data/sportsEvents";

interface EventCardProps {
  event: SportsEvent;
  showYear?: boolean;
  status?: "correct" | "incorrect" | "pending" | "corrected" | null;
  isDragging?: boolean;
  onDragStart?: () => void;
  onDragEnd?: () => void;
}

export function EventCard({
  event,
  showYear = false,
  status = null,
  isDragging = false,
  onDragStart,
  onDragEnd,
}: EventCardProps) {
  const statusClasses = {
    correct: "timeline-card-correct",
    incorrect: "timeline-card-incorrect animate-shake",
    pending: "timeline-card-pending",
    corrected: "timeline-card-corrected",
  };

  // Pending cards should still be draggable
  const isPending = status === "pending";
  const isPlaced = (status !== null && !isPending) || showYear;
  const canDrag = !isPlaced || isPending;

  return (
    <div
      draggable={canDrag && !!onDragStart}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      className={`
        ${isPlaced || isPending ? "timeline-card" : "game-card"}
        ${isDragging ? "game-card-dragging" : ""}
        ${status ? statusClasses[status] : ""}
        ${isPending ? "cursor-grab active:cursor-grabbing" : ""}
        select-none
        bg-card
      `}
      style={{
        boxShadow: '0 4px 12px -2px rgba(0, 0, 0, 0.15), 0 2px 6px -2px rgba(0, 0, 0, 0.1)',
      }}
    >
      <div className="flex items-start gap-3">
        <span className="text-2xl">{event.icon}</span>
        <div className="flex-1 min-w-0">
          <p className="font-display text-base font-semibold leading-tight text-foreground">
            {event.title}
          </p>
          <p className="text-sm text-muted-foreground mt-1">{event.sport}</p>
        </div>
      </div>
    </div>
  );
}
