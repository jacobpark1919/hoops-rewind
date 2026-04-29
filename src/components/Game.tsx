import { useState, useCallback, useEffect, useRef } from "react";
import { SportsEvent, getDailyChallengeEvents } from "@/data/sportsEvents";
import { EventCard } from "./EventCard";
import { Timeline } from "./Timeline";
import { GameComplete } from "./GameComplete";
import { InstructionsModal } from "./InstructionsModal";
import { DragOverlay } from "./DragOverlay";
import { ThemeToggle } from "./ThemeToggle";
import { StatsModal } from "./StatsModal";
import { useDrag } from "@/hooks/useDrag";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { ChevronDown, HelpCircle, ArrowDown, BarChart3, LogIn, CalendarDays } from "lucide-react";
import { lovable } from "@/integrations/lovable/index";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { PastPuzzlePicker } from "./PastPuzzlePicker";

const TOTAL_ROUNDS = 8;

// Helper to save a game result (ignores duplicates via unique index)
async function saveGameResult(userId: string, sportFilter: string | null, correctCount: number) {
  const pct = Math.round((correctCount / TOTAL_ROUNDS) * 100);
  const { error } = await supabase.from("game_results").insert({
    user_id: userId,
    sport_filter: sportFilter || null,
    correct_count: correctCount,
    total_rounds: TOTAL_ROUNDS,
    percentage: pct,
    is_perfect: pct === 100,
  });
  if (error && !error.message?.includes("duplicate")) {
    console.error("Failed to save result:", error);
  }
}

const SPORT_OPTIONS = [
  { label: "Everything", value: null, icon: "🏆" },
  { label: "Football", value: "American Football", icon: "🏈" },
  { label: "Basketball", value: "Basketball", icon: "🏀" },
];

interface PlacedEvent {
  event: SportsEvent;
  status: "correct" | "incorrect" | "pending" | "corrected" | null;
}

interface GameProps {
  sportFilter?: string | null;
  onSportChange?: (sport: string | null) => void;
}

