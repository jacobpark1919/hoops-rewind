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
    <div
      className="fixed inset-0 bg-background flex items-center justify-center z-50 animate-slide-up overflow-hidden sm:overflow-hidden"
      onWheel={(e) => e.stopPropagation()}
      onTouchMove={(e) => e.stopPropagation()}
      style={{
        // Fluid scale that grows with viewport height but stays bounded.
        // ~0.75 on a 600px-tall screen, ~1.0 on 800px, ~1.25 on 1000px+
        ['--gc-scale' as string]: 'clamp(0.75, calc(0.25 + 0.001 * 100vh), 1.4)',
      }}
    >
      <div
        className="text-center mx-auto w-full max-h-[100dvh] overflow-y-auto sm:overflow-y-hidden overscroll-contain"
        style={{
          maxWidth: 'min(92vw, calc(28rem * var(--gc-scale)))',
          padding: 'calc(0.5rem * var(--gc-scale)) calc(1rem * var(--gc-scale))',
          fontSize: 'calc(1rem * var(--gc-scale))',
        }}
      >
        {won ? (
          <>
            <div
              className="mx-auto rounded-full bg-success/20 flex items-center justify-center"
              style={{
                width: 'calc(3rem * var(--gc-scale))',
                height: 'calc(3rem * var(--gc-scale))',
                marginBottom: 'calc(0.375rem * var(--gc-scale))',
              }}
            >
              <Trophy style={{ width: 'calc(1.5rem * var(--gc-scale))', height: 'calc(1.5rem * var(--gc-scale))' }} className="text-success" />
            </div>
            <h2 className="font-display font-bold text-foreground" style={{ fontSize: 'calc(1.5rem * var(--gc-scale))', marginBottom: 'calc(0.25rem * var(--gc-scale))' }}>
              VICTORY!
            </h2>
            <p className="text-muted-foreground" style={{ fontSize: 'calc(0.75rem * var(--gc-scale))', marginBottom: 'calc(0.5rem * var(--gc-scale))' }}>
              Come back tomorrow for a new puzzle! Puzzles reset at midnight ET!
            </p>
          </>
        ) : (
          <>
            <h2 className="font-display font-bold text-foreground" style={{ fontSize: 'calc(1.5rem * var(--gc-scale))', marginBottom: 'calc(0.25rem * var(--gc-scale))' }}>
              Next time!
            </h2>
            <p className="font-display text-foreground" style={{ fontSize: 'calc(1rem * var(--gc-scale))', marginBottom: 'calc(0.5rem * var(--gc-scale))' }}>
              Come back tomorrow for a new timeline! Puzzles reset at midnight ET!
            </p>
          </>
        )}

        {/* Stats grid */}
        <div className="grid grid-cols-2" style={{ gap: 'calc(0.5rem * var(--gc-scale))', marginBottom: 'calc(0.5rem * var(--gc-scale))' }}>
          <div className="bg-card rounded-lg border border-border" style={{ padding: 'calc(0.5rem * var(--gc-scale))' }}>
            <p className="font-display font-bold text-accent" style={{ fontSize: 'calc(1.25rem * var(--gc-scale))' }}>{correctCount}</p>
            <p className="text-muted-foreground" style={{ fontSize: 'calc(0.625rem * var(--gc-scale))' }}>Correct</p>
          </div>
          <div className="bg-card rounded-lg border border-border" style={{ padding: 'calc(0.5rem * var(--gc-scale))' }}>
            <p className="font-display font-bold text-foreground" style={{ fontSize: 'calc(1.25rem * var(--gc-scale))' }}>
              {Math.round((correctCount / totalRounds) * 100)}%
            </p>
            <p className="text-muted-foreground" style={{ fontSize: 'calc(0.625rem * var(--gc-scale))' }}>Accuracy</p>
          </div>
        </div>

        {/* Date & Puzzle number */}
        <p className="text-foreground font-medium" style={{ fontSize: 'calc(0.75rem * var(--gc-scale))', marginBottom: 'calc(0.5rem * var(--gc-scale))' }}>
          {today} &nbsp;·&nbsp; Puzzle #{puzzleNum}
        </p>

        {/* Emoji Result Grid */}
        <div className="bg-card rounded-lg border border-border" style={{ padding: 'calc(0.5rem * var(--gc-scale))', marginBottom: 'calc(0.5rem * var(--gc-scale))' }}>
          <p className="text-muted-foreground uppercase tracking-wider" style={{ fontSize: 'calc(0.625rem * var(--gc-scale))', marginBottom: 'calc(0.25rem * var(--gc-scale))' }}>Your Results</p>
          <div className="flex justify-center flex-wrap" style={{ gap: 'calc(0.25rem * var(--gc-scale))', marginBottom: 'calc(0.25rem * var(--gc-scale))' }}>
            <span className="animate-bounce-in" style={{ fontSize: 'calc(1.125rem * var(--gc-scale))', animationDelay: '0ms' }}>🟩</span>
            {resultHistory.map((correct, index) => (
              <span
                key={index}
                className="animate-bounce-in"
                style={{ fontSize: 'calc(1.125rem * var(--gc-scale))', animationDelay: `${(index + 1) * 100}ms` }}
              >
                {correct ? "🟩" : "🟥"}
              </span>
            ))}
          </div>
          <p className="text-muted-foreground" style={{ fontSize: 'calc(0.75rem * var(--gc-scale))' }}>
            {correctCount}/{totalRounds} correct
          </p>
        </div>

        {/* Copy Results */}
        <Button
          onClick={handleCopy}
          variant="outline"
          className="w-full font-display"
          style={{ fontSize: 'calc(0.875rem * var(--gc-scale))', height: 'calc(2.25rem * var(--gc-scale))', marginBottom: 'calc(0.375rem * var(--gc-scale))' }}
        >
          {copied ? (
            <>
              <Check style={{ width: 'calc(1rem * var(--gc-scale))', height: 'calc(1rem * var(--gc-scale))', marginRight: 'calc(0.375rem * var(--gc-scale))' }} className="text-success" />
              Copied!
            </>
          ) : (
            <>
              <Copy style={{ width: 'calc(1rem * var(--gc-scale))', height: 'calc(1rem * var(--gc-scale))', marginRight: 'calc(0.375rem * var(--gc-scale))' }} />
              Copy Results
            </>
          )}
        </Button>

        {/* Share Results — native share if available */}
        {typeof navigator !== 'undefined' && typeof navigator.share === 'function' && (
          <Button
            onClick={() => { trackShare("share"); navigator.share({ text: shareText }).catch(() => {}); }}
            variant="outline"
            className="w-full font-display border-accent text-accent hover:bg-accent hover:text-accent-foreground"
            style={{ fontSize: 'calc(0.875rem * var(--gc-scale))', height: 'calc(2.25rem * var(--gc-scale))', marginBottom: 'calc(0.375rem * var(--gc-scale))' }}
          >
            <Share2 style={{ width: 'calc(1rem * var(--gc-scale))', height: 'calc(1rem * var(--gc-scale))', marginRight: 'calc(0.375rem * var(--gc-scale))' }} />
            Share Results
          </Button>
        )}

        {/* Sign up CTA for guests */}
        {!user && (
          <div style={{ marginBottom: 'calc(0.375rem * var(--gc-scale))' }}>
            <SignUpCTA gameData={{ correctCount, totalRounds, resultHistory, sportFilter: sportFilter ?? null, won }} />
          </div>
        )}

        {/* Play a Previous Puzzle (logged in only) */}
        {user && onPlayPastPuzzle && (
          <Button
            onClick={onPlayPastPuzzle}
            className="w-full font-display bg-accent text-accent-foreground hover:bg-accent/90"
            style={{ fontSize: 'calc(0.875rem * var(--gc-scale))', height: 'calc(2.25rem * var(--gc-scale))', marginBottom: 'calc(0.375rem * var(--gc-scale))' }}
          >
            <CalendarDays style={{ width: 'calc(1rem * var(--gc-scale))', height: 'calc(1rem * var(--gc-scale))', marginRight: 'calc(0.375rem * var(--gc-scale))' }} />
            Play a Previous Puzzle
          </Button>
        )}

        {/* Your Stats (logged in only) */}
        {user && (
          <Button
            onClick={() => setShowStats(true)}
            variant="outline"
            className="w-full font-display"
            style={{ fontSize: 'calc(0.875rem * var(--gc-scale))', height: 'calc(2.25rem * var(--gc-scale))', marginBottom: 'calc(0.375rem * var(--gc-scale))' }}
          >
            <BarChart3 style={{ width: 'calc(1rem * var(--gc-scale))', height: 'calc(1rem * var(--gc-scale))', marginRight: 'calc(0.375rem * var(--gc-scale))' }} />
            Your Stats
          </Button>
        )}

        {/* View Timeline */}
        <Button
          onClick={onViewTimeline}
          variant="outline"
          className="w-full font-display"
          style={{ fontSize: 'calc(0.875rem * var(--gc-scale))', height: 'calc(2.25rem * var(--gc-scale))', marginBottom: 'calc(0.375rem * var(--gc-scale))' }}
        >
          View Timeline
        </Button>

        {/* Contact Us */}
        <Button
          onClick={() => navigate("/contact")}
          variant="outline"
          className="w-full font-display"
          style={{ fontSize: 'calc(0.875rem * var(--gc-scale))', height: 'calc(2.25rem * var(--gc-scale))', marginBottom: 'calc(0.375rem * var(--gc-scale))' }}
        >
          <Mail style={{ width: 'calc(1rem * var(--gc-scale))', height: 'calc(1rem * var(--gc-scale))', marginRight: 'calc(0.25rem * var(--gc-scale))' }} />
          Contact Us
        </Button>

        {/* Sign Out (logged in only) */}
        {user && (
          <Button
            onClick={signOut}
            variant="ghost"
            className="w-full font-display text-muted-foreground hover:text-foreground"
            style={{ fontSize: 'calc(0.75rem * var(--gc-scale))', height: 'calc(1.75rem * var(--gc-scale))' }}
          >
            <LogOut style={{ width: 'calc(0.875rem * var(--gc-scale))', height: 'calc(0.875rem * var(--gc-scale))', marginRight: 'calc(0.25rem * var(--gc-scale))' }} />
            Sign Out
          </Button>
        )}
      </div>

      {/* Stats Modal */}
      <StatsModal open={showStats} onClose={() => setShowStats(false)} />
    </div>
  );
}
