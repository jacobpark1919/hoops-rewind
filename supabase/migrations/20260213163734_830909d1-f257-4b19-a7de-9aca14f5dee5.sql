
-- Create daily_challenges table
CREATE TABLE public.daily_challenges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  challenge_date DATE NOT NULL,
  sport_filter TEXT, -- null = "Everything", or specific sport like "American Football"
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(challenge_date, sport_filter)
);

-- Create junction table for challenge events
CREATE TABLE public.daily_challenge_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  challenge_id UUID NOT NULL REFERENCES public.daily_challenges(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES public.sports_events(id) ON DELETE CASCADE,
  position INTEGER NOT NULL, -- 1-8 ordering
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(challenge_id, position),
  UNIQUE(challenge_id, event_id)
);

-- Enable RLS
ALTER TABLE public.daily_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_challenge_events ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Daily challenges are publicly readable"
  ON public.daily_challenges FOR SELECT USING (true);

CREATE POLICY "Daily challenge events are publicly readable"
  ON public.daily_challenge_events FOR SELECT USING (true);
