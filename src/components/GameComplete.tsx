import { Trophy, Copy, Check, BarChart3, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { SignUpCTA } from "./SignUpCTA";
import { StatsModal } from "./StatsModal";
import { supabase } from "@/integrations/supabase/client";

const ALL_SPORT_OPTIONS = [
  { label: "Everything", value: null, icon: "🏆", path: "/" },
  { label: "Football", value: "American Football", icon: "🏈", path: "/?sport=American+Football" },
  { label: "Basketball", value: "Basketball", icon: "🏀", path: "/?sport=Basketball" },
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
  const { user } = useAuth();
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
${correctCount}/${totalRounds} correct
hoopsrewind.app`;

  const xShareText = `Hoops Rewind #${puzzleNum} ${sportLabel}\n${emojiGrid}\n${correctCount}/${totalRounds} correct\n@PlayHoopsRewind`;
  const xShareUrl = `https://x.com/intent/tweet?text=${encodeURIComponent(xShareText)}`;

  const trackShare = (shareType: string) => {
    supabase.from("share_events").insert({
      share_type: shareType,
      sport_filter: sportFilter ?? null,
      puzzle_number: puzzleNum,
    }).then(() => {});
  };

  const handleCopy = async () => {
    trackShare("copy");
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
      <div className="text-center max-w-md mx-auto px-3 sm:px-4 py-3 sm:py-0 w-full max-h-[100dvh] overflow-y-auto">
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

        {/* Share Results button — only shown when Web Share API is available */}
        {typeof navigator !== 'undefined' && typeof navigator.share === 'function' && (
          <Button
            onClick={() => { trackShare("native_share"); navigator.share({ text: shareText }).catch(() => {}); }}
            size="lg"
            variant="outline"
            className="w-full font-display text-xs sm:text-lg h-8 sm:h-11 mb-2 sm:mb-4 border-accent text-accent hover:bg-accent hover:text-accent-foreground"
          >
            <Share2 className="w-3.5 h-3.5 sm:w-5 sm:h-5 mr-1.5" />
            Share Results
          </Button>
        )}

        {/* Share to X button */}
        <Button
          onClick={() => { trackShare("share_x"); window.open(xShareUrl, '_blank'); }}
          size="lg"
          variant="outline"
          className="w-full font-display text-xs sm:text-lg h-8 sm:h-11 mb-2 sm:mb-4 border-accent text-accent hover:bg-accent hover:text-accent-foreground"
        >
          <svg className="w-3.5 h-3.5 sm:w-5 sm:h-5 mr-1.5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
          Share to X
        </Button>

        {/* Follow us on X */}
        <Button
          onClick={() => { trackShare("follow_x"); window.open('https://x.com/PlayHoopsRewind', '_blank'); }}
          size="lg"
          variant="outline"
          className="w-full font-display text-xs sm:text-lg h-8 sm:h-11 mb-2 sm:mb-4"
        >
          <svg className="w-3.5 h-3.5 sm:w-5 sm:h-5 mr-1.5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
          Follow us on X
        </Button>

        {/* Sign up CTA for guests */}
        {!user && (
          <div className="mb-2 sm:mb-4">
            <SignUpCTA gameData={{ correctCount, totalRounds, resultHistory, sportFilter: sportFilter ?? null, won }} />
          </div>
        )}

        <div className="flex flex-col gap-1.5 sm:gap-3">
          <div className={`grid ${user ? 'grid-cols-2' : ''} gap-1.5 sm:gap-3`}>
            {user && (
              <Button
                onClick={() => setShowStats(true)}
                size="lg"
                variant="outline"
                className="w-full font-display text-xs sm:text-lg h-8 sm:h-11"
              >
                <BarChart3 className="w-3.5 h-3.5 sm:w-5 sm:h-5 mr-1.5" />
                Your Stats
              </Button>
            )}
            <Button
              onClick={onViewTimeline}
              size="lg"
              variant="outline"
              className="w-full font-display text-xs sm:text-lg h-8 sm:h-11"
            >
              View Timeline
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Modal */}
      <StatsModal open={showStats} onClose={() => setShowStats(false)} />
    </div>
  );
}
