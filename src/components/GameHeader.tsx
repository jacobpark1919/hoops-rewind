import { Heart, HeartCrack } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { useEffect, useState } from "react";

interface GameHeaderProps {
  lives: number;
  maxLives: number;
  currentRound: number;
  totalRounds: number;
}

export function GameHeader({ lives, maxLives, currentRound, totalRounds }: GameHeaderProps) {
  const [previousLives, setPreviousLives] = useState(lives);
  const [breakingHeart, setBreakingHeart] = useState<number | null>(null);

  useEffect(() => {
    if (lives < previousLives) {
      // A life was lost - animate the heart that just broke
      setBreakingHeart(lives);
      const timer = setTimeout(() => {
        setBreakingHeart(null);
      }, 600);
      return () => clearTimeout(timer);
    }
    setPreviousLives(lives);
  }, [lives, previousLives]);

  return (
    <header className="flex items-center justify-between mb-8">
      <div>
        <h1 className="font-display text-3xl md:text-4xl font-extrabold tracking-tight">
          <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
            Sports
          </span>
          <span className="text-foreground ml-1">Flashback</span>
        </h1>
        <p className="text-muted-foreground mt-1 text-sm tracking-wide uppercase">
          Order the moments in history
        </p>
      </div>
      
      <div className="flex items-center gap-4">
        {/* Round counter */}
        <div className="text-center">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Round</p>
          <p className="font-display text-2xl font-bold text-foreground">
            {currentRound}/{totalRounds}
          </p>
        </div>
        
        {/* Lives */}
        <div className="flex items-center gap-1">
          {Array.from({ length: maxLives }).map((_, i) => {
            const isActive = i < lives;
            const isBreaking = breakingHeart === i;
            
            return (
              <div key={i} className="relative">
                {isBreaking ? (
                  <HeartCrack
                    className="w-6 h-6 text-destructive animate-heart-break"
                  />
                ) : (
                  <Heart
                    className={`w-6 h-6 transition-all duration-300 ${
                      isActive
                        ? "fill-destructive text-destructive"
                        : "text-muted-foreground"
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Theme toggle */}
        <ThemeToggle />
      </div>
    </header>
  );
}
