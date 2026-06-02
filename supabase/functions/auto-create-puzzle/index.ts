import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function toISODate(y: number, m: number, d: number): string {
  return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

Deno.serve(async (req) => {
  try {
    // Authenticate with CRON_SECRET
    const cronSecret = Deno.env.get("CRON_SECRET");
    if (!cronSecret || req.headers.get("Authorization") !== `Bearer ${cronSecret}`) {
      return new Response(JSON.stringify({ error: "unauthorized" }), { status: 401 });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Derive tomorrow's date in Eastern Time
    const nowET = new Date().toLocaleDateString("en-CA", { timeZone: "America/New_York" });
    const [y, m, d] = nowET.split("-").map(Number);
    const tomorrow = new Date(y, m - 1, d + 1);
    const tomorrowStr = toISODate(
      tomorrow.getFullYear(),
      tomorrow.getMonth() + 1,
      tomorrow.getDate(),
    );

    // Skip if a Basketball puzzle already exists for tomorrow
    const { data: existing } = await supabase
      .from("daily_challenges")
      .select("id")
      .eq("challenge_date", tomorrowStr)
      .eq("sport_filter", "Basketball")
      .maybeSingle();

    if (existing) {
      console.log(`Puzzle already exists for ${tomorrowStr} — skipping.`);
      return new Response(JSON.stringify({ skipped: true, date: tomorrowStr }));
    }

    // Collect event IDs used in any puzzle in the past 14 days
    const cutoff = new Date(y, m - 1, d - 14);
    const cutoffStr = toISODate(
      cutoff.getFullYear(),
      cutoff.getMonth() + 1,
      cutoff.getDate(),
    );

    const { data: recentChallenges, error: recentErr } = await supabase
      .from("daily_challenges")
      .select("daily_challenge_events(event_id)")
      .gte("challenge_date", cutoffStr);
    if (recentErr) throw recentErr;

    const recentlyUsedIds = new Set<string>(
      (recentChallenges ?? []).flatMap((c: any) =>
        (c.daily_challenge_events ?? []).map((e: any) => e.event_id as string)
      ),
    );

    // Fetch only Basketball events and exclude recently used ones
    const { data: allEvents, error: eventsErr } = await supabase
      .from("sports_events")
      .select("id, year")
      .eq("sport", "Basketball");
    if (eventsErr) throw eventsErr;

    const available: { id: string; year: number }[] = (allEvents ?? []).filter(
      (e: any) => !recentlyUsedIds.has(e.id),
    );

    if (available.length < 8) {
      throw new Error(
        `Not enough available events after excluding recent: ${available.length}`,
      );
    }

    const chosen = new Set<string>();
    const usedYears = new Set<number>();

    // ── Rule 1: 2 pre-2000 events with distinct years ─────────────────────────
    const pre2000 = shuffle(available.filter((e) => e.year < 2000));
    let pre2000Added = 0;
    for (const e of pre2000) {
      if (usedYears.has(e.year)) continue;
      chosen.add(e.id);
      usedYears.add(e.year);
      if (++pre2000Added === 2) break;
    }
    if (pre2000Added < 2) {
      throw new Error(`Not enough pre-2000 events with distinct years (found ${pre2000Added})`);
    }

    // ── Rule 2: 2 events exactly 1 year apart, years not yet used ────────────
    const pool = available.filter((e) => !chosen.has(e.id) && !usedYears.has(e.year));
    const closePairs: [typeof pool[0], typeof pool[0]][] = [];
    for (let i = 0; i < pool.length; i++) {
      for (let j = i + 1; j < pool.length; j++) {
        if (Math.abs(pool[i].year - pool[j].year) === 1) {
          closePairs.push([pool[i], pool[j]]);
        }
      }
    }
    if (closePairs.length === 0) {
      throw new Error("No adjacent-year pair found in available events");
    }
    const pair = closePairs[Math.floor(Math.random() * closePairs.length)];
    chosen.add(pair[0].id); usedYears.add(pair[0].year);
    chosen.add(pair[1].id); usedYears.add(pair[1].year);

    // ── Rule 3: 4 more events, each with a year not yet used ─────────────────
    const remaining = shuffle(available.filter((e) => !chosen.has(e.id)));
    const final4: typeof remaining = [];
    for (const e of remaining) {
      if (usedYears.has(e.year)) continue;
      final4.push(e);
      usedYears.add(e.year);
      if (final4.length === 4) break;
    }
    if (final4.length < 4) {
      throw new Error(`Not enough events with unique years for final 4 (found ${final4.length})`);
    }
    final4.forEach((e) => chosen.add(e.id));

    // ── Create the challenge ──────────────────────────────────────────────────
    const finalIds = shuffle([...chosen]);

    const { data: challenge, error: challengeErr } = await supabase
      .from("daily_challenges")
      .insert({ challenge_date: tomorrowStr, sport_filter: "Basketball" })
      .select()
      .single();
    if (challengeErr) throw challengeErr;

    const { error: ceErr } = await supabase.from("daily_challenge_events").insert(
      finalIds.map((event_id, index) => ({
        challenge_id: challenge.id,
        event_id,
        position: index + 1,
      })),
    );
    if (ceErr) throw ceErr;

    console.log(`Auto-created puzzle for ${tomorrowStr}`, {
      pre2000: [pre2000[0].id, pre2000[1].id],
      closePair: [pair[0].id, pair[1].id],
      eventIds: finalIds,
    });

    return new Response(
      JSON.stringify({ created: true, date: tomorrowStr, event_ids: finalIds }),
      { headers: { "Content-Type": "application/json" } },
    );
  } catch (err: any) {
    console.error("auto-create-puzzle error:", err?.message ?? err);
    return new Response(
      JSON.stringify({ error: err?.message ?? "Internal error" }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
});
