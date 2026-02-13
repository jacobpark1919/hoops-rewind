import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-admin-password",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const url = new URL(req.url);
    const action = url.searchParams.get("action");

    // GET actions
    if (req.method === "GET") {
      if (action === "events") {
        const sport = url.searchParams.get("sport");
        let query = supabase.from("sports_events").select("*").order("year", { ascending: true });
        if (sport) query = query.eq("sport", sport);
        const { data, error } = await query;
        if (error) throw error;
        return new Response(JSON.stringify(data), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      if (action === "challenges") {
        const { data, error } = await supabase
          .from("daily_challenges")
          .select("*, daily_challenge_events(position, event_id, sports_events(id, title, year, sport, icon))")
          .order("challenge_date", { ascending: false })
          .limit(30);
        if (error) throw error;
        return new Response(JSON.stringify(data), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
    }

    // POST actions require password
    if (req.method === "POST") {
      const adminPassword = Deno.env.get("ADMIN_PASSWORD");
      const providedPassword = req.headers.get("x-admin-password");
      if (!adminPassword || providedPassword !== adminPassword) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const body = await req.json();

      if (action === "add-event") {
        const { title, year, sport, icon } = body;
        const { data, error } = await supabase
          .from("sports_events")
          .insert({ title, year, sport, icon })
          .select()
          .single();
        if (error) throw error;
        return new Response(JSON.stringify(data), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      if (action === "add-events-bulk") {
        const { events } = body;
        const { data, error } = await supabase
          .from("sports_events")
          .insert(events)
          .select();
        if (error) throw error;
        return new Response(JSON.stringify(data), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      if (action === "create-challenge") {
        const { challenge_date, sport_filter, event_ids } = body;
        
        // Create the challenge
        const { data: challenge, error: challengeError } = await supabase
          .from("daily_challenges")
          .insert({ challenge_date, sport_filter })
          .select()
          .single();
        if (challengeError) throw challengeError;

        // Link events
        const challengeEvents = event_ids.map((event_id: string, index: number) => ({
          challenge_id: challenge.id,
          event_id,
          position: index + 1,
        }));
        const { error: eventsError } = await supabase
          .from("daily_challenge_events")
          .insert(challengeEvents);
        if (eventsError) throw eventsError;

        return new Response(JSON.stringify(challenge), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      if (action === "delete-challenge") {
        const { challenge_id } = body;
        // Delete linked events first
        await supabase.from("daily_challenge_events").delete().eq("challenge_id", challenge_id);
        const { error } = await supabase.from("daily_challenges").delete().eq("id", challenge_id);
        if (error) throw error;
        return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      if (action === "delete-event") {
        const { event_id } = body;
        const { error } = await supabase.from("sports_events").delete().eq("id", event_id);
        if (error) throw error;
        return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      if (action === "verify") {
        return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
    }

    return new Response(JSON.stringify({ error: "Unknown action" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
