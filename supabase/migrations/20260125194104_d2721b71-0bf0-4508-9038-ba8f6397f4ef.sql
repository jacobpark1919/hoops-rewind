-- Create sports events table
CREATE TABLE public.sports_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  year INTEGER NOT NULL,
  sport TEXT NOT NULL,
  icon TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.sports_events ENABLE ROW LEVEL SECURITY;

-- Public read access (game content, not user data)
CREATE POLICY "Sports events are publicly readable"
  ON public.sports_events
  FOR SELECT
  USING (true);

-- Create index for random selection performance
CREATE INDEX idx_sports_events_year ON public.sports_events(year);