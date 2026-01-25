import { Trophy, RotateCcw, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface GameCompleteProps {
  won: boolean;
  correctCount: number;
  totalRounds: number;
  livesRemaining: number;
  onPlayAgain: () => void;
}

export function GameComplete({
  won,
  correctCount,
  totalRounds,
  livesRemaining,
  onPlayAgain,
}: GameCompleteProps) {
  const percentage = Math.round((correctCount / totalRounds) * 100);

  return (
    <div className="fixed inset-0 bg-background/95 backdrop-blur-sm flex items-center justify-center z-50 animate-slide-up">
      <div className="text-center max-w-md mx-auto px-4">
        {won ? (
          <>
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-success/20 flex items-center justify-center">
              <Trophy className="w-10 h-10 text-success" />
            </div>
            <h2 className="font-display text-4xl font-bold text-foreground mb-2">
              VICTORY!
            </h2>
            <p className="text-muted-foreground text-lg mb-6">
              You placed all events correctly!
            </p>
          </>
        ) : (
          <>
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-destructive/20 flex items-center justify-center">
              <span className="text-4xl">😢</span>
            </div>
            <h2 className="font-display text-4xl font-bold text-foreground mb-2">
              GAME OVER
            </h2>
            <p className="text-muted-foreground text-lg mb-6">
              Better luck next time!
            </p>
          </>
        )}

        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-card rounded-xl p-4 border border-border">
            <p className="text-4xl font-display font-bold text-primary">{correctCount}</p>
            <p className="text-sm text-muted-foreground">Correct</p>
          </div>
          <div className="bg-card rounded-xl p-4 border border-border">
            <p className="text-4xl font-display font-bold text-foreground">{percentage}%</p>
            <p className="text-sm text-muted-foreground">Accuracy</p>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <Button
            onClick={onPlayAgain}
            size="lg"
            className="w-full font-display text-lg"
          >
            <RotateCcw className="w-5 h-5 mr-2" />
            Play Again
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="w-full font-display text-lg"
            onClick={() => {
              navigator.share?.({
                title: "Sports Flashback",
                text: `I got ${correctCount}/${totalRounds} correct on Sports Flashback! Can you beat me?`,
              });
            }}
          >
            <Share2 className="w-5 h-5 mr-2" />
            Share Result
          </Button>
        </div>
      </div>
    </div>
  );
}
