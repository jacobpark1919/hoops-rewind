import { useState, useCallback, useEffect, useRef } from "react";
import { SportsEvent, getDailyChallengeEvents } from "@/data/sportsEvents";
import { EventCard } from "./EventCard";
import { Timeline } from "./Timeline";
import { GameComplete } from "./GameComplete";
import { InstructionsModal } from "./InstructionsModal";
import { DragOverlay } from "./DragOverlay";
import { ThemeToggle } from "./ThemeToggle";
import { useDrag } from "@/hooks/useDrag";
import { ChevronDown, Home, HelpCircle, ArrowDown } from "lucide-react";

const TOTAL_ROUNDS = 8;

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
  // Keeps the drop zone visible (frozen) after drop until "Tap to place" is confirmed/cancelled
  const [frozenDropZone, setFrozenDropZone] = useState<number | null>(null);
  const [collapsedCardAreaHeight, setCollapsedCardAreaHeight] = useState(0);
  
  const [showIdleHint, setShowIdleHint] = useState(false);
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  const cardRef = useRef<HTMLDivElement>(null);
  const topSectionRef = useRef<HTMLDivElement>(null);
  const pendingDropZoneRef = useRef<number | null>(null);
  const gameEventsRef = useRef<SportsEvent[]>([]);
  const currentEventIndexRef = useRef(0);

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
      idleTimerRef.current = setTimeout(() => {
        setShowIdleHint(true);
      }, 10000);
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
    
    const events = await getDailyChallengeEvents(sportFilter);
    
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
  }, [sportFilter]);

  useEffect(() => {
    initializeGame();
  }, [initializeGame]);

  const currentEvent = gameEvents[currentEventIndex];

  // Handle starting to drag the new card
  const handleNewCardDragStart = (e: React.PointerEvent) => {
    if (cardRef.current) {
      if (topSectionRef.current) {
        setCollapsedCardAreaHeight(topSectionRef.current.offsetHeight);
      }
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

    const isCorrect = placedEvents.every((item, index) => {
      if (index === 0) return true;
      return item.event.year >= placedEvents[index - 1].event.year;
    });

    // Collapse the frozen drop zone smoothly before resolving
    setFrozenDropZone(null);

    const finalPlaced = placedEvents.map((item) => {
      if (item.event.id === currentEvent.id) {
        return { ...item, status: isCorrect ? "correct" as const : "incorrect" as const };
      }
      return item;
    });

    setPlacedEvents(finalPlaced);
    setPendingPlacement(null);
    setResultHistory((prev) => [...prev, isCorrect]);

    if (isCorrect) {
      setCorrectCount((c) => c + 1);
      setCorrectEventIds(prev => new Set(prev).add(currentEvent.id));
      // Clear the correct status after a brief moment
      setTimeout(() => {
        setPlacedEvents((prev) =>
          prev.map((item) => ({
            ...item,
            status: item.status === "correct" ? null : item.status,
          }))
        );
      }, 1800);
    } else {
      setIncorrectEventIds(prev => new Set(prev).add(currentEvent.id));
      
      setTimeout(() => {
        const sorted = [...finalPlaced].sort((a, b) => a.event.year - b.event.year);
        const corrected = sorted.map((item) => ({
          ...item,
          status: item.event.id === currentEvent.id ? "corrected" as const : null,
        }));
        setPlacedEvents(corrected);
        
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
    setCurrentEventIndex(nextIndex); // always advance so round counter hits 8/8 and ghost card disappears

    if (nextIndex >= gameEvents.length) {
      const delay = isCorrect ? 500 : 2500;
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
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
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
          {/* Left: Home button + Round counter + date/puzzle */}
          <div className="flex items-center gap-1 sm:gap-3 min-w-0">
            <button
              onClick={() => window.location.href = '/'}
              className="p-1 sm:p-1.5 rounded-full hover:bg-muted transition-colors flex-shrink-0"
              aria-label="Back to home"
            >
              <Home className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-muted-foreground hover:text-foreground" />
            </button>
            <div className="flex items-center gap-0.5 sm:gap-1.5 min-w-0">
              <span className="text-xs sm:text-sm font-semibold text-foreground whitespace-nowrap">
                Round {currentEventIndex}/{TOTAL_ROUNDS}
              </span>
              <span className="text-muted-foreground text-xs sm:text-sm flex-shrink-0">·</span>
              <span className="text-xs sm:text-sm font-semibold text-foreground truncate">
                {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </span>
              <span className="text-muted-foreground text-xs sm:text-sm flex-shrink-0">·</span>
              <span className="text-xs sm:text-sm font-semibold text-foreground whitespace-nowrap flex-shrink-0">
                Puzzle #{(() => {
                  const origin = new Date('2026-02-12');
                  const today = new Date();
                  const todayLocal = new Date(today.getFullYear(), today.getMonth(), today.getDate());
                  const diff = Math.floor((todayLocal.getTime() - origin.getTime()) / (1000 * 60 * 60 * 24));
                  return Math.max(1, diff + 1);
                })()}
              </span>
            </div>
          </div>
          
          {/* Right: Sport selector + Theme toggle */}
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            {/* Sport dropdown */}
            <div className="relative">
              <button
                onClick={() => setSportDropdownOpen(!sportDropdownOpen)}
                className="flex items-center gap-1 sm:gap-1.5 text-xs sm:text-sm font-semibold text-foreground px-2 sm:px-2.5 py-1 bg-secondary/50 rounded-lg hover:bg-secondary transition-colors"
              >
                <span>{currentSport.icon}</span>
                <span className="hidden sm:inline">{currentSport.label}</span>
                <ChevronDown className={`w-3 h-3 sm:w-3.5 sm:h-3.5 transition-transform ${sportDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {sportDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-xl shadow-xl z-50 overflow-hidden">
                  {SPORT_OPTIONS.map((sport) => (
                    <button
                      key={sport.label}
                      onClick={() => handleSportSelect(sport)}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/50 ${
                        sport.value === sportFilter ? 'bg-primary/10' : ''
                      }`}
                    >
                      <span className="text-lg">{sport.icon}</span>
                      <span className="font-medium text-foreground">{sport.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

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
                className="transition-all duration-300 ease-out"
                style={{
                  minHeight: cardCollapsed || hasPendingPlacement ? 0 : undefined,
                  height: cardCollapsed || hasPendingPlacement ? 0 : 'auto',
                  overflow: cardCollapsed || hasPendingPlacement ? 'hidden' : 'visible',
                  opacity: cardCollapsed || hasPendingPlacement ? 0 : 1,
                }}
              >
                <div key={currentEvent.id} className="animate-fade-in-up">
                  <p className="text-[11px] sm:text-sm text-muted-foreground mb-1.5 sm:mb-3 font-bold uppercase tracking-wider">
                    Place this event in the timeline
                  </p>
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
                    <div className="flex items-center gap-1.5 justify-center mt-2 drag-hint-arrow">
                      <ArrowDown className="w-4 h-4 text-primary" />
                      <span className="text-xs sm:text-sm font-semibold text-primary">
                        Drag this card into the timeline
                      </span>
                      <ArrowDown className="w-4 h-4 text-primary" />
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : null}
        </div>

        {/* Timeline */}
        <div className="mb-2 sm:mb-4 relative flex-1 flex flex-col">
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
          />
        )}

        {/* Old banner removed — CTA is now inside the Timeline */}

        {/* Instructions Modal */}
        {showInstructions && (
          <InstructionsModal onClose={() => setShowInstructions(false)} />
        )}
      </div>
    </div>
  );
}
