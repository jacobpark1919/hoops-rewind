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
    <div className="min-h-screen bg-background">
      <div className="container max-w-4xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="flex justify-end mb-8">
          <ThemeToggle />
        </div>

        {/* Title */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4 tracking-tight">
            Sports Flashback
          </h1>
          <p className="text-lg text-muted-foreground max-w-md mx-auto">
            Test your knowledge of sports history. Place events in the correct chronological order.
          </p>
        </div>

        {/* Sport Selection Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 max-w-2xl mx-auto">
          {sportOptions.map((sport) => (
            <button
              key={sport.id}
              onClick={() => handleSelectSport(sport)}
              className="group relative bg-card border-2 border-border rounded-xl p-6 text-left transition-all duration-300 hover:border-primary hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
            >
              <div className="flex items-start gap-4">
                <span className="text-4xl" role="img" aria-label={sport.name}>
                  {sport.icon}
                </span>
                <div className="flex-1">
                  <h2 className="text-xl font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
                    {sport.name}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {sport.description}
                  </p>
                </div>
              </div>
              
              {/* Hover arrow indicator */}
              <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:translate-x-1">
                <svg
                  className="w-6 h-6 text-primary"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            </button>
          ))}
        </div>

        {/* Footer hint */}
        <p className="text-center text-sm text-muted-foreground mt-12">
          You have 3 lives. Place 8 events correctly to win!
        </p>
      </div>
    </div>
  );
}
