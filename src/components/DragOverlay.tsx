import { SportsEvent } from "@/data/sportsEvents";
import { DragState } from "@/hooks/useDrag";

interface DragOverlayProps {
  event: SportsEvent;
  dragState: DragState;
}

export function DragOverlay({ event, dragState }: DragOverlayProps) {
  if (!dragState.isDragging || !dragState.cardRect) return null;

  return (
    <div
      className="fixed pointer-events-none z-50"
      style={{
        left: dragState.cardRect.left,
        top: dragState.cardRect.top + dragState.offsetY,
        width: dragState.cardRect.width,
      }}
    >
      <div className="game-card shadow-2xl">
        <div className="flex items-start gap-1.5 sm:gap-3">
          <span className="text-base sm:text-2xl">{event.icon}</span>
          <div className="flex-1 min-w-0">
            <p className="font-display text-xs sm:text-base font-semibold leading-tight text-foreground">
              {event.title}
            </p>
            <p className="text-[11px] sm:text-sm text-muted-foreground mt-0 sm:mt-1">{event.sport}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
