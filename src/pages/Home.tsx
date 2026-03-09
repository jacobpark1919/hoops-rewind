import { useNavigate, Link } from "react-router-dom";
import { ThemeToggle } from "@/components/ThemeToggle";
import { DarkModeHint } from "@/components/DarkModeHint";

const SPORT_MODES = [
  {
    label: "Basketball",
    value: "Basketball",
    icon: "🏀",
    color: "hsl(25, 85%, 62%)",
    description: "Place iconic basketball moments on the timeline.",
  },
  {
    label: "Football",
    value: "American Football",
    icon: "🏈",
    color: "hsl(150, 45%, 28%)",
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
    <div className="h-screen bg-background flex flex-col">
      {/* Theme toggle */}
      <DarkModeHint />
      <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-20">
        <ThemeToggle />
      </div>

      {/* Main content */}
      <main className="flex-1 min-h-0 overflow-auto flex flex-col items-center justify-center px-3 py-3 sm:py-6 lg:py-10 xl:py-14">
        <div className="flex items-center gap-1.5 sm:gap-2 lg:gap-2.5 xl:gap-3 mb-1 sm:mb-1.5 lg:mb-2 xl:mb-3">
          <svg className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 xl:w-10 xl:h-10 text-primary" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="13,8 13,24 4,16" fill="currentColor" stroke="none" />
            <polygon points="24,8 24,24 15,16" fill="currentColor" stroke="none" />
          </svg>
          <h1 className="font-display text-xl sm:text-2xl lg:text-4xl xl:text-5xl font-extrabold tracking-tight text-foreground uppercase">
            Sports Rewind
          </h1>
        </div>
        <p className="text-foreground text-[11px] sm:text-xs lg:text-sm xl:text-base font-medium mb-0.5 sm:mb-1">
          {today} &nbsp;·&nbsp; Puzzle #{puzzleNum}
        </p>
        <p className="text-muted-foreground text-[10px] sm:text-[11px] lg:text-sm xl:text-base mb-2.5 sm:mb-4 lg:mb-7 xl:mb-9">
          Pick a mode to play today's puzzle
        </p>

        {/* Card grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 sm:gap-2 lg:gap-4 xl:gap-5 w-full max-w-sm sm:max-w-md lg:max-w-xl xl:max-w-2xl">
          {SPORT_MODES.map((mode) => (
            <div
              key={mode.label}
              className={`group flex flex-col rounded-md sm:rounded-lg lg:rounded-xl xl:rounded-xl border border-border bg-card overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer ${
                mode.value === null ? "col-span-2 sm:col-span-1" : ""
              }`}
              onClick={() => handlePlay(mode.value)}
            >
              {/* Colored banner */}
              <div
                className="flex flex-col items-center justify-center py-2.5 sm:py-4 lg:py-7 xl:py-10"
                style={{ backgroundColor: mode.color }}
              >
                <span className="text-lg sm:text-2xl lg:text-4xl xl:text-5xl mb-0.5 sm:mb-1 lg:mb-1.5 xl:mb-2 drop-shadow-sm">
                  {mode.icon}
                </span>
                <h2 className="font-display text-[10px] sm:text-xs lg:text-base xl:text-lg font-bold text-white drop-shadow-sm">
                  {mode.label}
                </h2>
              </div>

              {/* Description + CTA */}
              <div className="flex flex-col items-center px-1.5 sm:px-2.5 lg:px-3 xl:px-5 py-1.5 sm:py-2 lg:py-3.5 xl:py-4 gap-1 sm:gap-1.5 lg:gap-2.5 xl:gap-3">
                <p className="text-muted-foreground text-[9px] sm:text-[11px] lg:text-xs xl:text-sm text-center leading-snug sm:leading-relaxed hidden sm:block">
                  {mode.description}
                </p>
                <button
                  className="w-full rounded-full border border-border bg-transparent text-foreground text-[10px] sm:text-[11px] lg:text-xs xl:text-sm font-medium py-0.5 sm:py-1 lg:py-1.5 xl:py-2 hover:bg-secondary transition-colors"
                >
                  Play
                </button>
              </div>
            </div>
          ))}
        </div>

        <p className="text-muted-foreground text-[11px] sm:text-xs lg:text-sm xl:text-base mt-2.5 sm:mt-4 lg:mt-6 xl:mt-8 font-bold">
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
