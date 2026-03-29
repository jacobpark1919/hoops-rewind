
-- Fix: Restrict daily_challenges to only show current and past dates
DROP POLICY IF EXISTS "Daily challenges are publicly readable" ON public.daily_challenges;
CREATE POLICY "Daily challenges are publicly readable" ON public.daily_challenges
  FOR SELECT TO public
  USING (challenge_date <= CURRENT_DATE);

-- Fix: Restrict daily_challenge_events to only show events for current/past challenges
DROP POLICY IF EXISTS "Daily challenge events are publicly readable" ON public.daily_challenge_events;
CREATE POLICY "Daily challenge events are publicly readable" ON public.daily_challenge_events
  FOR SELECT TO public
  USING (
    EXISTS (
      SELECT 1 FROM public.daily_challenges
      WHERE id = challenge_id
      AND challenge_date <= CURRENT_DATE
    )
  );
