import { supabase } from "@/integrations/supabase/client";

export interface SportsEvent {
  id: string;
  title: string;
  year: number;
  sport: string;
  icon: string;
}

const MIN_YEAR_GAP = 3; // Events must be at least 3 years apart (so not within 2 years)

export async function getRandomEvents(count: number = 8, sportFilter?: string | null): Promise<SportsEvent[]> {
  let query = supabase
    .from("sports_events")
    .select("id, title, year, sport, icon");

  if (sportFilter) {
    query = query.eq("sport", sportFilter);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching sports events:", error);
    return [];
  }

  // Shuffle all events
  const shuffled = [...(data || [])].sort(() => Math.random() - 0.5);
  
  // Select events ensuring no two are within MIN_YEAR_GAP years of each other
  const selected: SportsEvent[] = [];
  
  for (const event of shuffled) {
    // Check if this event is far enough from all already selected events
    const isFarEnough = selected.every(
      (selectedEvent) => Math.abs(selectedEvent.year - event.year) >= MIN_YEAR_GAP
    );
    
    if (isFarEnough) {
      selected.push(event);
      if (selected.length >= count) break;
    }
  }

  return selected;
}
