import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { FloatingYears } from "@/components/FloatingYears";
import { DarkModeHint } from "@/components/DarkModeHint";

const SPORT_OPTIONS = [
  { label: "Everything", value: null, icon: "🏆" },
  { label: "Football", value: "American Football", icon: "🏈" },
  { label: "Basketball", value: "Basketball", icon: "🏀" },
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
          <span className="text-foreground ml-1">Vault</span>
        </h1>
        <ThemeToggle />
      </header>

      {/* Dark mode hint */}
      <DarkModeHint />

      {/* Background decorative floating years with physics */}
      <FloatingYears />

      {/* Main content centered */}
      <div className="flex-1 flex items-center justify-center">
        {/* Central card */}
        <div className="relative z-10 bg-card border border-border rounded-xl shadow-2xl p-5 max-w-xs w-full mx-4 text-center" style={{ boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.2), 0 8px 16px -6px rgba(0, 0, 0, 0.12)' }}>
          {/* Title */}
          <h2 className="font-display text-2xl font-bold text-foreground mb-0.5">
            Sports Vault
          </h2>
          
          {/* Date */}
          <p className="text-muted-foreground text-xs mb-3">
            {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
          </p>

          {/* Description */}
          <p className="text-foreground/80 text-sm mb-4">
            Place 8 events in chronological order
          </p>

          {/* Sport selector dropdown */}
          <div className="relative mb-4">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="w-full flex items-center justify-between gap-2 px-3 py-2.5 bg-secondary/50 border border-border rounded-lg text-sm text-foreground font-medium hover:bg-secondary transition-colors"
            >
              <div className="flex items-center gap-2">
                <span className="text-lg">{selectedSport.icon}</span>
                <span>{selectedSport.label}</span>
              </div>
              <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {dropdownOpen && (
              <div className="absolute left-0 right-0 mt-1.5 bg-card border border-border rounded-lg shadow-xl z-50 overflow-hidden">
                {SPORT_OPTIONS.map((sport) => (
                  <button
                    key={sport.label}
                    onClick={() => handleSportSelect(sport)}
                    className={`w-full flex items-center gap-2 px-3 py-2.5 text-sm text-left transition-colors hover:bg-muted/50 ${
                      sport.value === selectedSport.value ? 'bg-primary/10' : ''
                    }`}
                  >
                    <span className="text-lg">{sport.icon}</span>
                    <span className="font-medium text-foreground">{sport.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Start button */}
          <Button onClick={handleStart} className="w-full text-sm">
            Start Game →
          </Button>
        </div>
      </div>
    </div>
  );
}
