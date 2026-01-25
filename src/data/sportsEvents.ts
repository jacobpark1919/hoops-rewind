import { supabase } from "@/integrations/supabase/client";

export interface SportsEvent {
  id: string;
  title: string;
  year: number;
  sport: string;
  icon: string;
}

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

  // Shuffle and take requested count
  const shuffled = [...(data || [])].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}
