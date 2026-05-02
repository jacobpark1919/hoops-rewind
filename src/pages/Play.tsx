import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Game } from "@/components/Game";

export default function Play() {
  const [searchParams] = useSearchParams();
  const initialSport = searchParams.get("sport") ?? "Basketball";
  const [sportFilter, setSportFilter] = useState<string | null>(initialSport);

  useEffect(() => {
    const sport = searchParams.get("sport") ?? "Basketball";
    setSportFilter(sport);
  }, [searchParams]);

  const handleSportChange = (sport: string | null) => {
    setSportFilter(sport);
  };

  return (
    <>
      <Helmet>
        <title>Play Today's Puzzle | Hoops Rewind</title>
        <meta name="description" content="Play today's Hoops Rewind puzzle. Sort iconic NBA events and basketball history moments into chronological order. A new sports trivia challenge drops every day." />
        <link rel="canonical" href="https://hoopsrewind.app/" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "Hoops Rewind",
            "url": "https://hoopsrewind.app",
            "applicationCategory": "GameApplication",
            "applicationSubCategory": "Sports Game",
            "operatingSystem": "Any",
            "browserRequirements": "Requires JavaScript and HTML5.",
            "inLanguage": "en-US",
            "description": "A free daily puzzle game where you sort iconic NBA and sports moments into chronological order. A new basketball history challenge drops every day at midnight ET.",
            "screenshot": "https://hoopsrewind.app/social-preview.png",
            "featureList": [
              "Free daily puzzle",
              "Drag and drop timeline",
              "NBA and basketball history",
              "Sports trivia",
              "New challenge every day"
            ],
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD"
            },
            "genre": "Sports Trivia",
            "numberOfPlayers": {
              "@type": "QuantitativeValue",
              "minValue": 1,
              "maxValue": 1
            }
          })}
        </script>
      </Helmet>
      <h1 className="sr-only-seo">Play Today's NBA Basketball History Puzzle — Hoops Rewind</h1>
      <Game sportFilter={sportFilter} onSportChange={handleSportChange} />
    </>
  );
}
