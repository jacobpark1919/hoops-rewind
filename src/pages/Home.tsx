import { useNavigate } from "react-router-dom";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useState } from "react";
import { ChevronDown } from "lucide-react";

interface SportOption {
  id: string;
  name: string;
  icon: string;
  description: string;
  filter: string | null;
}

const sportOptions: SportOption[] = [
  {
    id: "football",
    name: "Football",
    icon: "🏈",
    description: "NFL history from Super Bowl I to today",
    filter: "American Football",
  },
  {
    id: "basketball",
    name: "Basketball",
    icon: "🏀",
    description: "NBA legends and iconic moments",
    filter: "Basketball",
  },
  {
    id: "baseball",
    name: "Baseball",
    icon: "⚾",
    description: "America's pastime through the ages",
    filter: "Baseball",
  },
  {
    id: "everything",
    name: "Everything",
    icon: "🏆",
    description: "All sports, all eras, ultimate challenge",
    filter: null,
  },
];

export default function Home() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState<SportOption | null>(null);

  const handleSelectSport = (sport: SportOption) => {
    setSelected(sport);
    setIsOpen(false);
  };

  const handlePlay = () => {
    if (!selected) return;
    if (selected.filter) {
      navigate(`/play?sport=${encodeURIComponent(selected.filter)}`);
    } else {
      navigate("/play");
    }
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-[500px] h-[500px] bg-accent/5 rounded-full blur-3xl" />
      </div>

      <div className="container max-w-4xl mx-auto py-6 px-4 relative z-10">
        {/* Header */}
        <div className="flex justify-end mb-6">
          <ThemeToggle />
        </div>

        {/* Hero Section */}
        <div className="text-center mb-10">
          <div className="inline-block mb-6">
            <span className="text-6xl md:text-7xl animate-bounce-in">🏆</span>
          </div>
          <h1 className="font-display text-5xl md:text-6xl font-extrabold tracking-tight mb-4">
            <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              Sports
            </span>
            <span className="text-foreground ml-2">Flashback</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-lg mx-auto font-body">
            Test your knowledge of sports history. Place events in the correct chronological order.
          </p>
        </div>

        {/* Sport Selection Dropdown */}
        <div className="max-w-md mx-auto space-y-4">
          <div className="relative">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="w-full flex items-center justify-between gap-4 bg-card border border-border rounded-xl p-4 text-left transition-all duration-200 hover:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
            >
              {selected ? (
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{selected.icon}</span>
                  <div>
                    <p className="font-display font-bold text-foreground">{selected.name}</p>
                    <p className="text-sm text-muted-foreground">{selected.description}</p>
                  </div>
                </div>
              ) : (
                <span className="text-muted-foreground font-body">Choose a category...</span>
              )}
              <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
              <div className="absolute z-50 w-full mt-2 bg-card border border-border rounded-xl shadow-xl overflow-auto max-h-72 animate-fade-in-up">
                {sportOptions.map((sport) => (
                  <button
                    key={sport.id}
                    onClick={() => handleSelectSport(sport)}
                    className={`w-full flex items-center gap-3 p-4 text-left transition-colors hover:bg-muted/50 ${
                      selected?.id === sport.id ? 'bg-primary/10' : ''
                    }`}
                  >
                    <span className="text-2xl">{sport.icon}</span>
                    <div>
                      <p className="font-display font-bold text-foreground">{sport.name}</p>
                      <p className="text-sm text-muted-foreground">{sport.description}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Play Button */}
          <button
            onClick={handlePlay}
            disabled={!selected}
            className="w-full py-4 px-6 bg-primary text-primary-foreground font-display font-bold text-lg rounded-xl transition-all duration-200 hover:opacity-90 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            Play Now
          </button>
        </div>

        {/* Footer hint */}
        <div className="text-center mt-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-muted/50 rounded-full">
            <span className="text-destructive">❤️❤️❤️</span>
            <span className="text-sm text-muted-foreground font-body">
              3 lives • 8 events • Can you master history?
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
