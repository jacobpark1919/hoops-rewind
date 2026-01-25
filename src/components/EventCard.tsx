import { SportsEvent } from "@/data/sportsEvents";

interface EventCardProps {
  event: SportsEvent;
  showYear?: boolean;
  status?: "correct" | "incorrect" | null;
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
  };

  return (
    <div
      draggable={!showYear}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      className={`
        ${showYear ? "timeline-card" : "game-card"}
        ${isDragging ? "game-card-dragging" : ""}
        ${status ? statusClasses[status] : ""}
        ${showYear ? "animate-bounce-in" : ""}
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
      {showYear && (
        <div className="mt-3 flex justify-end">
          <span className="year-badge">{event.year}</span>
        </div>
      )}
    </div>
  );
}
