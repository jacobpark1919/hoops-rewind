import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";

const SPORT_OPTIONS = [
  { label: "Everything", value: null, icon: "🏆" },
  { label: "Football", value: "American Football", icon: "🏈" },
  { label: "Basketball", value: "Basketball", icon: "🏀" },
  { label: "Baseball", value: "Baseball", icon: "⚾" },
];

export default function Home() {
  const navigate = useNavigate();
  const [selectedSport, setSelectedSport] = useState(SPORT_OPTIONS[0]);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleStart = () => {
    const params = selectedSport.value ? `?sport=${encodeURIComponent(selectedSport.value)}` : "";
    navigate(`/play${params}`);
  };

  const handleSportSelect = (sport: typeof SPORT_OPTIONS[0]) => {
    setSelectedSport(sport);
    setDropdownOpen(false);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center relative overflow-hidden">
      {/* Background decorative years */}
      <div className="absolute inset-0 pointer-events-none select-none overflow-hidden">
        <span className="absolute top-16 left-8 text-[12rem] font-display font-bold text-muted-foreground/15 leading-none">
          1985
        </span>
        <span className="absolute top-8 right-12 text-[12rem] font-display font-bold text-muted-foreground/15 leading-none">
          1972
        </span>
        <span className="absolute bottom-16 left-1/4 text-[12rem] font-display font-bold text-muted-foreground/15 leading-none">
          2008
        </span>
        <span className="absolute bottom-8 right-8 text-[12rem] font-display font-bold text-muted-foreground/15 leading-none">
          1996
        </span>
      </div>

      {/* Central card */}
      <div className="relative z-10 bg-card border border-border rounded-2xl shadow-xl p-8 max-w-md w-full mx-4 text-center">
        {/* Icon */}
        <div className="flex justify-center mb-4">
          <div className="text-5xl">🏆</div>
        </div>

        {/* Title */}
        <h1 className="font-display text-3xl font-bold text-foreground mb-1">
          Sports Flashback
        </h1>
        
        {/* Date */}
        <p className="text-muted-foreground text-sm mb-4">
          {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
        </p>

        {/* Description */}
        <p className="text-foreground/80 mb-6">
          Can you place 8 sports events in chronological order?
        </p>

        {/* Sport selector dropdown */}
        <div className="relative mb-6">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="w-full flex items-center justify-between gap-2 px-4 py-3 bg-secondary/50 border border-border rounded-xl text-foreground font-medium hover:bg-secondary transition-colors"
          >
            <div className="flex items-center gap-3">
              <span className="text-xl">{selectedSport.icon}</span>
              <span>{selectedSport.label}</span>
            </div>
            <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {dropdownOpen && (
            <div className="absolute left-0 right-0 mt-2 bg-card border border-border rounded-xl shadow-xl z-50 overflow-hidden">
              {SPORT_OPTIONS.map((sport) => (
                <button
                  key={sport.label}
                  onClick={() => handleSportSelect(sport)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/50 ${
                    sport.value === selectedSport.value ? 'bg-primary/10' : ''
                  }`}
                >
                  <span className="text-xl">{sport.icon}</span>
                  <span className="font-medium text-foreground">{sport.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Start button */}
        <Button onClick={handleStart} size="lg" className="w-full text-base">
          Start Game →
        </Button>
      </div>
    </div>
  );
}
