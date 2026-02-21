import { useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
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

  return { dragging, dragIdx, offsetX, startDrag, cardRefs: cardRefsRef, startXRef };
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

  const { dragging, dragIdx, offsetX, startDrag, cardRefs, startXRef } = useHorizontalDrag(handleReorder);

  const handlePlay = (sportValue: string | null) => {
    const params = sportValue ? `?sport=${encodeURIComponent(sportValue)}` : "";
    navigate(`/play${params}`);
  };

  const today = new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  const puzzleNum = getPuzzleNumber();

  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
      <div className="absolute top-4 right-4 z-20 flex items-center gap-1">
        <div className="pointer-events-none select-none flex items-center gap-1">
          <span
            className="text-muted-foreground/70 text-sm md:text-base whitespace-nowrap"
            style={{
              fontFamily: "'Caveat', cursive",
              transform: 'rotate(-6deg)',
              display: 'inline-block',
            }}
          >
            try dark mode!
          </span>
          <svg
            className="w-6 h-6 text-muted-foreground/70 -mt-1"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M5 12h14M14 6l6 6-6 6" />
          </svg>
        </div>
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

        {/* Timeline decoration */}
        <div className="relative w-full max-w-2xl mb-8 hidden sm:flex items-center">
          <div className="flex-1 h-0.5 bg-primary/60" />
          <div className="w-3 h-3 rounded-full bg-primary mx-1" />
          <div className="flex-1 h-0.5 bg-primary/60" />
          <div className="w-3 h-3 rounded-full bg-primary mx-1" />
          <div className="flex-1 h-0.5 bg-primary/60" />
          <div className="w-3 h-3 rounded-full bg-primary mx-1" />
          <div className="flex-1 h-0.5 bg-primary/60" />
        </div>

        {/* Mode cards with drop zones */}
        <div className="relative flex flex-col sm:flex-row w-full max-w-2xl mb-10">
          {/* Scribble hint for timeline reordering */}
          <div className="absolute -left-4 sm:-left-28 top-1/2 -translate-y-1/2 z-10 pointer-events-none select-none hidden sm:flex items-center gap-1">
            <span
              className="text-muted-foreground/70 text-sm md:text-base whitespace-nowrap"
              style={{
                fontFamily: "'Caveat', cursive",
                transform: 'rotate(-6deg)',
                display: 'inline-block',
              }}
            >
              try reordering!
            </span>
            <svg
              className="w-6 h-6 text-muted-foreground/70 -mt-1"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5 12h14M14 6l6 6-6 6" />
            </svg>
          </div>

          {order.map((modeIdx, arrIdx) => {
            const mode = SPORT_MODES[modeIdx];
            const isCardDragging = dragging && dragIdx === arrIdx;

            // Determine if a drop zone should show before this card
            const showDropBefore = dragging && dragIdx !== null && dragIdx !== arrIdx && dragIdx !== arrIdx - 1;
            // Calculate drop target from offsetX
            const getDropTarget = () => {
              if (!dragging || dragIdx === null) return null;
              const cx = startXRef.current + offsetX;
              for (let i = 0; i < cardRefs.current.length; i++) {
                const rect = cardRefs.current[i]?.getBoundingClientRect();
                if (rect) {
                  const center = rect.left + rect.width / 2;
                  if (cx < center) return i;
                }
              }
              return cardRefs.current.length;
            };

            const dropTarget = getDropTarget();
            const showZone = dragging && dropTarget === arrIdx && dragIdx !== arrIdx && dragIdx !== arrIdx - 1;

            return (
              <div key={mode.label} className="flex items-stretch flex-1" style={{ minWidth: 0 }}>
                {/* Drop zone before card */}
                <div
                  className={`transition-all duration-300 ease-out rounded-xl border-2 border-dashed flex items-center justify-center shrink-0 ${
                    showZone
                      ? 'w-16 sm:w-20 border-primary bg-primary/20 shadow-lg mx-1'
                      : 'w-0 border-transparent overflow-hidden'
                  }`}
                >
                  {showZone && (
                    <span className="text-primary text-xs font-semibold rotate-90 whitespace-nowrap">Drop here</span>
                  )}
                </div>

                <div
                  ref={(el) => { cardRefs.current[arrIdx] = el; }}
                  onMouseDown={(e) => { e.preventDefault(); startDrag(e.clientX, arrIdx); }}
                  onTouchStart={(e) => { startDrag(e.touches[0].clientX, arrIdx); }}
                  className={`flex-1 bg-card border border-border rounded-xl p-5 flex flex-col items-center text-center select-none
                    ${isCardDragging ? 'z-50 shadow-xl' : 'shadow-md cursor-grab active:cursor-grabbing hover:shadow-lg'}
                    ${arrIdx > 0 && !showZone ? 'ml-4 sm:ml-6' : ''}`}
                  style={{
                    transform: isCardDragging ? `translateX(${offsetX}px) scale(1.05) rotate(2deg)` : undefined,
                    zIndex: isCardDragging ? 50 : undefined,
                    transition: isCardDragging ? 'box-shadow 0.2s' : 'transform 0.2s, box-shadow 0.2s',
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

                {/* Drop zone after last card */}
                {arrIdx === order.length - 1 && (() => {
                  const showEndZone = dragging && dropTarget === order.length && dragIdx !== arrIdx;
                  return (
                    <div
                      className={`transition-all duration-300 ease-out rounded-xl border-2 border-dashed flex items-center justify-center shrink-0 ${
                        showEndZone
                          ? 'w-16 sm:w-20 border-primary bg-primary/20 shadow-lg ml-1'
                          : 'w-0 border-transparent overflow-hidden'
                      }`}
                    >
                      {showEndZone && (
                        <span className="text-primary text-xs font-semibold rotate-90 whitespace-nowrap">Drop here</span>
                      )}
                    </div>
                  );
                })()}
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
