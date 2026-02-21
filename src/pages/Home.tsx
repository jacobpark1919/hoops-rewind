import { useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { DarkModeHint } from "@/components/DarkModeHint";
import { Shield } from "lucide-react";
import { useEffect } from "react";

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

function useHorizontalDrag(onReorder: (from: number, to: number) => void) {
  const [dragging, setDragging] = useState(false);
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [offsetX, setOffsetX] = useState(0);
  const startXRef = useRef(0);
  const currentXRef = useRef(0);
  const dragIdxRef = useRef<number | null>(null);
  const cardRefsRef = useRef<(HTMLDivElement | null)[]>([]);
  const wasCanceledRef = useRef(false);

  const startDrag = useCallback((clientX: number, idx: number) => {
    startXRef.current = clientX;
    currentXRef.current = clientX;
    dragIdxRef.current = idx;
    setDragIdx(idx);
    setDragging(true);
    setOffsetX(0);
  }, []);

  useEffect(() => {
    if (!dragging) {
      wasCanceledRef.current = false;
      return;
    }

    const handleMove = (clientX: number) => {
      currentXRef.current = clientX;
      setOffsetX(clientX - startXRef.current);
    };

    const handleEnd = () => {
      wasCanceledRef.current = false;
      const idx = dragIdxRef.current;
      if (idx === null) return;

      // Find target based on horizontal center positions
      let targetIdx = idx;
      const cx = currentXRef.current;
      for (let i = 0; i < cardRefsRef.current.length; i++) {
        const rect = cardRefsRef.current[i]?.getBoundingClientRect();
        if (rect) {
          const center = rect.left + rect.width / 2;
          if (cx < center) {
            targetIdx = i;
            break;
          }
          targetIdx = i;
        }
      }

      if (targetIdx !== idx) {
        onReorder(idx, targetIdx);
      }

      setDragging(false);
      setDragIdx(null);
      setOffsetX(0);
      dragIdxRef.current = null;
    };

    const onMouseMove = (e: MouseEvent) => handleMove(e.clientX);
    const onMouseUp = () => handleEnd();
    const onTouchMove = (e: TouchEvent) => {
      if (e.cancelable) e.preventDefault();
      if (e.touches.length > 0) handleMove(e.touches[0].clientX);
    };
    const onTouchEnd = () => handleEnd();
    const onTouchCancel = () => { wasCanceledRef.current = true; };
    const onDocTouchStart = (e: TouchEvent) => {
      if (wasCanceledRef.current && e.touches.length > 0) {
        wasCanceledRef.current = false;
        if (e.cancelable) e.preventDefault();
        const newX = e.touches[0].clientX;
        const currentOffset = currentXRef.current - startXRef.current;
        startXRef.current = newX - currentOffset;
        currentXRef.current = newX;
        setOffsetX(currentOffset);
      }
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
    document.addEventListener("touchstart", onDocTouchStart, { passive: false });
    document.addEventListener("touchmove", onTouchMove, { passive: false });
    document.addEventListener("touchend", onTouchEnd, { passive: false });
    document.addEventListener("touchcancel", onTouchCancel);

    return () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
      document.removeEventListener("touchstart", onDocTouchStart);
      document.removeEventListener("touchmove", onTouchMove);
      document.removeEventListener("touchend", onTouchEnd);
      document.removeEventListener("touchcancel", onTouchCancel);
    };
  }, [dragging, onReorder]);

  return { dragging, dragIdx, offsetX, startDrag, cardRefs: cardRefsRef };
}

export default function Home() {
  const navigate = useNavigate();
  const [order, setOrder] = useState([0, 1, 2]);

  const handleReorder = useCallback((from: number, to: number) => {
    setOrder(prev => {
      const next = [...prev];
      const item = next.splice(from, 1)[0];
      next.splice(to, 0, item);
      return next;
    });
  }, []);

  const { dragging, dragIdx, offsetX, startDrag, cardRefs } = useHorizontalDrag(handleReorder);

  const handlePlay = (sportValue: string | null) => {
    const params = sportValue ? `?sport=${encodeURIComponent(sportValue)}` : "";
    navigate(`/play${params}`);
  };

  const today = new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  const puzzleNum = getPuzzleNumber();

  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
      <DarkModeHint />
      <div className="absolute top-4 right-4 z-20">
        <ThemeToggle size="lg" />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-4 py-8">
        {/* Logo */}
        <div className="flex items-center gap-2 mb-2">
          <Shield className="w-8 h-8 sm:w-10 sm:h-10 text-primary fill-primary/20" />
          <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-foreground uppercase">
            Sports Vault
          </h1>
        </div>

        <p className="text-muted-foreground text-sm sm:text-base mb-6">
          {today} &nbsp;·&nbsp; Puzzle #{puzzleNum}
        </p>

        <p className="text-muted-foreground text-sm sm:text-base mb-6">
          Select a mode to play today's puzzle:
        </p>

        {/* Timeline decoration with drop zones */}
        <div className="relative w-full max-w-2xl mb-8 hidden sm:flex items-center">
          {/* Scribble hint for reordering */}
          <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 pointer-events-none select-none animate-fade-in z-10">
            <div className="relative flex items-center gap-1">
              <svg 
                className="w-5 h-5 text-muted-foreground/70 -mb-1 rotate-90"
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5 12h14M14 6l6 6-6 6" />
              </svg>
              <span 
                className="text-muted-foreground/70 text-sm whitespace-nowrap"
                style={{ 
                  fontFamily: "'Caveat', cursive",
                  transform: 'rotate(3deg)',
                  display: 'inline-block',
                }}
              >
                try reordering!
              </span>
            </div>
          </div>

          <div className="w-6 h-6 rounded-lg border-2 border-dashed border-primary/40 bg-primary/5 mx-1 flex-shrink-0" />
          <div className="flex-1 h-0.5 bg-primary/60" />
          <div className="w-3 h-3 rounded-full bg-primary mx-1" />
          <div className="w-6 h-6 rounded-lg border-2 border-dashed border-primary/40 bg-primary/5 mx-1 flex-shrink-0" />
          <div className="flex-1 h-0.5 bg-primary/60" />
          <div className="w-3 h-3 rounded-full bg-primary mx-1" />
          <div className="w-6 h-6 rounded-lg border-2 border-dashed border-primary/40 bg-primary/5 mx-1 flex-shrink-0" />
          <div className="flex-1 h-0.5 bg-primary/60" />
          <div className="w-3 h-3 rounded-full bg-primary mx-1" />
          <div className="w-6 h-6 rounded-lg border-2 border-dashed border-primary/40 bg-primary/5 mx-1 flex-shrink-0" />
        </div>

        {/* Mode cards */}
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 w-full max-w-2xl mb-10">
          {order.map((modeIdx, arrIdx) => {
            const mode = SPORT_MODES[modeIdx];
            const isDragging = dragging && dragIdx === arrIdx;

            return (
              <div
                key={mode.label}
                ref={(el) => { cardRefs.current[arrIdx] = el; }}
                onMouseDown={(e) => { e.preventDefault(); startDrag(e.clientX, arrIdx); }}
                onTouchStart={(e) => { startDrag(e.touches[0].clientX, arrIdx); }}
                className={`flex-1 bg-card border border-border rounded-xl p-5 flex flex-col items-center text-center select-none
                  ${isDragging ? 'z-50 shadow-xl' : 'shadow-md cursor-grab active:cursor-grabbing hover:shadow-lg'}`}
                style={{
                  transform: isDragging ? `translateX(${offsetX}px) scale(1.05) rotate(2deg)` : undefined,
                  zIndex: isDragging ? 50 : undefined,
                  transition: isDragging ? 'box-shadow 0.2s' : 'transform 0.2s, box-shadow 0.2s',
                }}
              >
                <span className="text-3xl mb-2 block">{mode.icon}</span>
                <h2 className="font-display text-base sm:text-lg font-bold text-foreground mb-1">
                  {mode.label}
                </h2>
                <p className="text-muted-foreground text-sm mb-4 flex-1">
                  {mode.description}
                </p>
                <Button
                  onClick={() => handlePlay(mode.value)}
                  size="sm"
                  className="rounded-full px-6 mt-auto"
                  onMouseDown={(e) => e.stopPropagation()}
                  onTouchStart={(e) => e.stopPropagation()}
                >
                  Play
                </Button>
              </div>
            );
          })}
        </div>

        <p className="text-muted-foreground text-sm sm:text-base text-center">
          Come back every day for a new sports history timeline puzzle.
        </p>
      </div>
    </div>
  );
}
