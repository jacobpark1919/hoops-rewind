import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Game } from "@/components/Game";

export default function Play() {
  const [searchParams] = useSearchParams();
  const initialSport = searchParams.get("sport");
  const [sportFilter, setSportFilter] = useState<string | null>(initialSport);

  useEffect(() => {
    const sport = searchParams.get("sport");
    setSportFilter(sport);
  }, [searchParams]);

  const handleSportChange = (sport: string | null) => {
    setSportFilter(sport);
  };

  return <Game sportFilter={sportFilter} onSportChange={handleSportChange} />;
}
