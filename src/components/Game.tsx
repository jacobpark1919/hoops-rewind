import { useState, useCallback, useEffect, useRef } from "react";
import { SportsEvent, getRandomEvents } from "@/data/sportsEvents";
import { EventCard } from "./EventCard";
import { Timeline } from "./Timeline";
import { GameHeader } from "./GameHeader";
import { GameComplete } from "./GameComplete";
import { InstructionsModal } from "./InstructionsModal";
import { DragOverlay } from "./DragOverlay";
import { useDrag } from "@/hooks/useDrag";
import { ChevronDown } from "lucide-react";

const TOTAL_ROUNDS = 8;
const MAX_LIVES = 3;

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
  const [lives, setLives] = useState(MAX_LIVES);
  const [correctCount, setCorrectCount] = useState(0);
  const [activeDropZone, setActiveDropZone] = useState<number | null>(null);
  const [gameComplete, setGameComplete] = useState(false);
  const [pendingPlacement, setPendingPlacement] = useState<{ position: number } | null>(null);
  const [showInstructions, setShowInstructions] = useState(true);
  const [resultHistory, setResultHistory] = useState<boolean[]>([]);
  const [dragSource, setDragSource] = useState<"new" | "pending" | null>(null);
  
  const cardRef = useRef<HTMLDivElement>(null);
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
      handleDropWithRefs(dropZone);
    }
    setDragSource(null);
    setActiveDropZone(null);
  }, [handleDropWithRefs]);

  const { dragState, startDrag } = useDrag({ onDragEnd: handleDragEnd });

  const initializeGame = useCallback(async () => {
    const events = await getRandomEvents(TOTAL_ROUNDS, sportFilter);
    events.sort((a, b) => a.year - b.year);
    
    setGameEvents(events);
    if (events.length > 0) {
      setPlacedEvents([{ event: events[0], status: null }]);
      setCurrentEventIndex(1);
    }
    setLives(MAX_LIVES);
    setCorrectCount(1);
    setGameComplete(false);
    setPendingPlacement(null);
    setResultHistory([]);
    setDragSource(null);
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
    } else {
      setLives((l) => l - 1);
      
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
    const newLives = isCorrect ? lives : lives - 1;

    if (newLives <= 0) {
      setTimeout(() => setGameComplete(true), 1200);
    } else if (nextIndex >= gameEvents.length) {
      setTimeout(() => setGameComplete(true), 500);
    } else {
      setCurrentEventIndex(nextIndex);
    }
  };

  const handleCancel = () => {
    if (!currentEvent || !pendingPlacement) return;
    const filtered = placedEvents.filter((item) => item.event.id !== currentEvent.id);
    setPlacedEvents(filtered);
    setPendingPlacement(null);
  };

  if (gameEvents.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const isGameWon = correctCount === TOTAL_ROUNDS;
  const hasPendingPlacement = pendingPlacement !== null;
  const isDragging = dragState.isDragging;
  const isDraggingNewCard = isDragging && dragSource === "new";

  const currentSport = SPORT_OPTIONS.find(s => s.value === sportFilter) || SPORT_OPTIONS[0];

  const handleSportSelect = (sport: typeof SPORT_OPTIONS[0]) => {
    setSportDropdownOpen(false);
    if (sport.value !== sportFilter) {
      onSportChange?.(sport.value);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-2xl mx-auto py-6 px-4">
        {/* Sport dropdown */}
        <div className="flex justify-end mb-4">
          <div className="relative">
            <button
              onClick={() => setSportDropdownOpen(!sportDropdownOpen)}
              className="flex items-center gap-2 text-sm font-medium text-primary px-3 py-1.5 bg-primary/10 rounded-full hover:bg-primary/20 transition-colors"
            >
              <span>{currentSport.icon}</span>
              <span>{currentSport.label}</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${sportDropdownOpen ? 'rotate-180' : ''}`} />
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
        </div>

        <GameHeader
          lives={lives}
          maxLives={MAX_LIVES}
          currentRound={currentEventIndex}
          totalRounds={TOTAL_ROUNDS}
        />

        {/* Current card to place - only render when needed */}
        {currentEvent && !gameComplete && !hasPendingPlacement && (
          <div 
            className={`mb-8 transition-all duration-300 ease-out overflow-hidden ${
              isDraggingNewCard ? "h-0 opacity-0 mb-0" : "min-h-[120px]"
            }`}
          >
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
        )}

        {/* Timeline */}
        <div className="mb-8">
          <p className="text-sm text-muted-foreground mb-3 font-medium uppercase tracking-wider">
            Timeline (Earliest to Latest)
          </p>
          <Timeline
            placedEvents={placedEvents}
            activeDropZone={activeDropZone}
            isDragging={isDragging}
            dragY={isDragging ? dragState.currentY : null}
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
            livesRemaining={lives}
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
