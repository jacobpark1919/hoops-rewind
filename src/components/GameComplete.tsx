import { Trophy, Copy, Check, BarChart3, Share2, LogOut, Mail, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { SignUpCTA } from "./SignUpCTA";
import { StatsModal } from "./StatsModal";
import { PastPuzzlePicker } from "./PastPuzzlePicker";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
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
  onPlayPastPuzzle?: () => void;
}

export function GameComplete({
  won,
  correctCount,
  totalRounds,
  resultHistory,
  sportFilter,
  onViewTimeline,
  onPlayPastPuzzle,
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
    <div className="fixed inset-0 bg-background flex items-center justify-center z-50 animate-slide-up overflow-hidden sm:overflow-hidden" onWheel={(e) => e.stopPropagation()} onTouchMove={(e) => e.stopPropagation()}>
      <div className="text-center max-w-md mx-auto px-3 sm:px-4 py-2 sm:py-3 w-full max-h-[100dvh] overflow-y-auto sm:overflow-y-hidden overscroll-contain">
        {won ? (
          <>
            <div className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-1.5 sm:mb-1.5 rounded-full bg-success/20 flex items-center justify-center">
              <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-success" />
            </div>
            <h2 className="font-display text-xl sm:text-2xl font-bold text-foreground mb-0.5 sm:mb-1">
              VICTORY!
            </h2>
            <p className="text-muted-foreground text-xs sm:text-xs mb-2 sm:mb-2">
              Come back tomorrow for a new puzzle! Puzzles reset at midnight ET!
            </p>
          </>
        ) : (
          <>
            <h2 className="font-display text-xl sm:text-2xl font-bold text-foreground mb-1 sm:mb-1">
              Next time!
            </h2>
            <p className="font-display text-base sm:text-base text-foreground mb-2 sm:mb-2">
              Come back tomorrow for a new timeline! Puzzles reset at midnight ET!
            </p>
          </>
        )}

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-2 sm:gap-2 mb-2 sm:mb-2">
          <div className="bg-card rounded-lg sm:rounded-lg p-2 sm:p-2 border border-border">
            <p className="text-lg sm:text-xl font-display font-bold text-accent">{correctCount}</p>
            <p className="text-[10px] sm:text-[10px] text-muted-foreground">Correct</p>
          </div>
          <div className="bg-card rounded-lg sm:rounded-lg p-2 sm:p-2 border border-border">
            <p className="text-lg sm:text-xl font-display font-bold text-foreground">
              {Math.round((correctCount / totalRounds) * 100)}%
            </p>
            <p className="text-[10px] sm:text-[10px] text-muted-foreground">Accuracy</p>
          </div>
        </div>

        {/* Date & Puzzle number */}
        <p className="text-foreground text-xs sm:text-xs font-medium mb-2 sm:mb-2">
          {today} &nbsp;·&nbsp; Puzzle #{puzzleNum}
        </p>

        {/* Emoji Result Grid */}
        <div className="bg-card rounded-lg sm:rounded-lg p-2 sm:p-2 border border-border mb-2 sm:mb-2">
          <p className="text-[10px] sm:text-[10px] text-muted-foreground uppercase tracking-wider mb-1 sm:mb-1">Your Results</p>
          <div className="flex justify-center gap-0.5 sm:gap-1 flex-wrap mb-1 sm:mb-1">
            <span className="text-base sm:text-lg animate-bounce-in" style={{ animationDelay: '0ms' }}>🟩</span>
            {resultHistory.map((correct, index) => (
              <span 
                key={index} 
                className="text-base sm:text-lg animate-bounce-in"
                style={{ animationDelay: `${(index + 1) * 100}ms` }}
              >
                {correct ? "🟩" : "🟥"}
              </span>
            ))}
          </div>
          <p className="text-xs sm:text-xs text-muted-foreground">
            {correctCount}/{totalRounds} correct
          </p>
        </div>

        {/* Copy Results */}
        <Button
          onClick={handleCopy}
          size="lg"
          variant="outline"
          className="w-full font-display text-xs sm:text-sm h-8 sm:h-9 mb-1.5 sm:mb-1.5"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 text-success" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5" />
              Copy Results
            </>
          )}
        </Button>

        {/* Share Results — native share if available */}
        {typeof navigator !== 'undefined' && typeof navigator.share === 'function' && (
          <Button
            onClick={() => { trackShare("share"); navigator.share({ text: shareText }).catch(() => {}); }}
            size="lg"
            variant="outline"
            className="w-full font-display text-xs sm:text-sm h-8 sm:h-9 mb-1.5 sm:mb-1.5 border-accent text-accent hover:bg-accent hover:text-accent-foreground"
          >
            <Share2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5" />
            Share Results
          </Button>
        )}

        {/* Sign up CTA for guests */}
        {!user && (
          <div className="mb-1.5 sm:mb-1.5">
            <SignUpCTA gameData={{ correctCount, totalRounds, resultHistory, sportFilter: sportFilter ?? null, won }} />
          </div>
        )}

        {/* Play a Previous Puzzle (logged in only) — highlighted orange */}
        {user && onPlayPastPuzzle && (
          <Button
            onClick={onPlayPastPuzzle}
            size="lg"
            className="w-full font-display text-xs sm:text-sm h-8 sm:h-9 mb-1.5 sm:mb-1.5 bg-accent text-accent-foreground hover:bg-accent/90"
          >
            <CalendarDays className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5" />
            Play a Previous Puzzle
          </Button>
        )}

        {/* Your Stats (logged in only) */}
        {user && (
          <Button
            onClick={() => setShowStats(true)}
            size="lg"
            variant="outline"
            className="w-full font-display text-xs sm:text-sm h-8 sm:h-9 mb-1.5 sm:mb-1.5"
          >
            <BarChart3 className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5" />
            Your Stats
          </Button>
        )}

        {/* View Timeline */}
        <Button
          onClick={onViewTimeline}
          size="lg"
          variant="outline"
          className="w-full font-display text-xs sm:text-sm h-8 sm:h-9 mb-1.5 sm:mb-1.5"
        >
          View Timeline
        </Button>

        {/* Contact Us */}
        <Button
          onClick={() => navigate("/contact")}
          size="lg"
          variant="outline"
          className="w-full font-display text-xs sm:text-sm h-8 sm:h-9 mb-1.5 sm:mb-1.5"
        >
          <Mail className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1" />
          Contact Us
        </Button>

        {/* Sign Out (logged in only) */}
        {user && (
          <Button
            onClick={signOut}
            size="sm"
            variant="ghost"
            className="w-full font-display text-[10px] sm:text-xs h-6 sm:h-7 text-muted-foreground hover:text-foreground"
          >
            <LogOut className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-1" />
            Sign Out
          </Button>
        )}
      </div>
      </div>

      {/* Stats Modal */}
      <StatsModal open={showStats} onClose={() => setShowStats(false)} />
    </div>
  );
}
