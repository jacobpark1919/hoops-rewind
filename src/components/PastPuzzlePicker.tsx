import { ChevronLeft, ChevronRight } from "lucide-react";

interface PastPuzzlePickerProps {
  selectedDate: string | null;
  onSelect: (date: string | null) => void;
}

function getEasternToday(): string {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'America/New_York' });
}

function getPast7Days(): string[] {
  const today = getEasternToday();
  const [y, m, d] = today.split('-').map(Number);
  const todayDate = new Date(y, m - 1, d);
  const days: string[] = [];
  for (let i = 7; i >= 0; i--) {
    const date = new Date(todayDate);
    date.setDate(date.getDate() - i);
    days.push(date.toISOString().split('T')[0]);
  }
  return days;
}

export function PastPuzzlePicker({ selectedDate, onSelect }: PastPuzzlePickerProps) {
  const today = getEasternToday();
  const days = getPast7Days();
  const activeDate = selectedDate || today;

  return (
    <div className="p-3 min-w-[240px]">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
        Past Puzzles
      </p>
      <div className="flex flex-col gap-1">
        {days.map((dateStr) => {
          const [y, m, d] = dateStr.split('-').map(Number);
          const date = new Date(y, m - 1, d);
          const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
          const monthDay = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          const isToday = dateStr === today;
          const isActive = dateStr === activeDate;

          return (
            <button
              key={dateStr}
              onClick={() => onSelect(isToday ? null : dateStr)}
              className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                isActive
                  ? "bg-primary text-primary-foreground font-semibold"
                  : "hover:bg-secondary text-foreground"
              }`}
            >
              <span>{dayName}, {monthDay}</span>
              {isToday && (
                <span className={`text-xs font-medium ${isActive ? "text-primary-foreground/80" : "text-accent"}`}>
                  Today
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
