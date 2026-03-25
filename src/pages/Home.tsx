import { useNavigate, Link } from "react-router-dom";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/hooks/useAuth";
import { LogIn, LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

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
  const { user, signOut } = useAuth();

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
    <div className="h-[89vh] sm:h-screen bg-background flex flex-col overflow-hidden">
      {/* Auth + Theme toggle */}
      <div className="absolute top-1 right-3 sm:top-4 sm:right-4 z-20 flex items-center gap-2">
        {user ? (
          <button
            onClick={signOut}
            className="p-1.5 sm:p-2 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
            aria-label="Sign out"
          >
            <LogOut className="w-4 h-4 sm:w-5 sm:h-5 text-foreground" />
          </button>
        ) : (
          <button
            onClick={() => supabase.auth.signInWithOAuth({ provider: "google" })}
            className="flex items-center gap-1.5 px-3 py-1.5 sm:py-2 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors text-foreground text-xs sm:text-sm font-medium"
          >
            <LogIn className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            Sign In
          </button>
        )}
        <ThemeToggle size="sm" className="sm:hidden" />
        <ThemeToggle className="hidden sm:block" />
      </div>

      {/* Main content */}
      <main className="flex-1 min-h-0 overflow-auto flex flex-col items-center justify-start px-5 pt-6 pb-3 sm:justify-center sm:py-6 lg:py-10 xl:py-14">
        <div className="flex items-center gap-[-2px] sm:gap-0.5 lg:gap-1 xl:gap-1 mb-1.5 sm:mb-1.5 lg:mb-2 xl:mb-3">
          <svg className="w-14 h-14 sm:w-12 sm:h-12 lg:w-16 lg:h-16 text-primary -mr-1.5 sm:mr-0" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="13,8 13,24 4,16" fill="currentColor" stroke="none" />
            <polygon points="24,8 24,24 15,16" fill="currentColor" stroke="none" />
          </svg>
          <h1 className="font-display text-[2rem] sm:text-4xl lg:text-6xl font-black tracking-tight text-foreground uppercase whitespace-nowrap" style={{ WebkitTextStroke: '1px currentColor' }}>
            Sports Rewind
          </h1>
        </div>
        <p className="text-foreground text-base sm:text-xs lg:text-sm xl:text-base font-medium mb-0.5 sm:mb-1">
          {today} &nbsp;·&nbsp; Puzzle #{puzzleNum}
        </p>
        <p className="text-muted-foreground text-sm sm:text-[11px] lg:text-sm xl:text-base mb-8 sm:mb-4 lg:mb-7 xl:mb-9">
          Pick a mode to play today's puzzle
        </p>

        {/* Mobile: NYT-style stacked cards */}
        <div className="flex flex-col gap-3 w-full px-1 sm:hidden">
          {SPORT_MODES.map((mode) => (
            <div
              key={mode.label}
              className="group rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow cursor-pointer"
              style={{ backgroundColor: mode.color }}
              onClick={() => handlePlay(mode.value)}
            >
              <div className="flex flex-col px-4 py-3">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col gap-0.5">
                    <h2 className="font-display text-xl font-extrabold text-white drop-shadow-sm">
                      {mode.label}
                    </h2>
                    <p className="text-white/80 text-xs leading-snug max-w-[220px]">
                      {mode.description}
                    </p>
                  </div>
                  <span className="text-4xl drop-shadow-md">{mode.icon}</span>
                </div>
                <div className="flex items-center gap-2 mt-2 pt-2 border-t border-white/20">
                  <p className="text-white/70 text-[11px] font-medium">
                    {today}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop/tablet: original grid layout */}
        <div className="hidden sm:grid sm:grid-cols-3 gap-2 lg:gap-4 xl:gap-5 w-full max-w-md lg:max-w-xl xl:max-w-2xl">
          {SPORT_MODES.map((mode) => (
            <div
              key={mode.label}
              className="group flex flex-col rounded-lg lg:rounded-xl xl:rounded-xl border border-border bg-card overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => handlePlay(mode.value)}
            >
              <div
                className="flex flex-col items-center justify-center py-4 lg:py-7 xl:py-10"
                style={{ backgroundColor: mode.color }}
              >
                <span className="text-2xl lg:text-4xl xl:text-5xl mb-1 lg:mb-1.5 xl:mb-2 drop-shadow-sm">
                  {mode.icon}
                </span>
                <h2 className="font-display text-xs lg:text-base xl:text-lg font-bold text-white drop-shadow-sm">
                  {mode.label}
                </h2>
              </div>
              <div className="flex flex-col items-center px-2.5 lg:px-3 xl:px-5 py-2 lg:py-3.5 xl:py-4 gap-1.5 lg:gap-2.5 xl:gap-3">
                <p className="text-muted-foreground text-[11px] lg:text-xs xl:text-sm text-center leading-relaxed">
                  {mode.description}
                </p>
                <button
                  className="w-full rounded-full border border-border bg-transparent text-foreground text-[11px] lg:text-xs xl:text-sm font-medium py-1 lg:py-1.5 xl:py-2 hover:bg-secondary transition-colors"
                >
                  Play
                </button>
              </div>
            </div>
          ))}
        </div>

        <p className="text-muted-foreground text-sm sm:text-xs lg:text-sm xl:text-base mt-4 sm:mt-4 lg:mt-6 xl:mt-8 font-bold">
          A new puzzle every day — come back tomorrow!
        </p>
      </main>

      {/* Footer — always visible */}
      <footer className="shrink-0 py-1.5 sm:py-3 flex flex-col sm:flex-row items-center justify-center gap-1.5 sm:gap-0 text-[10px] sm:text-xs text-muted-foreground dark:text-muted-foreground/60 px-4">
        <div className="hidden sm:flex justify-center gap-4 flex-wrap">
          <Link to="/contact" className="hover:text-muted-foreground transition-colors">
            Contact Us
          </Link>
          <span>·</span>
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
          <span>·</span>
          <span>© {new Date().getFullYear()} Sports Rewind. All rights reserved.</span>
        </div>
        <div className="flex items-center gap-2 text-xs sm:hidden">
          <Link to="/contact" className="hover:text-muted-foreground transition-colors">
            Contact Us
          </Link>
          <span>·</span>
          <p>© {new Date().getFullYear()} Sports Rewind. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
