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
    color: "hsl(142, 55%, 42%)",
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
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="w-full border-b border-border px-4 sm:px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="font-display text-lg sm:text-xl font-extrabold tracking-tight text-foreground uppercase">
            Sports Rewind
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-muted-foreground text-xs sm:text-sm hidden sm:inline">
            {today}
          </span>
          <span className="text-muted-foreground text-xs">·</span>
          <span className="text-muted-foreground text-xs sm:text-sm font-medium">
            #{puzzleNum}
          </span>
          <ThemeToggle />
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-10 sm:py-16">
        <p className="text-muted-foreground text-sm sm:text-base mb-8 sm:mb-10">
          Pick a mode to play today's puzzle
        </p>

        {/* Card grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5 w-full max-w-2xl">
          {SPORT_MODES.map((mode) => (
            <div
              key={mode.label}
              className="group flex flex-col rounded-xl border border-border bg-card overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => handlePlay(mode.value)}
            >
              {/* Colored banner */}
              <div
                className="flex flex-col items-center justify-center py-6 sm:py-10"
                style={{ backgroundColor: mode.color }}
              >
                <span className="text-4xl sm:text-5xl mb-2 drop-shadow-sm">
                  {mode.icon}
                </span>
                <h2 className="font-display text-base sm:text-lg font-bold text-white drop-shadow-sm">
                  {mode.label}
                </h2>
              </div>

              {/* Description + CTA */}
              <div className="flex flex-col items-center px-4 py-4 sm:py-5 gap-3">
                <p className="text-muted-foreground text-xs sm:text-sm text-center leading-relaxed">
                  {mode.description}
                </p>
                <button
                  className="w-full rounded-full border border-border bg-transparent text-foreground text-sm font-medium py-2 hover:bg-secondary transition-colors"
                >
                  Play
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 flex flex-col items-center gap-2 text-xs text-muted-foreground/60">
        <div className="flex justify-center gap-4">
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
