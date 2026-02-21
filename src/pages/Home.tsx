import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Shield } from "lucide-react";

const SPORT_MODES = [
  { label: "Basketball Mode", value: "Basketball", icon: "🏀", description: "Guess the timeline for basketball events." },
  { label: "Football Mode", value: "American Football", icon: "🏈", description: "Guess the timeline for football events." },
  { label: "All Sports Mode", value: null, icon: "🏆", description: "Guess the timeline for all major sports." },
];

const ORIGIN_DATE = new Date(2026, 1, 12); // Feb 12, 2026

function getPuzzleNumber() {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const diff = Math.floor((startOfToday.getTime() - ORIGIN_DATE.getTime()) / (1000 * 60 * 60 * 24));
  return Math.max(1, diff + 1);
}

export default function Home() {
  const navigate = useNavigate();
  const [order, setOrder] = useState([0, 1, 2]);
  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);

  const handlePlay = (sportValue: string | null) => {
    const params = sportValue ? `?sport=${encodeURIComponent(sportValue)}` : "";
    navigate(`/play${params}`);
  };

  const today = new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  const puzzleNum = getPuzzleNumber();

  // Drag handlers
  const handleDragStart = (idx: number) => {
    dragItem.current = idx;
  };
  const handleDragEnter = (idx: number) => {
    dragOverItem.current = idx;
  };
  const handleDragEnd = () => {
    if (dragItem.current === null || dragOverItem.current === null) return;
    const newOrder = [...order];
    const draggedVal = newOrder[dragItem.current];
    newOrder.splice(dragItem.current, 1);
    newOrder.splice(dragOverItem.current, 0, draggedVal);
    setOrder(newOrder);
    dragItem.current = null;
    dragOverItem.current = null;
  };

  // Touch drag state
  const [touchDragIdx, setTouchDragIdx] = useState<number | null>(null);
  const [touchOffset, setTouchOffset] = useState({ x: 0, y: 0 });
  const [touchPos, setTouchPos] = useState({ x: 0, y: 0 });
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  const handleTouchStart = (idx: number, e: React.TouchEvent) => {
    const touch = e.touches[0];
    const rect = cardRefs.current[idx]?.getBoundingClientRect();
    if (!rect) return;
    setTouchDragIdx(idx);
    setTouchOffset({ x: touch.clientX - rect.left, y: touch.clientY - rect.top });
    setTouchPos({ x: touch.clientX, y: touch.clientY });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchDragIdx === null) return;
    e.preventDefault();
    const touch = e.touches[0];
    setTouchPos({ x: touch.clientX, y: touch.clientY });
  };

  const handleTouchEnd = () => {
    if (touchDragIdx === null) return;
    // Find which card we're over
    let targetIdx = touchDragIdx;
    for (let i = 0; i < cardRefs.current.length; i++) {
      const rect = cardRefs.current[i]?.getBoundingClientRect();
      if (rect && touchPos.x >= rect.left && touchPos.x <= rect.right && touchPos.y >= rect.top && touchPos.y <= rect.bottom) {
        targetIdx = i;
        break;
      }
    }
    if (targetIdx !== touchDragIdx) {
      const newOrder = [...order];
      const draggedVal = newOrder[touchDragIdx];
      newOrder.splice(touchDragIdx, 1);
      newOrder.splice(targetIdx, 0, draggedVal);
      setOrder(newOrder);
    }
    setTouchDragIdx(null);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col relative" onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}>
      {/* Dark mode toggle - top right */}
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
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 w-full max-w-2xl mb-10">
          {order.map((modeIdx, arrIdx) => {
            const mode = SPORT_MODES[modeIdx];
            const isDragging = touchDragIdx === arrIdx;
            return (
              <div
                key={mode.label}
                ref={(el) => { cardRefs.current[arrIdx] = el; }}
                draggable
                onDragStart={() => handleDragStart(arrIdx)}
                onDragEnter={() => handleDragEnter(arrIdx)}
                onDragEnd={handleDragEnd}
                onDragOver={(e) => e.preventDefault()}
                onTouchStart={(e) => handleTouchStart(arrIdx, e)}
                className={`bg-card border border-border rounded-xl p-5 flex flex-col items-center text-center shadow-md hover:shadow-lg transition-all cursor-grab active:cursor-grabbing select-none ${isDragging ? 'opacity-50 scale-95' : ''}`}
                style={isDragging ? { pointerEvents: 'none' as const } : undefined}
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
