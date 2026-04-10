
CREATE TABLE public.share_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  share_type TEXT NOT NULL,
  sport_filter TEXT,
  puzzle_number INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.share_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert share events"
ON public.share_events
FOR INSERT
TO public
WITH CHECK (true);
