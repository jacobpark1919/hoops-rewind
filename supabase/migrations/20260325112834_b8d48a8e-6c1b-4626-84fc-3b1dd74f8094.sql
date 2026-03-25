CREATE OR REPLACE FUNCTION public.to_date_immutable(ts timestamptz)
RETURNS date
LANGUAGE sql
IMMUTABLE
AS $$ SELECT ts::date $$;

CREATE UNIQUE INDEX idx_game_results_unique_daily ON public.game_results (user_id, COALESCE(sport_filter, '__all__'), to_date_immutable(played_at));