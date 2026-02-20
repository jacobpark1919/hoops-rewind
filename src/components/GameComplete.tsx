import { Trophy, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const ALL_SPORT_OPTIONS = [
  { label: "Everything", value: null, icon: "🏆", path: "/play" },
  { label: "Football", value: "American Football", icon: "🏈", path: "/play?sport=American+Football" },
];

interface GameCompleteProps {
  won: boolean;
  correctCount: number;
  totalRounds: number;
  resultHistory: boolean[];
  sportFilter?: string | null;
  onViewTimeline: () => void;
}

export function GameComplete({
  won,
  correctCount,
  totalRounds,
  resultHistory,
  sportFilter,
  onViewTimeline,
}: GameCompleteProps) {
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();

  // Generate the emoji grid — prepend a free 🟩 for the anchor event
  const emojiGrid = "🟩" + resultHistory.map((correct) => (correct ? "🟩" : "🟥")).join("");
  
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
    <div className="fixed inset-0 bg-background/95 backdrop-blur-sm flex items-center justify-center z-50 animate-slide-up overflow-y-auto">
      <div className="text-center max-w-[280px] sm:max-w-md mx-auto px-3 sm:px-4 py-3 sm:py-0 w-full">
        {won ? (
          <>
            <div className="w-10 h-10 sm:w-20 sm:h-20 mx-auto mb-2 sm:mb-6 rounded-full bg-success/20 flex items-center justify-center">
              <Trophy className="w-5 h-5 sm:w-10 sm:h-10 text-success" />
            </div>
            <h2 className="font-display text-xl sm:text-4xl font-bold text-foreground mb-0.5 sm:mb-2">
              VICTORY!
            </h2>
            <p className="text-muted-foreground text-xs sm:text-lg mb-2 sm:mb-6">
              You placed all events correctly!
            </p>
          </>
        ) : (
          <>
            <div className="w-10 h-10 sm:w-20 sm:h-20 mx-auto mb-2 sm:mb-6 rounded-full bg-destructive/20 flex items-center justify-center">
              <span className="text-xl sm:text-4xl">😢</span>
            </div>
            <h2 className="font-display text-xl sm:text-4xl font-bold text-foreground mb-0.5 sm:mb-2">
              GAME OVER
            </h2>
            <p className="text-muted-foreground text-xs sm:text-lg mb-2 sm:mb-6">
              Come back tomorrow for a new timeline!
            </p>
          </>
        )}

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-2 sm:gap-4 mb-2 sm:mb-6">
          <div className="bg-card rounded-lg sm:rounded-xl p-2 sm:p-4 border border-border">
            <p className="text-lg sm:text-3xl font-display font-bold text-primary">{correctCount}</p>
            <p className="text-[10px] sm:text-xs text-muted-foreground">Correct</p>
          </div>
          <div className="bg-card rounded-lg sm:rounded-xl p-2 sm:p-4 border border-border">
            <p className="text-lg sm:text-3xl font-display font-bold text-foreground">
              {Math.round((correctCount / totalRounds) * 100)}%
            </p>
            <p className="text-[10px] sm:text-xs text-muted-foreground">Accuracy</p>
          </div>
        </div>

        {/* Emoji Result Grid */}
        <div className="bg-card rounded-lg sm:rounded-xl p-2 sm:p-4 border border-border mb-2 sm:mb-6">
          <p className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wider mb-1 sm:mb-3">Your Results</p>
          <div className="flex justify-center gap-0.5 sm:gap-1 flex-wrap mb-1 sm:mb-3">
            <span className="text-base sm:text-2xl animate-bounce-in" style={{ animationDelay: '0ms' }}>🟩</span>
            {resultHistory.map((correct, index) => (
              <span 
                key={index} 
                className="text-base sm:text-2xl animate-bounce-in"
                style={{ animationDelay: `${(index + 1) * 100}ms` }}
              >
                {correct ? "🟩" : "🟥"}
              </span>
            ))}
          </div>
          <p className="text-[11px] sm:text-sm text-muted-foreground">
            {correctCount}/{totalRounds} correct
          </p>
        </div>

        <div className="flex flex-col gap-1.5 sm:gap-3">
          <Button
            onClick={handleCopy}
            size="sm"
            variant="outline"
            className="w-full font-display text-xs sm:text-lg h-8 sm:h-12"
          >
            {copied ? (
              <>
                <Check className="w-3 h-3 sm:w-5 sm:h-5 mr-1.5 sm:mr-2 text-success" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="w-3 h-3 sm:w-5 sm:h-5 mr-1.5 sm:mr-2" />
                Copy Results
              </>
            )}
          </Button>

          <p className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wider flex items-center justify-center gap-1 sm:gap-1.5 mt-0.5 sm:mt-1">
            Try a different game mode
          </p>
          <div className="flex gap-1.5 sm:gap-3">
            {ALL_SPORT_OPTIONS.filter(s => s.value !== (sportFilter ?? null)).map((sport) => (
              <Button
                key={sport.label}
                onClick={() => navigate(sport.path)}
                size="sm"
                variant="outline"
                className="flex-1 font-display text-[11px] sm:text-base h-8 sm:h-12"
              >
                {sport.icon} {sport.label}
              </Button>
            ))}
          </div>

          <Button
            onClick={onViewTimeline}
            size="sm"
            className="w-full font-display text-xs sm:text-lg h-8 sm:h-12"
          >
            View Timeline
          </Button>
        </div>
      </div>
    </div>
  );
}
