import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Home, Plus, Trash2, Calendar, ChevronDown, ChevronUp, Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface SportEvent {
  id: string;
  title: string;
  year: number;
  sport: string;
  icon: string;
}

interface Challenge {
  id: string;
  challenge_date: string;
  sport_filter: string | null;
  daily_challenge_events: Array<{
    position: number;
    event_id: string;
    sports_events: SportEvent;
  }>;
}

const SPORTS = ["American Football", "Basketball", "Baseball"];
const SPORT_ICONS: Record<string, string> = {
  "American Football": "🏈",
  "Basketball": "🏀",
  "Baseball": "⚾",
};

function callAdmin(action: string, method: "GET" | "POST" = "GET", body?: any, params?: Record<string, string>, password?: string) {
  const url = new URL(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-api`);
  url.searchParams.set("action", action);
  if (params) Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
  };
  if (password) headers["x-admin-password"] = password;

  return fetch(url.toString(), {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  }).then(r => r.json());
}

export default function Admin() {
  const navigate = useNavigate();
  const [authenticated, setAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [passwordError, setPasswordError] = useState(false);
  const [tab, setTab] = useState<"events" | "challenges">("challenges");
  const [events, setEvents] = useState<SportEvent[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(false);

  // Add event form
  const [newTitle, setNewTitle] = useState("");
  const [newYear, setNewYear] = useState("");
  const [newSport, setNewSport] = useState("Basketball");
  const [newIcon, setNewIcon] = useState("🏀");
  const [showAddEvent, setShowAddEvent] = useState(false);

  // Create challenge form
  const [challengeDate, setChallengeDate] = useState("");
  const [challengeSport, setChallengeSport] = useState<string | null>(null);
  const [selectedEventIds, setSelectedEventIds] = useState<string[]>([]);
  const [showCreateChallenge, setShowCreateChallenge] = useState(false);
  const [filterSport, setFilterSport] = useState<string>("Basketball");
  const [expandedChallenge, setExpandedChallenge] = useState<string | null>(null);

  // Enable scrolling only on admin page
  useEffect(() => {
    document.documentElement.classList.add("admin-scroll");
    return () => {
      document.documentElement.classList.remove("admin-scroll");
    };
  }, []);

  const fetchEvents = useCallback(async () => {
    const data = await callAdmin("events", "GET");
    if (Array.isArray(data)) setEvents(data);
  }, []);

  const fetchChallenges = useCallback(async () => {
    const data = await callAdmin("challenges", "GET");
    if (Array.isArray(data)) setChallenges(data);
  }, []);

  useEffect(() => {
    fetchEvents();
    fetchChallenges();
  }, [fetchEvents, fetchChallenges]);

  const handleAddEvent = async () => {
    if (!newTitle || !newYear) return;
    setLoading(true);
    await callAdmin("add-event", "POST", {
      title: newTitle,
      year: parseInt(newYear),
      sport: newSport,
      icon: newIcon,
    }, undefined, passwordInput);
    setNewTitle("");
    setNewYear("");
    setShowAddEvent(false);
    await fetchEvents();
    setLoading(false);
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (!confirm("Delete this event? It will also be removed from any challenges.")) return;
    await callAdmin("delete-event", "POST", { event_id: eventId }, undefined, passwordInput);
    await fetchEvents();
  };

  const handleCreateChallenge = async () => {
    if (!challengeDate || selectedEventIds.length !== 8) return;
    setLoading(true);
    await callAdmin("create-challenge", "POST", {
      challenge_date: challengeDate,
      sport_filter: challengeSport,
      event_ids: selectedEventIds,
    }, undefined, passwordInput);
    setSelectedEventIds([]);
    setShowCreateChallenge(false);
    await fetchChallenges();
    setLoading(false);
  };

  const handleDeleteChallenge = async (challengeId: string) => {
    if (!confirm("Delete this challenge?")) return;
    await callAdmin("delete-challenge", "POST", { challenge_id: challengeId }, undefined, passwordInput);
    await fetchChallenges();
  };

  const toggleEventSelection = (eventId: string) => {
    setSelectedEventIds(prev =>
      prev.includes(eventId)
        ? prev.filter(id => id !== eventId)
        : prev.length < 8
          ? [...prev, eventId]
          : prev
    );
  };

  const filteredEvents = events.filter(e => e.sport === filterSport);

  const handlePasswordSubmit = async () => {
    // Verify password server-side with a lightweight POST
    const result = await callAdmin("verify", "POST", {}, undefined, passwordInput);
    if (result?.error === "Unauthorized") {
      setPasswordError(true);
    } else {
      setAuthenticated(true);
      setPasswordError(false);
    }
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-full max-w-xs space-y-4 p-6">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Lock className="w-5 h-5 text-muted-foreground" />
            <h1 className="font-display text-lg font-bold text-foreground">Admin Access</h1>
          </div>
          <input
            type="password"
            placeholder="Enter password"
            value={passwordInput}
            onChange={e => { setPasswordInput(e.target.value); setPasswordError(false); }}
            onKeyDown={e => e.key === "Enter" && handlePasswordSubmit()}
            className={`w-full px-4 py-3 rounded-xl border bg-background text-foreground text-sm ${
              passwordError ? "border-destructive" : "border-border"
            }`}
            autoFocus
          />
          {passwordError && <p className="text-destructive text-xs">Incorrect password</p>}
          <Button onClick={handlePasswordSubmit} className="w-full">Enter</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-3xl mx-auto py-6 px-4">
        {/* Header */}
        <header className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/")} className="p-1.5 rounded-full hover:bg-muted transition-colors">
              <Home className="w-5 h-5 text-muted-foreground" />
            </button>
            <h1 className="font-display text-xl font-bold text-foreground">Admin</h1>
          </div>
        </header>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <Button
            variant={tab === "challenges" ? "default" : "outline"}
            size="sm"
            onClick={() => setTab("challenges")}
          >
            <Calendar className="w-4 h-4 mr-1" /> Challenges
          </Button>
          <Button
            variant={tab === "events" ? "default" : "outline"}
            size="sm"
            onClick={() => setTab("events")}
          >
            Events ({events.length})
          </Button>
        </div>

        {/* CHALLENGES TAB */}
        {tab === "challenges" && (
          <div className="space-y-4">
            <Button onClick={() => setShowCreateChallenge(!showCreateChallenge)} size="sm">
              <Plus className="w-4 h-4 mr-1" /> New Challenge
            </Button>

            {showCreateChallenge && (
              <div className="border border-border rounded-xl p-4 space-y-4 bg-card">
                <h3 className="font-semibold text-foreground">Create Challenge</h3>
                <div className="flex gap-3 flex-wrap">
                  <input
                    type="date"
                    value={challengeDate}
                    onChange={e => setChallengeDate(e.target.value)}
                    className="px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm"
                  />
                  <select
                    value={challengeSport || ""}
                    onChange={e => {
                      const val = e.target.value || null;
                      setChallengeSport(val);
                      if (val) setFilterSport(val);
                    }}
                    className="px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm"
                  >
                    <option value="">Everything</option>
                    {SPORTS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground mb-2">
                    Select 8 events ({selectedEventIds.length}/8) — Filter:
                    <select
                      value={filterSport}
                      onChange={e => setFilterSport(e.target.value)}
                      className="ml-2 px-2 py-1 rounded border border-border bg-background text-foreground text-xs"
                    >
                      {SPORTS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </p>
                  <div className="max-h-64 overflow-y-auto space-y-1">
                    {filteredEvents.map((event, idx) => {
                      const isSelected = selectedEventIds.includes(event.id);
                      const selectionIndex = selectedEventIds.indexOf(event.id);
                      return (
                        <button
                          key={event.id}
                          onClick={() => toggleEventSelection(event.id)}
                          className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-2 ${
                            isSelected
                              ? "bg-primary/20 border border-primary"
                              : "bg-muted/30 hover:bg-muted/60 border border-transparent"
                          }`}
                        >
                          {isSelected && (
                            <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-bold flex-shrink-0">
                              {selectionIndex + 1}
                            </span>
                          )}
                          <span>{event.icon}</span>
                          <span className="flex-1 truncate">{event.title}</span>
                          <span className="text-muted-foreground text-xs">{event.year}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <Button onClick={handleCreateChallenge} disabled={selectedEventIds.length !== 8 || !challengeDate || loading} size="sm">
                  Create Challenge
                </Button>
              </div>
            )}

            {/* Existing challenges */}
            <div className="space-y-2">
              {challenges.map(ch => (
                <div key={ch.id} className="border border-border rounded-xl bg-card overflow-hidden">
                  <button
                    onClick={() => setExpandedChallenge(expandedChallenge === ch.id ? null : ch.id)}
                    className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-mono font-semibold text-foreground">{ch.challenge_date}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                        {ch.sport_filter || "Everything"}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {ch.daily_challenge_events?.length || 0} events
                      </span>
                    </div>
                    {expandedChallenge === ch.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                  {expandedChallenge === ch.id && (
                    <div className="px-4 pb-3 space-y-1">
                      {ch.daily_challenge_events
                        ?.sort((a, b) => a.position - b.position)
                        .map(ce => (
                          <div key={ce.event_id} className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span className="w-5 text-center font-mono text-xs">{ce.position}</span>
                            <span>{ce.sports_events?.icon}</span>
                            <span className="truncate">{ce.sports_events?.title}</span>
                            <span className="ml-auto text-xs">{ce.sports_events?.year}</span>
                          </div>
                        ))}
                      <Button
                        variant="destructive"
                        size="sm"
                        className="mt-2"
                        onClick={() => handleDeleteChallenge(ch.id)}
                      >
                        <Trash2 className="w-3 h-3 mr-1" /> Delete
                      </Button>
                    </div>
                  )}
                </div>
              ))}
              {challenges.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-8">No challenges yet</p>
              )}
            </div>
          </div>
        )}

        {/* EVENTS TAB */}
        {tab === "events" && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Button onClick={() => setShowAddEvent(!showAddEvent)} size="sm">
                <Plus className="w-4 h-4 mr-1" /> Add Event
              </Button>
              <select
                value={filterSport}
                onChange={e => setFilterSport(e.target.value)}
                className="px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm"
              >
                {SPORTS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            {showAddEvent && (
              <div className="border border-border rounded-xl p-4 space-y-3 bg-card">
                <h3 className="font-semibold text-foreground text-sm">Add Event</h3>
                <input
                  type="text"
                  placeholder="Event title"
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm"
                />
                <div className="flex gap-3">
                  <input
                    type="number"
                    placeholder="Year"
                    value={newYear}
                    onChange={e => setNewYear(e.target.value)}
                    className="w-24 px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm"
                  />
                  <select
                    value={newSport}
                    onChange={e => {
                      setNewSport(e.target.value);
                      setNewIcon(SPORT_ICONS[e.target.value] || "🏆");
                    }}
                    className="px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm"
                  >
                    {SPORTS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <Button onClick={handleAddEvent} disabled={!newTitle || !newYear || loading} size="sm">
                  Add
                </Button>
              </div>
            )}

            <div className="space-y-1">
              {filteredEvents.map(event => (
                <div key={event.id} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/30 text-sm">
                  <span>{event.icon}</span>
                  <span className="flex-1 truncate text-foreground">{event.title}</span>
                  <span className="text-muted-foreground text-xs">{event.year}</span>
                  <button onClick={() => handleDeleteEvent(event.id)} className="text-destructive hover:text-destructive/80 p-1">
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
              {filteredEvents.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-8">No events for {filterSport}</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
