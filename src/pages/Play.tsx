import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
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

  return (
    <>
      <Helmet>
        <title>Play Today's Puzzle | Hoops Rewind</title>
        <meta name="description" content="Test your NBA knowledge. Place historic basketball moments in the right order." />
      </Helmet>
      <Game sportFilter={sportFilter} onSportChange={handleSportChange} />
    </>
  );
}
