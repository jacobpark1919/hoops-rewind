import { useNavigate, Link } from "react-router-dom";
import { ThemeToggle } from "@/components/ThemeToggle";
import { StatsModal } from "@/components/StatsModal";
import { useAuth } from "@/hooks/useAuth";
import { LogIn, LogOut, BarChart3 } from "lucide-react";
import { lovable } from "@/integrations/lovable/index";
import { useState } from "react";

const ORIGIN_DATE = new Date(2026, 1, 12);

function getPuzzleNumber() {
  const easternStr = new Date().toLocaleDateString('en-CA', { timeZone: 'America/New_York' });
  const [y, m, d] = easternStr.split('-').map(Number);
  const todayET = new Date(y, m - 1, d);
  const diff = Math.floor((todayET.getTime() - ORIGIN_DATE.getTime()) / (1000 * 60 * 60 * 24));
  return Math.max(1, diff + 1);
}

export default function Home() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [showStats, setShowStats] = useState(false);

  const handlePlay = () => {
    navigate("/play?sport=Basketball");
  };

  const today = new Date().toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  const todayShort = new Date().toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const puzzleNum = getPuzzleNumber();

  return (
    <div className="h-[100dvh] bg-background flex flex-col overflow-hidden">
      {/* Nav bar */}
      <nav className="flex justify-between items-center px-6 sm:px-9 py-5 sm:py-6 shrink-0">
        {/* Logo */}
        <div className="flex items-center gap-2 cursor-default">
          <svg className="w-6 h-[17px] text-accent" viewBox="0 0 24 17" fill="none">
            <polygon points="12,8.5 24,0 24,17" fill="currentColor" />
            <polygon points="0,8.5 12,0 12,17" fill="currentColor" />
          </svg>
          <span className="font-display font-black text-base tracking-wider text-foreground uppercase">
            Hoops Rewind
          </span>
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <button
                onClick={() => setShowStats(true)}
                className="p-1.5 sm:p-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors border border-border"
                aria-label="Your stats"
              >
                <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 text-foreground" />
              </button>
              <button
                onClick={signOut}
                className="p-1.5 sm:p-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors border border-border"
                aria-label="Sign out"
              >
                <LogOut className="w-4 h-4 sm:w-5 sm:h-5 text-foreground" />
              </button>
            </>
          ) : (
            <button
              onClick={() => lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin })}
              className="flex items-center gap-1.5 px-3 py-1.5 sm:py-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors text-foreground text-xs sm:text-sm font-medium border border-border"
            >
              <LogIn className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              Sign In
            </button>
          )}
          <ThemeToggle size="sm" className="sm:hidden" />
          <ThemeToggle className="hidden sm:block" />
        </div>
      </nav>

      {/* Main content */}
      <main className="flex-1 min-h-0 flex flex-col items-center px-6">
        {/* Desktop: centered */}
        <div className="hidden sm:flex flex-1 flex-col items-center justify-center text-center">
          <div className="flex items-center gap-2.5 mb-[clamp(16px,1.2vw,24px)]">
            <span className="text-[clamp(11px,0.85vw,14px)] tracking-widest uppercase text-muted-foreground">
              Puzzle #{puzzleNum}
            </span>
            <div className="w-[3px] h-[3px] rounded-full bg-border" />
            <span className="text-[clamp(11px,0.85vw,14px)] text-muted-foreground">{today}</span>
          </div>

          <h1 className="font-display font-black text-[clamp(56px,7vw,120px)] leading-[0.88] tracking-tight text-foreground mb-[clamp(24px,1.8vw,36px)]">
            Test your<br />hoops <span className="text-accent">history.</span>
          </h1>

          <button
            onClick={handlePlay}
            className="bg-accent text-white border-none px-[clamp(44px,3.5vw,64px)] py-[clamp(16px,1.2vw,22px)] rounded-lg font-body text-[clamp(16px,1.1vw,20px)] font-semibold cursor-pointer mb-3 hover:opacity-90 transition-opacity tracking-wide"
          >
            Play Today's Puzzle
          </button>

          <div className="flex items-center gap-1.5 text-[clamp(11px,0.8vw,14px)] text-muted-foreground">
            <div className="w-[5px] h-[5px] rounded-full bg-success animate-pulse" />
            New puzzle every day
          </div>
        </div>

        {/* Mobile: top-aligned */}
        <div className="flex sm:hidden flex-col items-stretch justify-center flex-1">
          <div className="flex items-center justify-between mb-5">
            <span className="text-[11px] tracking-widest uppercase text-muted-foreground">
              Puzzle #{puzzleNum}
            </span>
            <span className="text-[11px] text-muted-foreground">{todayShort}</span>
          </div>

          <h1 className="font-display font-black text-[64px] leading-[0.86] tracking-tight text-foreground mb-6">
            Test your<br />hoops <span className="text-accent">history.</span>
          </h1>

          <button
            onClick={handlePlay}
            className="w-full bg-accent text-white border-none py-4 rounded-lg font-body text-[15px] font-semibold cursor-pointer mb-3.5 hover:opacity-90 transition-opacity"
          >
            Play Today's Puzzle
          </button>

          <div className="flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground">
            <div className="w-[5px] h-[5px] rounded-full bg-success animate-pulse" />
            New puzzle every day · #{puzzleNum + 1} tomorrow
          </div>
        </div>
      </main>

      {/* Desktop footer */}
      <footer className="hidden sm:flex shrink-0 border-t border-border py-4 items-center justify-center gap-1.5 flex-wrap px-8">
        <Link to="/contact" className="text-[11px] text-muted-foreground hover:text-foreground transition-colors tracking-wide">
          Contact Us
        </Link>
        <span className="text-[11px] text-muted-foreground/40">·</span>
        <Link to="/privacy" className="text-[11px] text-muted-foreground hover:text-foreground transition-colors tracking-wide">
          Privacy Policy
        </Link>
        <span className="text-[11px] text-muted-foreground/40">·</span>
        <Link to="/terms" className="text-[11px] text-muted-foreground hover:text-foreground transition-colors tracking-wide">
          Terms of Service
        </Link>
        <span className="text-[11px] text-muted-foreground/40">·</span>
        <Link to="/cookies" className="text-[11px] text-muted-foreground hover:text-foreground transition-colors tracking-wide">
          Cookie Policy
        </Link>
        <span className="text-[11px] text-muted-foreground/40">·</span>
        <span className="text-[11px] text-muted-foreground tracking-wide">
          © {new Date().getFullYear()} Hoops Rewind. All rights reserved.
        </span>
      </footer>

      {/* Mobile footer */}
      <footer className="flex sm:hidden shrink-0 border-t border-border py-3.5 px-6 items-center justify-between">
        <Link to="/contact" className="text-[10px] text-muted-foreground hover:text-foreground transition-colors tracking-wide">
          Contact Us
        </Link>
        <span className="text-[10px] text-muted-foreground/40">·</span>
        <span className="text-[10px] text-muted-foreground tracking-wide">
          © {new Date().getFullYear()} Hoops Rewind. All rights reserved.
        </span>
      </footer>

      {/* Stats Modal */}
      <StatsModal open={showStats} onClose={() => setShowStats(false)} />
    </div>
  );
}
