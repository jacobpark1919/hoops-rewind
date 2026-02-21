import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Shield } from "lucide-react";

const SPORT_MODES = [
  { label: "Basketball Mode", value: "Basketball", icon: "🏀", description: "Guess the timeline for basketball events." },
  { label: "Football Mode", value: "American Football", icon: "🏈", description: "Guess the timeline for football events." },
  { label: "All Sports Mode", value: null, icon: "🏆", description: "Guess the timeline for all major sports." },
];

export default function Home() {
  const navigate = useNavigate();

  const handlePlay = (sportValue: string | null) => {
    const params = sportValue ? `?sport=${encodeURIComponent(sportValue)}` : "";
    navigate(`/play${params}`);
  };

  const today = new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

  return (
    <div className="min-h-screen bg-background flex flex-col relative">
      {/* Dark mode toggle - top right */}
      <div className="absolute top-4 right-4 z-20">
        <ThemeToggle />
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

        {/* Date */}
        <p className="text-muted-foreground text-sm mb-8">
          {today}
        </p>

        {/* Subtitle */}
        <p className="text-foreground/70 text-base sm:text-lg mb-6">
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
          {SPORT_MODES.map((mode) => (
            <div
              key={mode.label}
              className="bg-card border border-border rounded-xl p-5 flex flex-col items-center text-center shadow-md hover:shadow-lg transition-shadow"
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
          ))}
        </div>

        {/* Footer text */}
        <p className="text-muted-foreground text-sm text-center">
          Come back every day for a new sports history timeline puzzle.
        </p>
      </div>
    </div>
  );
}
