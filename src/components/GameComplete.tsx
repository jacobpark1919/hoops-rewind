import { Trophy, Copy, Check, Home, BarChart3, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { SignUpCTA } from "./SignUpCTA";
import { StatsModal } from "./StatsModal";

const ALL_SPORT_OPTIONS = [
  { label: "Everything", value: null, icon: "🏆", path: "/play" },
  { label: "Football", value: "American Football", icon: "🏈", path: "/play?sport=American+Football" },
  { label: "Basketball", value: "Basketball", icon: "🏀", path: "/play?sport=Basketball" },
];

const ORIGIN_DATE = new Date(2026, 1, 12);

function getPuzzleNumber() {
  const easternStr = new Date().toLocaleDateString('en-CA', { timeZone: 'America/New_York' });
  const [y, m, d] = easternStr.split('-').map(Number);
  const todayET = new Date(y, m - 1, d);
  const diff = Math.floor((todayET.getTime() - ORIGIN_DATE.getTime()) / (1000 * 60 * 60 * 24));
  return Math.max(1, diff + 1);
}

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
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [copied, setCopied] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const today = new Date().toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  const puzzleNum = getPuzzleNumber();

  // Generate the emoji grid — prepend a free 🟩 for the anchor event
  const emojiGrid = "🟩" + resultHistory.map((correct) => (correct ? "🟩" : "🟥")).join("");
  
  // Create shareable text
  const sportLabel = sportFilter || "Everything";
  const shareText = `Hoops Rewind #${puzzleNum} ${sportLabel}
${emojiGrid}
${correctCount}/${totalRounds} correct`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
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
      <div className="text-center max-w-md mx-auto px-3 sm:px-4 py-3 sm:py-0 w-full">
        {won ? (
          <>
            <div className="w-10 h-10 sm:w-20 sm:h-20 mx-auto mb-1.5 sm:mb-6 rounded-full bg-success/20 flex items-center justify-center">
              <Trophy className="w-5 h-5 sm:w-10 sm:h-10 text-success" />
            </div>
            <h2 className="font-display text-xl sm:text-4xl font-bold text-foreground mb-0.5 sm:mb-2">
              VICTORY!
            </h2>
            <p className="text-muted-foreground text-xs sm:text-lg mb-2 sm:mb-6">
              Come back tomorrow for a new puzzle! Puzzles reset at midnight ET!
            </p>
          </>
        ) : (
          <>
            <h2 className="font-display text-xl sm:text-4xl font-bold text-foreground mb-1 sm:mb-3">
              Next time!
            </h2>
            <p className="font-display text-base sm:text-2xl text-foreground mb-2 sm:mb-6">
              Come back tomorrow for a new timeline! Puzzles reset at midnight ET!
            </p>
          </>
        )}

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-2 sm:gap-4 mb-2 sm:mb-6">
          <div className="bg-card rounded-lg sm:rounded-xl p-2 sm:p-4 border border-border">
            <p className="text-lg sm:text-3xl font-display font-bold text-accent">{correctCount}</p>
            <p className="text-[10px] sm:text-xs text-muted-foreground">Correct</p>
          </div>
          <div className="bg-card rounded-lg sm:rounded-xl p-2 sm:p-4 border border-border">
            <p className="text-lg sm:text-3xl font-display font-bold text-foreground">
              {Math.round((correctCount / totalRounds) * 100)}%
            </p>
            <p className="text-[10px] sm:text-xs text-muted-foreground">Accuracy</p>
          </div>
        </div>

        {/* Date & Puzzle number */}
        <p className="text-foreground text-xs sm:text-lg font-medium mb-2 sm:mb-4">
          {today} &nbsp;·&nbsp; Puzzle #{puzzleNum}
        </p>

        {/* Emoji Result Grid */}
        <div className="bg-card rounded-lg sm:rounded-xl p-2 sm:p-4 border border-border mb-2 sm:mb-3">
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
          <p className="text-xs sm:text-sm text-muted-foreground">
            {correctCount}/{totalRounds} correct
          </p>
        </div>

        {/* Copy Results button right after results box */}
        <Button
          onClick={handleCopy}
          size="lg"
          variant="outline"
          className="w-full font-display text-xs sm:text-lg h-8 sm:h-11 mb-2 sm:mb-4"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 sm:w-5 sm:h-5 mr-1.5 text-success" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 sm:w-5 sm:h-5 mr-1.5" />
              Copy Results
            </>
          )}
        </Button>

        <div className="flex flex-col gap-1.5 sm:gap-3">
          {/* Stats button for logged-in users */}
          {user && (
            <Button
              onClick={() => setShowStats(true)}
              size="lg"
              className="w-full font-display text-xs sm:text-lg h-8 sm:h-11 bg-accent text-accent-foreground hover:bg-accent/90"
            >
              <BarChart3 className="w-3.5 h-3.5 sm:w-5 sm:h-5 mr-1.5" />
              View Your Stats
            </Button>
          )}


          <div className="grid grid-cols-2 gap-1.5 sm:gap-3">
            <Button
              onClick={() => navigate("/")}
              size="lg"
              variant="outline"
              className="w-full font-display text-xs sm:text-lg h-8 sm:h-11"
            >
              <Home className="w-3.5 h-3.5 sm:w-5 sm:h-5 mr-1.5" />
              Home
            </Button>
            <Button
              onClick={onViewTimeline}
              size="lg"
              variant="outline"
              className="w-full font-display text-xs sm:text-lg h-8 sm:h-11"
            >
              View Timeline
            </Button>
          </div>

          {/* Sign up CTA for non-logged-in users */}
          {!user && (
            <div className="mt-1 sm:mt-2">
              <SignUpCTA gameData={{
                correctCount,
                totalRounds,
                resultHistory,
                sportFilter: sportFilter || null,
                won,
              }} />
            </div>
          )}


          <p className="text-xs sm:text-sm text-muted-foreground uppercase tracking-wider flex items-center justify-center gap-1 mt-0.5 sm:mt-1 font-semibold">
            Try a different game mode
          </p>
          <div className="grid grid-cols-2 gap-1.5 sm:gap-3">
            {ALL_SPORT_OPTIONS.filter(s => s.value !== (sportFilter ?? null)).map((sport) => (
              <Button
                key={sport.label}
                onClick={() => navigate(sport.path)}
                size="lg"
                variant="outline"
                className="w-full font-display text-xs sm:text-base h-8 sm:h-11"
              >
                {sport.icon} {sport.label}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Modal */}
      <StatsModal open={showStats} onClose={() => setShowStats(false)} />
    </div>
  );
}
