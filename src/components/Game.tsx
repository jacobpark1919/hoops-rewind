import { useState, useCallback, useEffect } from "react";
import { SportsEvent, getRandomEvents } from "@/data/sportsEvents";
import { EventCard } from "./EventCard";
import { Timeline } from "./Timeline";
import { GameHeader } from "./GameHeader";
import { GameComplete } from "./GameComplete";

const TOTAL_ROUNDS = 8;
const MAX_LIVES = 3;

interface PlacedEvent {
  event: SportsEvent;
  status: "correct" | "incorrect" | "pending" | null;
}

export function Game() {
  const [gameEvents, setGameEvents] = useState<SportsEvent[]>([]);
  const [placedEvents, setPlacedEvents] = useState<PlacedEvent[]>([]);
  const [currentEventIndex, setCurrentEventIndex] = useState(0);
  const [lives, setLives] = useState(MAX_LIVES);
  const [correctCount, setCorrectCount] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [activeDropZone, setActiveDropZone] = useState<number | null>(null);
  const [gameComplete, setGameComplete] = useState(false);
  const [pendingPlacement, setPendingPlacement] = useState<{ position: number } | null>(null);

  const initializeGame = useCallback(async () => {
    const events = await getRandomEvents(TOTAL_ROUNDS);
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
  }, []);

  useEffect(() => {
    initializeGame();
  }, [initializeGame]);

  const currentEvent = gameEvents[currentEventIndex];

  // Handle dropping a card - now just sets pending state
  const handleDrop = (position: number) => {
    if (!currentEvent || pendingPlacement) return;

    setIsDragging(false);
    setActiveDropZone(null);

    // Insert the event at position with pending status
    const newPlaced = [...placedEvents];
    newPlaced.splice(position, 0, { event: currentEvent, status: "pending" });
    setPlacedEvents(newPlaced);
    setPendingPlacement({ position });
  };

  // Confirm the placement
  const handleConfirm = () => {
    if (!currentEvent || !pendingPlacement) return;

    // Check if placement is correct by verifying chronological order
    const isCorrect = placedEvents.every((item, index) => {
      if (index === 0) return true;
      return item.event.year >= placedEvents[index - 1].event.year;
    });

    // Update status of the pending card
    const finalPlaced = placedEvents.map((item) => {
      if (item.event.id === currentEvent.id) {
        return { ...item, status: isCorrect ? "correct" as const : "incorrect" as const };
      }
      return item;
    });

    setPlacedEvents(finalPlaced);
    setPendingPlacement(null);

    if (isCorrect) {
      setCorrectCount((c) => c + 1);
    } else {
      setLives((l) => l - 1);
      
      // Shake and then reorder after delay
      setTimeout(() => {
        const sorted = [...finalPlaced].sort((a, b) => a.event.year - b.event.year);
        const corrected = sorted.map((item) => ({
          ...item,
          status: null,
        }));
        setPlacedEvents(corrected);
      }, 1000);
    }

    // Check game end conditions
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

  // Cancel the placement
  const handleCancel = () => {
    if (!currentEvent || !pendingPlacement) return;

    // Remove the pending card from placed events
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

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-2xl mx-auto py-6 px-4">
        <GameHeader
          lives={lives}
          maxLives={MAX_LIVES}
          currentRound={currentEventIndex}
          totalRounds={TOTAL_ROUNDS}
        />

        {/* Current card to place - fixed height container to prevent layout shift */}
        <div className="mb-8 min-h-[120px]">
          {currentEvent && !gameComplete && !hasPendingPlacement && (
            <div key={currentEvent.id} className="animate-fade-in-up">
              <p className="text-sm text-muted-foreground mb-3 font-medium uppercase tracking-wider">
                Place this event in the timeline
              </p>
              <EventCard
                event={currentEvent}
                isDragging={isDragging}
                onDragStart={() => setIsDragging(true)}
                onDragEnd={() => {
                  setIsDragging(false);
                  setActiveDropZone(null);
                }}
              />
            </div>
          )}
        </div>

        {/* Timeline */}
        <div className="mb-8">
          <p className="text-sm text-muted-foreground mb-3 font-medium uppercase tracking-wider">
            Timeline (Earliest to Latest)
          </p>
          <Timeline
            placedEvents={placedEvents}
            activeDropZone={activeDropZone}
            isDragging={isDragging && !hasPendingPlacement}
            onDrop={handleDrop}
            onDragOver={setActiveDropZone}
            onDragLeave={() => setActiveDropZone(null)}
            onConfirm={hasPendingPlacement ? handleConfirm : undefined}
            onCancel={hasPendingPlacement ? handleCancel : undefined}
          />
        </div>

        {/* Game Complete Modal */}
        {gameComplete && (
          <GameComplete
            won={isGameWon}
            correctCount={correctCount}
            totalRounds={TOTAL_ROUNDS}
            livesRemaining={lives}
            onPlayAgain={initializeGame}
          />
        )}
      </div>
    </div>
  );
}
