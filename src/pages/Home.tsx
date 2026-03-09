import { useNavigate, Link } from "react-router-dom";
import { ThemeToggle } from "@/components/ThemeToggle";

const SPORT_MODES = [
  {
    label: "Basketball",
    value: "Basketball",
    icon: "🏀",
    color: "hsl(25, 90%, 55%)",
    description: "Place iconic basketball moments on the timeline.",
  },
  {
    label: "Football",
    value: "American Football",
    icon: "🏈",
    color: "hsl(25, 55%, 38%)",
    description: "Order the biggest football events in history.",
  },
  {
    label: "All Sports",
    value: null,
    icon: "🏆",
    color: "hsl(45, 75%, 55%)",
    description: "The ultimate challenge across every sport.",
  },
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

  const handlePlay = (sportValue: string | null) => {
    const params = sportValue ? `?sport=${encodeURIComponent(sportValue)}` : "";
    navigate(`/play${params}`);
  };

  const today = new Date().toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  const puzzleNum = getPuzzleNumber();

  return (
    <div className="min-h-screen bg-background flex flex-col overflow-auto">
      {/* Theme toggle */}
      <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-20">
        <ThemeToggle />
      </div>

      {/* Main content */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-6 sm:py-16">
        <h1 className="font-display text-xl sm:text-4xl font-extrabold tracking-tight text-foreground uppercase mb-2 sm:mb-3">
          Sports Rewind
        </h1>
        <p className="text-foreground text-sm sm:text-lg font-medium mb-0.5 sm:mb-1">
          {today} &nbsp;·&nbsp; Puzzle #{puzzleNum}
        </p>
        <p className="text-muted-foreground text-xs sm:text-base mb-5 sm:mb-10">
          Pick a mode to play today's puzzle
        </p>

        {/* Card grid — horizontal row on mobile */}
        <div className="grid grid-cols-3 gap-2 sm:gap-5 w-full max-w-2xl">
          {SPORT_MODES.map((mode) => (
            <div
              key={mode.label}
              className="group flex flex-col rounded-lg sm:rounded-xl border border-border bg-card overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => handlePlay(mode.value)}
            >
              {/* Colored banner */}
              <div
                className="flex flex-col items-center justify-center py-4 sm:py-10"
                style={{ backgroundColor: mode.color }}
              >
                <span className="text-2xl sm:text-5xl mb-1 sm:mb-2 drop-shadow-sm">
                  {mode.icon}
                </span>
                <h2 className="font-display text-xs sm:text-lg font-bold text-white drop-shadow-sm">
                  {mode.label}
                </h2>
              </div>

              {/* Description + CTA */}
              <div className="flex flex-col items-center px-2 sm:px-4 py-2.5 sm:py-5 gap-2 sm:gap-3">
                <p className="text-muted-foreground text-[10px] sm:text-sm text-center leading-snug sm:leading-relaxed hidden sm:block">
                  {mode.description}
                </p>
                <button
                  className="w-full rounded-full border border-border bg-transparent text-foreground text-xs sm:text-sm font-medium py-1.5 sm:py-2 hover:bg-secondary transition-colors"
                >
                  Play
                </button>
              </div>
            </div>
          ))}
        </div>

        <p className="text-muted-foreground text-[10px] sm:text-sm mt-5 sm:mt-8">
          A new puzzle every day — come back tomorrow!
        </p>
      </main>

      {/* Footer — always visible */}
      <footer className="shrink-0 py-3 sm:py-4 flex flex-col items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-muted-foreground/60 px-4">
        <div className="flex justify-center gap-2 sm:gap-4 flex-wrap">
          <Link to="/privacy" className="hover:text-muted-foreground transition-colors">
            Privacy Policy
          </Link>
          <span>·</span>
          <Link to="/terms" className="hover:text-muted-foreground transition-colors">
            Terms of Service
          </Link>
          <span>·</span>
          <Link to="/cookies" className="hover:text-muted-foreground transition-colors">
            Cookie Policy
          </Link>
        </div>
        <p>© {new Date().getFullYear()} Sports Rewind. All rights reserved.</p>
      </footer>
    </div>
  );
}
