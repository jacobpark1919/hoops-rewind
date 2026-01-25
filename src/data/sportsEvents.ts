import { supabase } from "@/integrations/supabase/client";

export interface SportsEvent {
  id: string;
  title: string;
  year: number;
  sport: string;
  icon: string;
}

export async function getRandomEvents(count: number = 8): Promise<SportsEvent[]> {
  const { data, error } = await supabase
    .from("sports_events")
    .select("id, title, year, sport, icon");

  if (error) {
    console.error("Error fetching sports events:", error);
    return [];
  }

  // Shuffle and take requested count
  const shuffled = [...(data || [])].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}
