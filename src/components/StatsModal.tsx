import { useState, useEffect } from "react";
import { X, BarChart3, Flame, Target, Hash } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface Stats {
  totalPlays: number;
  averagePercentage: number;
  perfectStreak: number;
}

interface StatsModalProps {
  open: boolean;
  onClose: () => void;
}

export function StatsModal({ open, onClose }: StatsModalProps) {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!open || !user) return;
    setLoading(true);

    supabase
      .from("game_results")
      .select("percentage, is_perfect, played_at")
      .eq("user_id", user.id)
      .order("played_at", { ascending: false })
      .then(({ data }) => {
        if (!data || data.length === 0) {
          setStats({ totalPlays: 0, averagePercentage: 0, perfectStreak: 0 });
        } else {
          const totalPlays = data.length;
          const avgPct = data.reduce((sum, r) => sum + Number(r.percentage), 0) / totalPlays;

          // Calculate current perfect streak (consecutive 100% from most recent)
          let perfectStreak = 0;
          for (const result of data) {
            if (result.is_perfect) {
              perfectStreak++;
            } else {
              break;
            }
          }

          setStats({
            totalPlays,
            averagePercentage: Math.round(avgPct),
            perfectStreak,
          });
        }
        setLoading(false);
      });
  }, [open, user]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50" onClick={onClose}>
      <div
        className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6 animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display text-xl font-bold text-foreground flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-accent" />
            Your Stats
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : stats && stats.totalPlays === 0 ? (
          <p className="text-center text-muted-foreground py-6 text-sm">
            No games played yet. Finish a puzzle to see your stats!
          </p>
        ) : stats ? (
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-background rounded-xl p-4 text-center border border-border">
              <Hash className="w-4 h-4 text-accent mx-auto mb-1.5" />
              <p className="text-2xl font-display font-bold text-foreground">{stats.totalPlays}</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">Played</p>
            </div>
            <div className="bg-background rounded-xl p-4 text-center border border-border">
              <Target className="w-4 h-4 text-accent mx-auto mb-1.5" />
              <p className="text-2xl font-display font-bold text-foreground">{stats.averagePercentage}%</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">Average</p>
            </div>
            <div className="bg-background rounded-xl p-4 text-center border border-border">
              <Flame className="w-4 h-4 text-accent mx-auto mb-1.5" />
              <p className="text-2xl font-display font-bold text-foreground">{stats.perfectStreak}</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">💯 Streak</p>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
