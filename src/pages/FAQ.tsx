import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ArrowLeft } from "lucide-react";

const faqs = [
  {
    q: "How do I play Hoops Rewind?",
    a: "Each day, you're given a set of iconic NBA moments. Your job is to drag and drop them into the correct chronological order on a timeline. If you place an event correctly, it locks in — if not, you lose a life. Try to get them all right before you run out of lives!",
  },
  {
    q: "How often does the puzzle update?",
    a: "A brand-new Hoops Rewind puzzle drops every day at midnight Eastern Time. Each puzzle features a fresh set of basketball history moments, so there's always a new challenge waiting for you.",
  },
  {
    q: "Is Hoops Rewind free to play?",
    a: "Yes! Hoops Rewind is completely free to play. There are no paywalls, subscriptions, or hidden fees. Just visit the site and start sorting NBA history.",
  },
  {
    q: "What NBA events are featured?",
    a: "Our puzzles cover a wide range of basketball history — from legendary draft picks and championship wins to record-breaking performances and iconic trades. Events span decades of NBA history to test both casual fans and die-hard hoops heads.",
  },
  {
    q: "How is my score calculated?",
    a: "Your score is based on how many events you place correctly out of the total rounds. Each correct placement counts toward your final score. A perfect game means you placed every event in the right spot without losing all your lives.",
  },
  {
    q: "Can I play past puzzles?",
    a: "Currently, Hoops Rewind offers one new puzzle per day and past puzzles are not replayable. We're exploring ways to let players revisit previous challenges in the future — stay tuned!",
  },
  {
    q: "Is there a mobile version?",
    a: "Hoops Rewind is fully responsive and works great on mobile browsers. There's no separate app to download — just open hoopsrewind.app in your phone's browser and start playing. Touch controls are fully supported.",
  },
  {
    q: "How do I contact the team?",
    a: "You can reach us anytime by visiting our Contact page or emailing sportsrewind123@gmail.com. We welcome feedback, bug reports, and suggestions for new features or events to include.",
  },
];

export default function FAQ() {
  useEffect(() => {
    document.documentElement.classList.add("admin-scroll");
    return () => document.documentElement.classList.remove("admin-scroll");
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground px-4 py-8 max-w-2xl mx-auto">
      <Helmet>
        <title>FAQ | Hoops Rewind — Daily NBA Trivia &amp; Basketball History Game</title>
        <meta
          name="description"
          content="Got questions about Hoops Rewind? Find answers about how to play, how scoring works, and more about the daily NBA basketball history and sports trivia game."
        />
      </Helmet>
      <Link
        to="/"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="w-4 h-4" /> Back
      </Link>
      <h1 className="font-display text-2xl font-bold mb-6">
        NBA Trivia &amp; Basketball History FAQ
      </h1>

      <div className="space-y-6">
        {faqs.map((faq, i) => (
          <div key={i}>
            <h2 className="text-foreground font-semibold text-base mb-1">{faq.q}</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
