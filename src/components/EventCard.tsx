import { SportsEvent } from "@/data/sportsEvents";

interface EventCardProps {
  event: SportsEvent;
  showYear?: boolean;
  status?: "correct" | "incorrect" | "pending" | null;
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
  };

  const isPlaced = status !== null || showYear;

  return (
    <div
      draggable={!isPlaced}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      className={`
        ${isPlaced ? "timeline-card" : "game-card"}
        ${isDragging ? "game-card-dragging" : ""}
        ${status ? statusClasses[status] : ""}
        select-none
      `}
    >
      <div className="flex items-start gap-3">
        <span className="text-3xl">{event.icon}</span>
        <div className="flex-1 min-w-0">
          <p className="font-display text-lg font-semibold leading-tight text-foreground">
            {event.title}
          </p>
          <p className="text-sm text-muted-foreground mt-1">{event.sport}</p>
        </div>
      </div>
    </div>
  );
}
