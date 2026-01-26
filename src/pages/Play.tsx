import { useState } from "react";
import { Game } from "@/components/Game";

export default function Play() {
  const [sportFilter, setSportFilter] = useState<string | null>(null);

  const handleSportChange = (sport: string | null) => {
    setSportFilter(sport);
  };

  return <Game sportFilter={sportFilter} onSportChange={handleSportChange} />;
}
