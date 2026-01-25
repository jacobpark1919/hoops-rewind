import { Heart } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";

interface GameHeaderProps {
  lives: number;
  maxLives: number;
  currentRound: number;
  totalRounds: number;
}

export function GameHeader({ lives, maxLives, currentRound, totalRounds }: GameHeaderProps) {
  return (
    <header className="flex items-center justify-between mb-8">
      <div>
        <h1 className="font-display text-3xl md:text-4xl font-bold text-primary tracking-tight">
          Sports Flashback
        </h1>
        <p className="text-muted-foreground mt-1">
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
          {Array.from({ length: maxLives }).map((_, i) => (
            <Heart
              key={i}
              className={`w-6 h-6 transition-all duration-300 ${
                i < lives
                  ? "fill-destructive text-destructive"
                  : "text-muted-foreground"
              }`}
            />
          ))}
        </div>

        {/* Theme toggle */}
        <ThemeToggle />
      </div>
    </header>
  );
}
