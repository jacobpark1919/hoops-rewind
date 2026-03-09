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
      <main className="flex-1 min-h-0 overflow-auto flex flex-col items-center justify-center px-4 py-4 sm:py-8 lg:py-16 xl:py-20">
        <div className="flex items-center gap-2 sm:gap-2.5 lg:gap-3 xl:gap-4 mb-1.5 sm:mb-2 lg:mb-3 xl:mb-4">
          <svg className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 xl:w-14 xl:h-14 text-primary" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="13,8 13,24 4,16" fill="currentColor" stroke="none" />
            <polygon points="24,8 24,24 15,16" fill="currentColor" stroke="none" />
          </svg>
          <h1 className="font-display text-2xl sm:text-3xl lg:text-5xl xl:text-6xl font-extrabold tracking-tight text-foreground uppercase">
            Sports Rewind
          </h1>
        </div>
        <p className="text-foreground text-xs sm:text-sm lg:text-lg xl:text-xl font-medium mb-0.5 sm:mb-1">
          {today} &nbsp;·&nbsp; Puzzle #{puzzleNum}
        </p>
        <p className="text-muted-foreground text-[11px] sm:text-xs lg:text-base xl:text-lg mb-3 sm:mb-5 lg:mb-10 xl:mb-12">
          Pick a mode to play today's puzzle
        </p>

        {/* Card grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3 lg:gap-5 xl:gap-7 w-full max-w-md sm:max-w-lg lg:max-w-2xl xl:max-w-3xl">
          {SPORT_MODES.map((mode) => (
            <div
              key={mode.label}
              className={`group flex flex-col rounded-lg sm:rounded-lg lg:rounded-xl xl:rounded-2xl border border-border bg-card overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer ${
                mode.value === null ? "col-span-2 sm:col-span-1" : ""
              }`}
              onClick={() => handlePlay(mode.value)}
            >
              {/* Colored banner */}
              <div
                className="flex flex-col items-center justify-center py-3 sm:py-5 lg:py-10 xl:py-14"
                style={{ backgroundColor: mode.color }}
              >
                <span className="text-xl sm:text-3xl lg:text-5xl xl:text-6xl mb-0.5 sm:mb-1 lg:mb-2 xl:mb-3 drop-shadow-sm">
                  {mode.icon}
                </span>
                <h2 className="font-display text-[11px] sm:text-sm lg:text-lg xl:text-xl font-bold text-white drop-shadow-sm">
                  {mode.label}
                </h2>
              </div>

              {/* Description + CTA */}
              <div className="flex flex-col items-center px-2 sm:px-3 lg:px-4 xl:px-6 py-2 sm:py-3 lg:py-5 xl:py-6 gap-1.5 sm:gap-2 lg:gap-3 xl:gap-4">
                <p className="text-muted-foreground text-[10px] sm:text-xs lg:text-sm xl:text-base text-center leading-snug sm:leading-relaxed hidden sm:block">
                  {mode.description}
                </p>
                <button
                  className="w-full rounded-full border border-border bg-transparent text-foreground text-[11px] sm:text-xs lg:text-sm xl:text-base font-medium py-1 sm:py-1.5 lg:py-2 xl:py-2.5 hover:bg-secondary transition-colors"
                >
                  Play
                </button>
              </div>
            </div>
          ))}
        </div>

        <p className="text-muted-foreground text-xs sm:text-sm lg:text-base xl:text-lg mt-3 sm:mt-5 lg:mt-8 xl:mt-10 font-bold">
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
