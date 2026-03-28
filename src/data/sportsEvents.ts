import { supabase } from "@/integrations/supabase/client";

export interface SportsEvent {
  id: string;
  title: string;
  year: number;
  sport: string;
  icon: string;
}

export async function getDailyChallengeEvents(sportFilter?: string | null): Promise<SportsEvent[]> {
  // Use Eastern Time (America/New_York) so challenges reset at midnight ET for everyone
  const eastern = new Date().toLocaleDateString('en-CA', { timeZone: 'America/New_York' });
  const today = eastern; // already YYYY-MM-DD format

  let challengeQuery = supabase
    .from("daily_challenges")
    .select("id")
    .eq("challenge_date", today);

  if (sportFilter) {
    challengeQuery = challengeQuery.eq("sport_filter", sportFilter);
  } else {
    challengeQuery = challengeQuery.is("sport_filter", null);
  }

  const { data: challenge, error: challengeError } = await challengeQuery.maybeSingle();

  if (challengeError || !challenge) {
    return [];
  }

  const { data: challengeEvents, error: eventsError } = await supabase
    .from("daily_challenge_events")
    .select("position, sports_events(id, title, year, sport, icon)")
    .eq("challenge_id", challenge.id)
    .order("position");

  if (eventsError || !challengeEvents) {
    return [];
  }

  return challengeEvents
    .map((ce: any) => ce.sports_events as SportsEvent)
    .filter(Boolean);
}
