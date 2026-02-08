import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

const SPORT_OPTIONS = [
  { label: "Everything", value: null, icon: "🏆" },
  { label: "Football", value: "American Football", icon: "🏈" },
  { label: "Basketball", value: "Basketball", icon: "🏀" },
  { label: "Baseball", value: "Baseball", icon: "⚾" },
];

const FLOATING_YEARS = [
  { year: "1985", className: "top-[10%] left-[5%] animate-float-1" },
  { year: "1972", className: "top-[5%] right-[8%] animate-float-2" },
  { year: "2008", className: "bottom-[15%] left-[15%] animate-float-3" },
  { year: "1996", className: "bottom-[10%] right-[5%] animate-float-4" },
  { year: "1954", className: "top-[40%] left-[2%] animate-float-2" },
  { year: "2019", className: "top-[35%] right-[3%] animate-float-1" },
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
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
      {/* Header with logo and theme toggle */}
      <header className="flex items-center justify-between p-4 md:p-6 relative z-20">
        <h1 className="font-display text-xl md:text-2xl font-extrabold tracking-tight">
          <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
            Sports
          </span>
          <span className="text-foreground ml-1">Flashback</span>
        </h1>
        <ThemeToggle />
      </header>

      {/* Background decorative floating years */}
      <div className="absolute inset-0 pointer-events-none select-none overflow-hidden">
        {FLOATING_YEARS.map(({ year, className }) => (
          <span
            key={year + className}
            className={`absolute text-[8rem] md:text-[12rem] font-display font-bold text-muted-foreground/10 leading-none ${className}`}
          >
            {year}
          </span>
        ))}
      </div>

      {/* Main content centered */}
      <div className="flex-1 flex items-center justify-center">
        {/* Central card */}
        <div className="relative z-10 bg-card border border-border rounded-2xl shadow-xl p-8 max-w-md w-full mx-4 text-center">
          {/* Icon */}
          <div className="flex justify-center mb-4">
            <div className="text-5xl">🏆</div>
          </div>

          {/* Title */}
          <h2 className="font-display text-3xl font-bold text-foreground mb-1">
            Sports Flashback
          </h2>
          
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
    </div>
  );
}
