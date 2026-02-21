import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Lock } from "lucide-react";

const SPORT_MODES = [
  {
    label: "Basketball Mode",
    value: "Basketball",
    icon: "🏀",
    description: "Guess the timeline for basketball events.",
  },
  {
    label: "Football Mode",
    value: "American Football",
    icon: "🏈",
    description: "Guess the timeline for football events.",
  },
  {
    label: "All Sports Mode",
    value: null,
    icon: "🏆",
    description: "Guess the timeline for all major sports.",
  },
];

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

  return (
    <div className="min-h-screen bg-background flex flex-col overflow-auto">
      {/* Dark mode toggle - top right */}
      <div className="absolute top-4 right-4 z-20">
        <ThemeToggle />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-12 sm:py-16">
        {/* Logo / Title */}
        <div className="flex items-center gap-2.5 mb-2">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-primary flex items-center justify-center shadow-md">
            <Lock className="w-5 h-5 sm:w-6 sm:h-6 text-primary-foreground" />
          </div>
          <h1 className="font-display text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground uppercase">
            Sports Vault
          </h1>
        </div>

        {/* Date */}
        <p className="text-muted-foreground text-sm sm:text-base mb-8 sm:mb-10">
          {today}
        </p>

        {/* Subtitle */}
        <p className="text-foreground/70 text-sm sm:text-lg mb-8 sm:mb-12 font-body">
          Select a mode to play today's puzzle:
        </p>

        {/* Mode cards with timeline connector */}
        <div className="relative w-full max-w-4xl mx-auto mb-8 sm:mb-12">
          {/* Timeline line - desktop only */}
          <div className="hidden md:block absolute top-[60px] left-[15%] right-[15%] h-[2px] bg-primary/30" />
          
          {/* Dots on timeline - desktop only */}
          <div className="hidden md:flex absolute top-[56px] left-[15%] right-[15%] justify-between pointer-events-none">
            <div className="w-2.5 h-2.5 rounded-full bg-primary -ml-1" />
            <div className="w-2.5 h-2.5 rounded-full bg-primary" />
            <div className="w-2.5 h-2.5 rounded-full bg-primary -mr-1" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            {SPORT_MODES.map((mode) => (
              <div key={mode.label} className="flex flex-col items-center">
                {/* Large emoji above card */}
                <div className="text-5xl sm:text-6xl mb-3 sm:mb-4 relative z-10">
                  {mode.icon}
                </div>

                {/* Card */}
                <div className="bg-card border border-border rounded-xl p-5 sm:p-6 w-full text-center shadow-lg hover:shadow-xl transition-shadow duration-200">
                  <h3 className="font-display text-lg sm:text-xl font-bold text-foreground mb-1.5">
                    {mode.label}
                  </h3>
                  <p className="text-muted-foreground text-sm mb-4">
                    {mode.description}
                  </p>
                  <Button
                    onClick={() => handlePlay(mode.value)}
                    className="px-8 sm:px-10 rounded-full font-display font-bold text-sm sm:text-base"
                  >
                    Play
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer text */}
        <p className="text-muted-foreground text-xs sm:text-sm text-center">
          Come back every day for a new sports history timeline puzzle.
        </p>
      </div>
    </div>
  );
}
