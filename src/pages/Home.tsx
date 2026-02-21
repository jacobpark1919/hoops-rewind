import { useState, useRef, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Shield } from "lucide-react";
import { useDrag } from "@/hooks/useDrag";

const SPORT_MODES = [
  { label: "Basketball Mode", value: "Basketball", icon: "🏀", description: "Guess the timeline for basketball events." },
  { label: "Football Mode", value: "American Football", icon: "🏈", description: "Guess the timeline for football events." },
  { label: "All Sports Mode", value: null, icon: "🏆", description: "Guess the timeline for all major sports." },
];

const ORIGIN_DATE = new Date(2026, 1, 12);

function getPuzzleNumber() {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const diff = Math.floor((startOfToday.getTime() - ORIGIN_DATE.getTime()) / (1000 * 60 * 60 * 24));
  return Math.max(1, diff + 1);
}

export default function Home() {
  const navigate = useNavigate();
  const [order, setOrder] = useState([0, 1, 2]);
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  const handleDrop = useCallback((clientY: number) => {
    if (dragIdx === null) return;
    // Find target index based on card centers
    let targetIdx = dragIdx;
    for (let i = 0; i < cardRefs.current.length; i++) {
      const rect = cardRefs.current[i]?.getBoundingClientRect();
      if (rect) {
        const center = rect.top + rect.height / 2;
        if (clientY < center) {
          targetIdx = i;
          break;
        }
        targetIdx = i;
      }
    }
    if (targetIdx !== dragIdx) {
      setOrder(prev => {
        const newOrder = [...prev];
        const dragged = newOrder[dragIdx];
        newOrder.splice(dragIdx, 1);
        newOrder.splice(targetIdx, 0, dragged);
        return newOrder;
      });
    }
    setDragIdx(null);
  }, [dragIdx]);

  const { dragState, startDrag } = useDrag({ onDragEnd: handleDrop });

  const handleCardPointerDown = useCallback((e: React.MouseEvent | React.TouchEvent, idx: number) => {
    const el = cardRefs.current[idx];
    if (!el) return;
    setDragIdx(idx);
    startDrag(e, el);
  }, [startDrag]);

  const handlePlay = (sportValue: string | null) => {
    const params = sportValue ? `?sport=${encodeURIComponent(sportValue)}` : "";
    navigate(`/play${params}`);
  };

  const today = new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  const puzzleNum = getPuzzleNumber();

  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
      {/* Dark mode toggle */}
      <div className="absolute top-4 right-4 z-20">
        <ThemeToggle size="lg" />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-8">
        {/* Logo & Title */}
        <div className="flex items-center gap-2 mb-2">
          <Shield className="w-8 h-8 sm:w-10 sm:h-10 text-primary fill-primary/20" />
          <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-foreground uppercase">
            Sports Vault
          </h1>
        </div>

        {/* Date & Puzzle # */}
        <p className="text-muted-foreground text-sm sm:text-base mb-6">
          {today} &nbsp;·&nbsp; Puzzle #{puzzleNum}
        </p>

        {/* Subtitle */}
        <p className="text-muted-foreground text-sm sm:text-base mb-6">
          Select a mode to play today's puzzle:
        </p>

        {/* Decorative timeline line */}
        <div className="relative w-full max-w-2xl mb-8 hidden sm:flex items-center">
          <div className="flex-1 h-0.5 bg-primary/60" />
          <div className="w-3 h-3 rounded-full bg-primary mx-1" />
          <div className="flex-1 h-0.5 bg-primary/60" />
          <div className="w-3 h-3 rounded-full bg-primary mx-1" />
          <div className="flex-1 h-0.5 bg-primary/60" />
          <div className="w-3 h-3 rounded-full bg-primary mx-1" />
          <div className="flex-1 h-0.5 bg-primary/60" />
        </div>

        {/* Mode cards */}
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 w-full max-w-2xl mb-10 relative">
          {order.map((modeIdx, arrIdx) => {
            const mode = SPORT_MODES[modeIdx];
            const isDragging = dragState.isDragging && dragIdx === arrIdx;

            return (
              <div
                key={mode.label}
                ref={(el) => { cardRefs.current[arrIdx] = el; }}
                onMouseDown={(e) => handleCardPointerDown(e, arrIdx)}
                onTouchStart={(e) => handleCardPointerDown(e, arrIdx)}
                className={`flex-1 bg-card border border-border rounded-xl p-5 flex flex-col items-center text-center shadow-md transition-shadow select-none
                  ${isDragging ? 'z-50 shadow-xl scale-105 opacity-90' : 'cursor-grab active:cursor-grabbing hover:shadow-lg'}`}
                style={isDragging ? {
                  position: 'relative' as const,
                  transform: `translateY(${dragState.offsetY}px) scale(1.05)`,
                  zIndex: 50,
                  transition: 'box-shadow 0.2s',
                } : { transition: 'transform 0.2s, box-shadow 0.2s' }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">{mode.icon}</span>
                  <h2 className="font-display text-base sm:text-lg font-bold text-foreground">
                    {mode.label}
                  </h2>
                </div>
                <p className="text-muted-foreground text-sm mb-4">
                  {mode.description}
                </p>
                <Button
                  onClick={() => handlePlay(mode.value)}
                  size="sm"
                  className="rounded-full px-6"
                  onMouseDown={(e) => e.stopPropagation()}
                  onTouchStart={(e) => e.stopPropagation()}
                >
                  Play
                </Button>
              </div>
            );
          })}
        </div>

        {/* Footer text */}
        <p className="text-muted-foreground text-sm sm:text-base text-center">
          Come back every day for a new sports history timeline puzzle.
        </p>
      </div>
    </div>
  );
}
