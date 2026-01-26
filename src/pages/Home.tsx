import { useNavigate } from "react-router-dom";
import { ThemeToggle } from "@/components/ThemeToggle";

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

  const handleSelectSport = (sport: SportOption) => {
    if (sport.filter) {
      navigate(`/play?sport=${encodeURIComponent(sport.filter)}`);
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

      <div className="container max-w-4xl mx-auto py-12 px-4 relative z-10">
        {/* Header */}
        <div className="flex justify-end mb-12">
          <ThemeToggle />
        </div>

        {/* Hero Section */}
        <div className="text-center mb-16">
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

        {/* Sport Selection - Horizontal Scroll */}
        <div className="relative max-w-5xl mx-auto">
          <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide px-4 -mx-4">
            {sportOptions.map((sport, index) => (
              <button
                key={sport.id}
                onClick={() => handleSelectSport(sport)}
                className="group relative flex-shrink-0 w-72 h-44 bg-card/80 backdrop-blur-sm border border-border rounded-2xl p-6 text-left transition-all duration-300 hover:bg-card hover:border-primary/50 hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-1.5 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background animate-fade-in-up snap-center"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Card gradient overlay on hover */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/0 via-transparent to-accent/0 group-hover:from-primary/10 group-hover:to-accent/10 transition-all duration-300" />
                
                <div className="relative h-full flex flex-col">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-16 h-16 bg-background/50 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <span className="text-4xl" role="img" aria-label={sport.name}>
                        {sport.icon}
                      </span>
                    </div>
                    
                    {/* Arrow indicator */}
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:translate-x-1">
                      <svg
                        className="w-5 h-5 text-primary"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2.5}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </div>
                  </div>
                  
                  <div className="mt-auto">
                    <h2 className="font-display text-2xl font-bold text-foreground mb-1 group-hover:text-primary transition-colors">
                      {sport.name}
                    </h2>
                    <p className="text-sm text-muted-foreground font-body">
                      {sport.description}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
          
          {/* Scroll hint gradients */}
          <div className="absolute left-0 top-0 bottom-4 w-8 bg-gradient-to-r from-background to-transparent pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-4 w-8 bg-gradient-to-l from-background to-transparent pointer-events-none" />
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
