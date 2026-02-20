import { Trophy, RotateCcw, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

interface GameCompleteProps {
  won: boolean;
  correctCount: number;
  totalRounds: number;
  resultHistory: boolean[];
  sportFilter?: string | null;
  onPlayAgain: () => void;
}

export function GameComplete({
  won,
  correctCount,
  totalRounds,
  resultHistory,
  sportFilter,
  onPlayAgain,
}: GameCompleteProps) {
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();

  // Generate the emoji grid (first result is always the anchor, so it's "free")
  const emojiGrid = resultHistory.map((correct) => (correct ? "🟩" : "🟥")).join("");
  
  // Create shareable text
  const sportLabel = sportFilter || "Everything";
  const shareText = `Sports Flashback ${sportLabel}
${emojiGrid}
${correctCount}/${totalRounds} correct`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = shareText;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

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
              Come back tomorrow for a new timeline!
            </p>
          </>
        )}

        {/* Stats grid - now first */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-card rounded-xl p-4 border border-border">
            <p className="text-3xl font-display font-bold text-primary">{correctCount}</p>
            <p className="text-xs text-muted-foreground">Correct</p>
          </div>
          <div className="bg-card rounded-xl p-4 border border-border">
            <p className="text-3xl font-display font-bold text-foreground">
              {Math.round((correctCount / totalRounds) * 100)}%
            </p>
            <p className="text-xs text-muted-foreground">Accuracy</p>
          </div>
        </div>

        {/* Emoji Result Grid - now second */}
        <div className="bg-card rounded-xl p-4 border border-border mb-6">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3">Your Results</p>
          <div className="flex justify-center gap-1 flex-wrap mb-3">
            {resultHistory.map((correct, index) => (
              <span 
                key={index} 
                className="text-2xl animate-bounce-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {correct ? "🟩" : "🟥"}
              </span>
            ))}
          </div>
          <p className="text-sm text-muted-foreground">
            {correctCount}/{totalRounds} correct
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <Button
            onClick={handleCopy}
            size="lg"
            variant="outline"
            className="w-full font-display text-lg"
          >
            {copied ? (
              <>
                <Check className="w-5 h-5 mr-2 text-success" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="w-5 h-5 mr-2" />
                Copy Results
              </>
            )}
          </Button>

          {/* Try other modes */}
          <p className="text-xs text-muted-foreground uppercase tracking-wider flex items-center justify-center gap-1.5 mt-1">
            Try a different game mode
          </p>
          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={() => navigate("/play?sport=American+Football")}
              size="lg"
              variant="outline"
              className="w-full font-display"
            >
              🏈 Football
            </Button>
            <Button
              onClick={() => navigate("/play")}
              size="lg"
              variant="outline"
              className="w-full font-display"
            >
              🏆 All Sports
            </Button>
          </div>

          <Button
            onClick={onPlayAgain}
            size="lg"
            className="w-full font-display text-lg"
          >
            <RotateCcw className="w-5 h-5 mr-2" />
            Play Again
          </Button>
        </div>
      </div>
    </div>
  );
}
