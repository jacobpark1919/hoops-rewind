import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Shield } from "lucide-react";

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

        {/* Mode cards */}
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 w-full max-w-2xl mb-10">
          {SPORT_MODES.map((mode) => (
            <div
              key={mode.label}
              className="flex-1 bg-card border border-border rounded-xl p-5 flex flex-col items-center text-center shadow-md hover:shadow-lg transition-shadow"
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
              >
                Play
              </Button>
            </div>
          ))}
        </div>

        <p className="text-muted-foreground text-sm sm:text-base text-center">
          Come back every day for a new sports history timeline puzzle.
        </p>
      </div>
    </div>
  );
}
