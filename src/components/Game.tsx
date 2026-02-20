import { useState, useCallback, useEffect, useRef } from "react";
import { SportsEvent, getDailyChallengeEvents } from "@/data/sportsEvents";
import { EventCard } from "./EventCard";
import { Timeline } from "./Timeline";
import { GameComplete } from "./GameComplete";
import { InstructionsModal } from "./InstructionsModal";
import { DragOverlay } from "./DragOverlay";
import { ThemeToggle } from "./ThemeToggle";
import { useDrag } from "@/hooks/useDrag";
import { ChevronDown, Home } from "lucide-react";

const TOTAL_ROUNDS = 8;

const SPORT_OPTIONS = [
  { label: "Everything", value: null, icon: "🏆" },
  { label: "Football", value: "American Football", icon: "🏈" },
  { label: "Basketball", value: "Basketball", icon: "🏀" },
  { label: "Baseball", value: "Baseball", icon: "⚾" },
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
  const [pendingPlacement, setPendingPlacement] = useState<{ position: number } | null>(null);
  const [showInstructions, setShowInstructions] = useState(true);
  const [resultHistory, setResultHistory] = useState<boolean[]>([]);
  const [incorrectEventIds, setIncorrectEventIds] = useState<Set<string>>(new Set());
  const [dragSource, setDragSource] = useState<"new" | "pending" | null>(null);
  const [hoveringCancelZone, setHoveringCancelZone] = useState(false);
  const [hasDragMoved, setHasDragMoved] = useState(false);
  const [hasLeftCancelZone, setHasLeftCancelZone] = useState(false);
  const [isLoadingEvents, setIsLoadingEvents] = useState(true);
  // Keeps the drop zone visible (frozen) after drop until "Tap to place" is confirmed/cancelled
  const [frozenDropZone, setFrozenDropZone] = useState<number | null>(null);
  
  const cardRef = useRef<HTMLDivElement>(null);
  const cancelZoneRef = useRef<HTMLDivElement>(null);
  const pendingDropZoneRef = useRef<number | null>(null);
  const gameEventsRef = useRef<SportsEvent[]>([]);
  const currentEventIndexRef = useRef(0);
  const hoveringCancelZoneRef = useRef(false);

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

  useEffect(() => {
    hoveringCancelZoneRef.current = hoveringCancelZone;
  }, [hoveringCancelZone]);

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
    const cancellingPlacement = hoveringCancelZoneRef.current;
    
    // If hovering over cancel zone, remove from timeline
    if (cancellingPlacement) {
      setPlacedEvents(prev => prev.filter(item => item.status !== "pending"));
      setPendingPlacement(null);
      setFrozenDropZone(null);
    } else if (dropZone !== null) {
      // Place in timeline at drop zone — freeze drop zone so it stays visible
      setFrozenDropZone(dropZone);
      handleDropWithRefs(dropZone);
    }
    
    setDragSource(null);
    setActiveDropZone(null);
    setHoveringCancelZone(false);
    setHasDragMoved(false);
    setHasLeftCancelZone(false);
  }, [handleDropWithRefs]);

  const { dragState, startDrag } = useDrag({ onDragEnd: handleDragEnd });

  // Detect when mouse has actually moved during drag
  useEffect(() => {
    if (!dragState.isDragging) return;
    if (Math.abs(dragState.offsetY) > 2) {
      setHasDragMoved(true);
    }
  }, [dragState.isDragging, dragState.offsetY]);

  // Check if dragging over cancel zone — only after card has left it first
  useEffect(() => {
    if (!dragState.isDragging || dragState.currentY === null || !cancelZoneRef.current) {
      setHoveringCancelZone(false);
      return;
    }
    
    const rect = cancelZoneRef.current.getBoundingClientRect();
    const isOver = dragState.currentY >= rect.top - 20 && dragState.currentY <= rect.bottom + 20;
    
    if (!isOver && !hasLeftCancelZone) {
      setHasLeftCancelZone(true);
    }
    
    setHoveringCancelZone(isOver && hasLeftCancelZone);
  }, [dragState.isDragging, dragState.currentY, hasLeftCancelZone]);

  const initializeGame = useCallback(async () => {
    // Reset all state first
    setCorrectCount(1);
    setPendingPlacement(null);
    setResultHistory([]);
    setIncorrectEventIds(new Set());
    setDragSource(null);
    setActiveDropZone(null);
    setHoveringCancelZone(false);
    setIsLoadingEvents(true);
    
    const events = await getDailyChallengeEvents(sportFilter);
    // Shuffle events so they're served in random order
    for (let i = events.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [events[i], events[j]] = [events[j], events[i]];
    }
    
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
  const handleNewCardDragStart = (e: React.MouseEvent) => {
    if (cardRef.current) {
      setDragSource("new");
      startDrag(e, cardRef.current);
    }
  };

  // Handle starting to drag the pending card
  const handlePendingDragStart = (e: React.MouseEvent, element: HTMLElement) => {
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
      // Clear the correct status after a brief moment
      setTimeout(() => {
        setPlacedEvents((prev) =>
          prev.map((item) => ({
            ...item,
            status: item.status === "correct" ? null : item.status,
          }))
        );
      }, 800);
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

    if (nextIndex >= gameEvents.length) {
      const delay = isCorrect ? 500 : 2500;
      setTimeout(() => setGameComplete(true), delay);
    } else {
      setCurrentEventIndex(nextIndex);
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
    <div className="min-h-screen bg-background">
      <div className="container max-w-2xl mx-auto py-4 px-4">
        {/* Compact header row with everything */}
        <header className="flex items-center justify-between mb-2">
          {/* Left: Home button + Round counter */}
           <div className="flex items-center gap-3">
             <button
               onClick={() => window.location.href = '/'}
               className="p-1.5 rounded-full hover:bg-muted transition-colors"
               aria-label="Back to home"
             >
               <Home className="w-5 h-5 text-muted-foreground hover:text-foreground" />
             </button>
             <div className="flex items-center gap-2">
               <span className="text-xs text-muted-foreground uppercase tracking-wider">Round</span>
               <span className="font-display text-lg font-bold text-foreground">
                 {currentEventIndex}/{TOTAL_ROUNDS}
               </span>
             </div>
             <span className="text-[10px] text-muted-foreground uppercase tracking-wider hidden sm:inline">
               {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
             </span>
           </div>
          
          {/* Right: Sport selector, Lives, Theme toggle */}
          <div className="flex items-center gap-3">
            {/* Sport dropdown */}
            <div className="relative">
              <button
                onClick={() => setSportDropdownOpen(!sportDropdownOpen)}
                className="flex items-center gap-1.5 text-sm font-medium text-primary px-2.5 py-1 bg-primary/10 rounded-full hover:bg-primary/20 transition-colors"
              >
                <span>{currentSport.icon}</span>
                <span className="hidden sm:inline">{currentSport.label}</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${sportDropdownOpen ? 'rotate-180' : ''}`} />
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

            {/* Theme toggle */}
            <ThemeToggle />
          </div>
        </header>

        {/* Current card to place OR cancel drop zone */}
        <div 
          ref={cancelZoneRef}
          className="mb-3"
        >
        {currentEvent && !gameComplete ? (
            <>
              {!cardCollapsed && !hasPendingPlacement ? (
                <div className="min-h-[120px] transition-all duration-300 ease-out">
                  <div key={currentEvent.id} className="animate-fade-in-up">
                    <p className="text-sm text-muted-foreground mb-3 font-medium uppercase tracking-wider">
                      Place this event in the timeline
                    </p>
                    <div
                      ref={cardRef}
                      onMouseDown={handleNewCardDragStart}
                      className="cursor-grab active:cursor-grabbing select-none"
                    >
                      <EventCard
                        event={currentEvent}
                        isDragging={false}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                // Keep identical DOM structure whether dragging (collapsed) or pending placement
                // so the layout doesn't shift when the card is dropped.
                <div 
                  className={`border-2 rounded-xl flex items-center justify-center ${
                    dragState.isDragging && !hasPendingPlacement && hoveringCancelZone 
                      ? "h-24 border-dashed border-primary bg-primary/10 transition-all duration-300 ease-out" 
                      : "h-0 border-transparent overflow-hidden"
                  }`}
                >
                  {dragState.isDragging && !hasPendingPlacement && (
                    <div className={`transition-all duration-200 ease-out ${hoveringCancelZone ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}>
                      <span className="text-primary text-sm font-medium">Drop here to cancel</span>
                    </div>
                  )}
                </div>
              )}
            </>
          ) : null}
        </div>

        {/* Timeline */}
        <div className="mb-4 relative">
          <p
            className="text-xs text-muted-foreground font-medium uppercase tracking-wider transition-all duration-300 ease-out"
            style={{
              marginBottom: (isDragging && hasDragMoved) || hasPendingPlacement ? 0 : 8,
              transform: (isDragging && hasDragMoved) || hasPendingPlacement ? 'translateY(-8px)' : 'translateY(0)',
            }}
          >
            Timeline (Earliest → Latest)
          </p>
          <Timeline
            placedEvents={placedEvents}
            activeDropZone={isDragging && hasDragMoved ? activeDropZone : frozenDropZone}
            isDragging={isDragging && hasDragMoved}
            incorrectEventIds={incorrectEventIds}
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
            onPlayAgain={initializeGame}
          />
        )}

        {/* Instructions Modal */}
        {showInstructions && (
          <InstructionsModal onClose={() => setShowInstructions(false)} />
        )}
      </div>
    </div>
  );
}
