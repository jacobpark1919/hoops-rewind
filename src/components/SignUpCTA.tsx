import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface SignUpCTAProps {
  gameData?: {
    correctCount: number;
    totalRounds: number;
    resultHistory: boolean[];
    sportFilter: string | null;
    won: boolean;
  };
}

export function SignUpCTA({ gameData }: SignUpCTAProps) {
  const [loading, setLoading] = useState<string | null>(null);

  const handleSignIn = async (provider: "google") => {
    setLoading(provider);
    // Save game data to localStorage so we can restore after OAuth redirect
    if (gameData) {
      localStorage.setItem("pending_game_signup", JSON.stringify(gameData));
    }
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: window.location.origin + window.location.pathname + window.location.search,
      },
    });
    if (error) {
      console.error("Sign in error:", error);
      setLoading(null);
    }
  };

  return (
    <div className="bg-card border-2 border-primary/30 rounded-xl p-4 sm:p-5">
      <h3 className="font-display text-base sm:text-lg font-bold text-foreground mb-1">
        🔓 Play the Last 7 Days
      </h3>
      <p className="text-xs sm:text-sm text-muted-foreground mb-3">
        Sign in to unlock the past week's puzzles, track your stats, and save your streaks.
      </p>
      <div className="flex flex-col gap-2">
        <button
          onClick={() => handleSignIn("google")}
          disabled={loading !== null}
          className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-lg bg-foreground text-background font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {loading === "google" ? (
            <div className="w-4 h-4 border-2 border-background border-t-transparent rounded-full animate-spin" />
          ) : (
            <svg className="w-4 h-4" viewBox="0 0 24 24" aria-hidden="true">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
          )}
          Continue with Google
        </button>
      </div>
    </div>
  );
}
