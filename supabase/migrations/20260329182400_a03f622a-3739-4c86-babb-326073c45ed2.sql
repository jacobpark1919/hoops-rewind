
-- Fix 1: Add CHECK constraints to game_results for score integrity
ALTER TABLE public.game_results ADD CONSTRAINT valid_total_rounds CHECK (total_rounds > 0);
ALTER TABLE public.game_results ADD CONSTRAINT valid_correct_count CHECK (correct_count >= 0 AND correct_count <= total_rounds);
ALTER TABLE public.game_results ADD CONSTRAINT valid_perfect CHECK (is_perfect = (correct_count = total_rounds));

-- Fix 2: Tighten the INSERT RLS policy to also enforce score validity
DROP POLICY IF EXISTS "Users can insert their own results" ON public.game_results;
CREATE POLICY "Users can insert their own results" ON public.game_results
  FOR INSERT TO public
  WITH CHECK (
    auth.uid() = user_id
    AND total_rounds > 0
    AND correct_count >= 0
    AND correct_count <= total_rounds
    AND is_perfect = (correct_count = total_rounds)
  );

-- Fix 3: Restrict profiles SELECT to authenticated users only
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Profiles are viewable by authenticated users" ON public.profiles
  FOR SELECT TO authenticated
  USING (true);
