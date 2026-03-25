-- Create game_results table to track user scores
CREATE TABLE public.game_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  played_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  sport_filter TEXT,
  correct_count INTEGER NOT NULL,
  total_rounds INTEGER NOT NULL,
  percentage NUMERIC(5,2) NOT NULL,
  is_perfect BOOLEAN NOT NULL DEFAULT false
);

ALTER TABLE public.game_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own results"
  ON public.game_results FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own results"
  ON public.game_results FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_game_results_user_id ON public.game_results(user_id);
CREATE INDEX idx_game_results_played_at ON public.game_results(user_id, played_at DESC);