export function Game({ sportFilter, onSportChange }: GameProps) {
  const { user } = useAuth();
  const [showStats, setShowStats] = useState(false);
  const [sportDropdownOpen, setSportDropdownOpen] = useState(false);
  const [gameEvents, setGameEvents] = useState<SportsEvent[]>([]);
  const [placedEvents, setPlacedEvents] = useState<PlacedEvent[]>([]);
  const [currentEventIndex, setCurrentEventIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [activeDropZone, setActiveDropZone] = useState<number | null>(null);
  const [gameComplete, setGameComplete] = useState(false);
  const [isViewingTimeline, setIsViewingTimeline] = useState(false);
  const [pendingPlacement, setPendingPlacement] = useState<{ position: number } | null>(null);
  const [showInstructions, setShowInstructions] = useState(true);
  const [resultHistory, setResultHistory] = useState<boolean[]>([]);
  const [incorrectEventIds, setIncorrectEventIds] = useState<Set<string>>(new Set());
  const [correctEventIds, setCorrectEventIds] = useState<Set<string>>(new Set());
  const [dragSource, setDragSource] = useState<"new" | "pending" | null>(null);
  const [hasDragMoved, setHasDragMoved] = useState(false);
  const [isLoadingEvents, setIsLoadingEvents] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [calendarOpen, setCalendarOpen] = useState(false);
  // Keeps the drop zone visible (frozen) after drop until "Tap to place" is confirmed/cancelled
  const [frozenDropZone, setFrozenDropZone] = useState<number | null>(null);
  
  const [showIdleHint, setShowIdleHint] = useState(false);
  // True between confirm() and the next card actually appearing — prevents the
  // timeline from collapsing upward during the feedback animation window.
  const [isAwaitingNextCard, setIsAwaitingNextCard] = useState(false);
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  const cardRef = useRef<HTMLDivElement>(null);
  const pendingDropZoneRef = useRef<number | null>(null);
  const gameEventsRef = useRef<SportsEvent[]>([]);
  const currentEventIndexRef = useRef(0);
  const pendingResultRef = useRef<{ sportFilter: string | null; correctCount: number } | null>(null);

  // When user signs up mid-session (same page, no redirect), save the pending result
  useEffect(() => {
    if (user && pendingResultRef.current) {
      const { sportFilter: sf, correctCount: cc } = pendingResultRef.current;
      pendingResultRef.current = null;
      saveGameResult(user.id, sf, cc);
    }
  }, [user]);

  // After OAuth redirect: restore game-over state from localStorage
  useEffect(() => {
    if (!user) return;
    const stored = localStorage.getItem("pending_game_signup");
    if (!stored) return;
    
    try {
      const data = JSON.parse(stored);
      localStorage.removeItem("pending_game_signup");
      
      // Save the game result
      saveGameResult(user.id, data.sportFilter, data.correctCount);
      
      // Restore game-over UI
      setCorrectCount(data.correctCount);
      setResultHistory(data.resultHistory || []);
      setGameComplete(true);
      setCurrentEventIndex(TOTAL_ROUNDS);
      setIsLoadingEvents(false);
    } catch {
      localStorage.removeItem("pending_game_signup");
    }
  }, [user]);

  // Keep refs in sync
  useEffect(() => {
    gameEventsRef.current = gameEvents;
  }, [gameEvents]);

  useEffect(() => {
    currentEventIndexRef.current = currentEventIndex;
  }, [currentEventIndex]);

  useEffect(() => {
    pendingDropZoneRef.current = activeDropZone;
  }, [activeDropZone]);

  // Handle dropping a card using refs for latest values
  const handleDropWithRefs = useCallback((position: number) => {
    const events = gameEventsRef.current;
    const eventIndex = currentEventIndexRef.current;
    const event = events[eventIndex];
    if (!event) return;

    setPlacedEvents(prev => {
      const hasPending = prev.some(item => item.status === "pending");
      
      if (hasPending) {
        const filtered = prev.filter((item) => item.event.id !== event.id);
        filtered.splice(position, 0, { event, status: "pending" });
        return filtered;
      } else {
        const newPlaced = [...prev];
        newPlaced.splice(position, 0, { event, status: "pending" });
        return newPlaced;
      }
    });
    setPendingPlacement({ position });
  }, []);

  const handleDragEnd = useCallback((clientY: number) => {
    const dropZone = pendingDropZoneRef.current;

    if (dropZone !== null) {
      // Place in timeline at drop zone — freeze drop zone so it stays visible
      setFrozenDropZone(dropZone);
      handleDropWithRefs(dropZone);
    }
    
    setDragSource(null);
    setActiveDropZone(null);
    setHasDragMoved(false);
  }, [handleDropWithRefs]);

  const { dragState, startDrag } = useDrag({ onDragEnd: handleDragEnd });

  // Detect when mouse has actually moved during drag
  useEffect(() => {
    if (!dragState.isDragging) return;
    if (Math.abs(dragState.offsetY) > 2) {
      setHasDragMoved(true);
    }
  }, [dragState.isDragging, dragState.offsetY]);

  // Start idle hint timer when a new card appears
  useEffect(() => {
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    setShowIdleHint(false);
    
    if (currentEventIndex === 1 && currentEvent && !gameComplete && !pendingPlacement) {
      setShowIdleHint(true);
    }
    
    return () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    };
  }, [currentEventIndex, gameComplete, pendingPlacement]);

  const initializeGame = useCallback(async () => {
    // Reset all state first
    setCorrectCount(1);
    setPendingPlacement(null);
    setResultHistory([]);
    setIsViewingTimeline(false);
    setGameComplete(false);
    setIncorrectEventIds(new Set());
    setCorrectEventIds(new Set());
    setDragSource(null);
    setActiveDropZone(null);
    setIsLoadingEvents(true);
    
    const events = await getDailyChallengeEvents(sportFilter, selectedDate ?? undefined);
    
    setGameEvents(events);
    setIsLoadingEvents(false);
    if (events.length > 0) {
      // First card is placed as the seed (shown with its year)
      setPlacedEvents([{ event: events[0], status: null }]);
      setCurrentEventIndex(1);
    } else {
      setPlacedEvents([]);
      setCurrentEventIndex(0);
    }
  }, [sportFilter, selectedDate]);

  useEffect(() => {
    initializeGame();
  }, [initializeGame]);

  const currentEvent = gameEvents[currentEventIndex];

  // Handle starting to drag the new card
  const handleNewCardDragStart = (e: React.PointerEvent) => {
    if (cardRef.current) {
      setDragSource("new");
      setShowIdleHint(false);
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      startDrag(e, cardRef.current);
    }
  };

  // Handle starting to drag the pending card
  const handlePendingDragStart = (e: React.PointerEvent, element: HTMLElement) => {
    setDragSource("pending");
    startDrag(e, element);
  };

  // Confirm the placement
  const handleConfirm = () => {
    if (!currentEvent || !pendingPlacement) return;

    const confirmedEventId = currentEvent.id;

    const isCorrect = placedEvents.every((item, index) => {
      if (index === 0) return true;
      return item.event.year >= placedEvents[index - 1].event.year;
    });

    // Collapse the frozen drop zone smoothly before resolving
    setFrozenDropZone(null);

    const finalPlaced = placedEvents.map((item) => {
      if (item.event.id === confirmedEventId) {
        return { ...item, status: isCorrect ? "correct" as const : "incorrect" as const };
      }
      return item;
    });

    setPlacedEvents(finalPlaced);
    setPendingPlacement(null);
    setResultHistory((prev) => [...prev, isCorrect]);

    if (isCorrect) {
      setCorrectCount((c) => c + 1);
      setCorrectEventIds(prev => new Set(prev).add(confirmedEventId));
      // Clear the correct status after a brief moment — use functional update to preserve newer state
      setTimeout(() => {
        setPlacedEvents((prev) =>
          prev.map((item) => ({
            ...item,
            status: item.status === "correct" ? null : item.status,
          }))
        );
      }, 1800);
    } else {
      setIncorrectEventIds(prev => new Set(prev).add(confirmedEventId));
      
      setTimeout(() => {
        // Use functional update so we don't clobber any new pending cards
        setPlacedEvents((prev) => {
          const sorted = [...prev].sort((a, b) => a.event.year - b.event.year);
          return sorted.map((item) => ({
            ...item,
            status: item.event.id === confirmedEventId ? "corrected" as const
              : item.status === "pending" ? "pending" as const  // preserve pending
              : null,
          }));
        });
        
        setTimeout(() => {
          setPlacedEvents((prev) =>
            prev.map((item) => ({
              ...item,
              status: item.status === "corrected" ? null : item.status,
            }))
          );
        }, 2000);
      }, 1000);
    }

    const nextIndex = currentEventIndex + 1;
    // Delay revealing the next card so the correct/incorrect feedback animation
    // plays first, instead of jittering simultaneously with the new card appearing.
    // Correct: short delay so the green flash registers before the next card slides in.
    // Incorrect: longer delay so the card first animates into its correct position.
    const revealDelay = isCorrect ? 700 : 1400;
    setTimeout(() => {
      setCurrentEventIndex(nextIndex);
    }, revealDelay);

    if (nextIndex >= gameEvents.length) {
      const delay = isCorrect ? 500 : 2500;
      const finalCorrect = isCorrect ? correctCount + 1 : correctCount;
      // Save result for logged-in users (only for today's puzzle)
      if (user && !selectedDate) {
        saveGameResult(user.id, sportFilter || null, finalCorrect);
      } else if (!user && !selectedDate) {
        // Store pending result so we can save it if user signs up on the game-over screen
        pendingResultRef.current = { sportFilter: sportFilter || null, correctCount: finalCorrect };
      }
      setTimeout(() => setGameComplete(true), delay);
    }
  };

  const handleCancel = () => {
    if (!currentEvent || !pendingPlacement) return;
    const filtered = placedEvents.filter((item) => item.event.id !== currentEvent.id);
    setPlacedEvents(filtered);
    setPendingPlacement(null);
    setFrozenDropZone(null);
  };

  // Show spinner while loading, or error state if no events found
  if (isLoadingEvents || gameEvents.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        {isLoadingEvents ? (
          <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
        ) : (
          <div className="text-center p-8">
            <p className="text-2xl mb-2">😔</p>
            <p className="font-display text-lg font-bold text-foreground mb-1">No challenge today</p>
            <p className="text-muted-foreground text-sm mb-4">Check back tomorrow or try a different sport.</p>
            <button
              onClick={() => window.location.href = '/'}
              className="text-primary text-sm underline underline-offset-2"
            >
              ← Back to home
            </button>
          </div>
        )}
      </div>
    );
  }

  const isGameWon = correctCount === TOTAL_ROUNDS;
  const hasPendingPlacement = pendingPlacement !== null;
  const isDragging = dragState.isDragging;
  const isDraggingNewCard = isDragging && dragSource === "new";
  const cardCollapsed = isDraggingNewCard && hasDragMoved;

  const currentSport = SPORT_OPTIONS.find(s => s.value === sportFilter) || SPORT_OPTIONS[0];

  const handleSportSelect = (sport: typeof SPORT_OPTIONS[0]) => {
    setSportDropdownOpen(false);
    if (sport.value !== sportFilter) {
      onSportChange?.(sport.value);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="container max-w-2xl mx-auto py-2 sm:py-4 px-3 sm:px-4 flex flex-col flex-1">
        {/* Compact header row with everything */}
        <header className="flex items-center justify-between mb-1 sm:mb-2 gap-1">
          {/* Left: Round counter + date/puzzle */}
          <div className="flex items-center gap-0.5 sm:gap-1.5 min-w-0">
            <span className="text-xs sm:text-sm font-semibold text-foreground whitespace-nowrap">
              Round {currentEventIndex}/{TOTAL_ROUNDS}
            </span>
            <span className="text-muted-foreground text-xs sm:text-sm flex-shrink-0">·</span>
            <span className="text-xs sm:text-sm font-semibold text-foreground truncate">
              {selectedDate
                ? new Date(selectedDate + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                : new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </span>
            <span className="text-muted-foreground text-xs sm:text-sm flex-shrink-0">·</span>
            <span className="text-xs sm:text-sm font-semibold text-foreground whitespace-nowrap flex-shrink-0">
              Puzzle #{(() => {
                const origin = new Date('2026-02-12');
                const dateStr = selectedDate || new Date().toLocaleDateString('en-CA', { timeZone: 'America/New_York' });
                const [y, m, d] = dateStr.split('-').map(Number);
                const target = new Date(y, m - 1, d);
                const diff = Math.floor((target.getTime() - origin.getTime()) / (1000 * 60 * 60 * 24));
                return Math.max(1, diff + 1);
              })()}
            </span>
          </div>
          
          {/* Right: Calendar + X + Help + Theme */}
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">

            {/* Calendar - past puzzles (logged in only) */}
            {user && (
              <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                <PopoverTrigger asChild>
                  <button
                    className="p-2 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
                    aria-label="Play past puzzles"
                  >
                    <CalendarDays className="w-5 h-5 text-foreground" />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <PastPuzzlePicker
                    selectedDate={selectedDate}
                    onSelect={(date) => {
                      setSelectedDate(date);
                      setCalendarOpen(false);
                    }}
                  />
                </PopoverContent>
              </Popover>
            )}

            {/* Stats (logged in) or Sign In + X (logged out) */}
            {user ? (
              <button
                onClick={() => setShowStats(true)}
                className="p-2 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
                aria-label="View your stats"
              >
                <BarChart3 className="w-5 h-5 text-foreground" />
              </button>
            ) : (
              <>
                <button
                  onClick={() => {
                    lovable.auth.signInWithOAuth("google", {
                      redirect_uri: window.location.origin + window.location.pathname + window.location.search,
                    });
                  }}
                  className="p-2 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
                  aria-label="Sign in"
                >
                  <LogIn className="w-5 h-5 text-foreground" />
                </button>
                <a
                  href="https://x.com/PlayHoopsRewind"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
                  aria-label="Follow us on X"
                >
                  <svg className="w-5 h-5 text-foreground" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </a>
              </>
            )}

            {/* How to play */}
            <button
              onClick={() => setShowInstructions(true)}
              className="p-2 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
              aria-label="How to play"
            >
              <HelpCircle className="w-5 h-5 text-foreground" />
            </button>

            {/* Theme toggle */}
            <ThemeToggle />
          </div>
        </header>

        {/* Current card to place */}
        <div className="mb-2 sm:mb-3">
        {currentEvent && !gameComplete ? (
            <>
              <div
                style={{
                  // Use max-height (animatable) instead of height: auto/0 (not animatable),
                  // otherwise the source slot snaps shut instantly on drag-start, causing
                  // the timeline below to visibly jump.
                  maxHeight: cardCollapsed || hasPendingPlacement ? 0 : 500,
                  // Only clip during the collapse animation; otherwise allow the
                  // breathing card (translateY(-4px) scale(1.02)) to render freely
                  // without being cut off by the wrapper's edges.
                  overflow: cardCollapsed || hasPendingPlacement ? 'hidden' : 'visible',
                  opacity: cardCollapsed || hasPendingPlacement ? 0 : 1,
                  transition: 'max-height 350ms cubic-bezier(0.25, 0.1, 0.25, 1), opacity 200ms ease-out',
                }}
              >
                <div key={currentEvent.id} className="animate-fade-in-up">
                  <div className="flex items-center gap-2 sm:gap-3 mb-1.5 sm:mb-3">
                    <div className="flex items-center gap-1 shrink-0">
                      <p className="text-[11px] sm:text-sm text-muted-foreground font-bold uppercase tracking-wider">
                        Place this event in the timeline
                      </p>
                      <ArrowDown className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground" />
                    </div>
                    <div className="flex items-center gap-1.5 sm:gap-2 ml-auto flex-1 justify-end">
                      {Array.from({ length: TOTAL_ROUNDS }, (_, i) => {
                        let bgColor = "bg-muted";
                        if (i === 0) {
                          bgColor = "bg-primary";
                        } else if (i <= resultHistory.length) {
                          const isCorrect = resultHistory[i - 1];
                          bgColor = isCorrect ? "bg-success" : "bg-destructive";
                        }
                        return (
                          <div
                            key={i}
                            className={`h-2.5 sm:h-3 flex-1 max-w-8 sm:max-w-10 rounded-full transition-colors duration-500 ${bgColor}`}
                          />
                        );
                      })}
                    </div>
                  </div>
                  <div
                    ref={cardRef}
                    onPointerDown={handleNewCardDragStart}
                    className={`cursor-grab active:cursor-grabbing select-none touch-none ${showIdleHint ? 'game-card-breathe' : ''}`}
                  >
                    <EventCard
                      event={currentEvent}
                      isDragging={false}
                    />
                  </div>
                  {showIdleHint && (
                    <div className="flex items-center gap-1.5 justify-center mt-2 pb-2 drag-hint-arrow">
                      <ArrowDown className="w-4 h-4 text-accent" />
                      <span className="text-xs sm:text-sm font-semibold text-accent">
                        Drag this card into the timeline
                      </span>
                      <ArrowDown className="w-4 h-4 text-accent" />
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : null}
        </div>

        {/* Timeline */}
        <div className="mb-2 sm:mb-4 pb-20 sm:pb-0 relative flex-1 flex flex-col">
          <Timeline
            placedEvents={placedEvents}
            activeDropZone={isDragging && hasDragMoved ? activeDropZone : frozenDropZone}
            isDragging={isDragging && hasDragMoved}
            incorrectEventIds={incorrectEventIds}
            correctEventIds={correctEventIds}
            dragY={isDragging && hasDragMoved && dragState.cardRect
              ? (() => {
                  const goingDown = dragState.currentY >= dragState.prevY;
                  const cardVisualTop = dragState.cardRect.top + (dragState.currentY - dragState.startY);
                  return goingDown
                    ? cardVisualTop + dragState.cardRect.height  // bottom edge when going down
                    : cardVisualTop;                             // top edge when going up
                })()
              : null}
            isDraggingDown={dragState.currentY >= dragState.prevY}
            draggingCardHeight={dragState.cardRect?.height ?? 0}
            onDrop={handleDropWithRefs}
            onDropZoneChange={setActiveDropZone}
            onConfirm={hasPendingPlacement ? handleConfirm : undefined}
            onCancel={hasPendingPlacement ? handleCancel : undefined}
            onPendingDragStart={handlePendingDragStart}
            onPendingDragEnd={() => setDragSource(null)}
            isViewingTimeline={isViewingTimeline}
            sportFilter={sportFilter}
            onRetry={initializeGame}
            onSportChange={onSportChange}
          />
        </div>

        {/* Drag overlay - the floating card that follows cursor */}
        {currentEvent && isDragging && (
          <DragOverlay event={currentEvent} dragState={dragState} />
        )}

        {/* Game Complete Modal */}
        {gameComplete && (
          <GameComplete
            won={isGameWon}
            correctCount={correctCount}
            totalRounds={TOTAL_ROUNDS}
            resultHistory={resultHistory}
            sportFilter={sportFilter}
            onViewTimeline={() => { setGameComplete(false); setIsViewingTimeline(true); }}
            onPlayPastPuzzle={() => { setCalendarOpen(true); setGameComplete(false); }}
          />
        )}

        {/* Old banner removed — CTA is now inside the Timeline */}

        {/* Instructions Modal */}
        {showInstructions && (
          <InstructionsModal onClose={() => setShowInstructions(false)} />
        )}

        {/* Stats Modal */}
        <StatsModal open={showStats} onClose={() => setShowStats(false)} />
      </div>
    </div>
  );
}
