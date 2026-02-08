import { Heart, HeartCrack } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

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
    <header className="flex items-center justify-between mb-4">
      {/* Round counter */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground uppercase tracking-wider">Round</span>
        <span className="font-display text-lg font-bold text-foreground">
          {currentRound}/{totalRounds}
        </span>
      </div>
      
      <div className="flex items-center gap-3">
        {/* Lives */}
        <div className="flex items-center gap-1">
          {Array.from({ length: maxLives }).map((_, i) => {
            const isActive = i < lives;
            const isBreaking = breakingHeart === i;
            
            return (
              <div key={i} className="relative">
                {isBreaking ? (
                  <HeartCrack
                    className="w-5 h-5 text-destructive animate-heart-break"
                  />
                ) : (
                  <Heart
                    className={`w-5 h-5 transition-all duration-300 ${
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
