import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ArrowLeft } from "lucide-react";

export default function CookiePolicy() {
  useEffect(() => {
    document.documentElement.classList.add("admin-scroll");
    return () => document.documentElement.classList.remove("admin-scroll");
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground px-4 py-8 max-w-2xl mx-auto">
      <Helmet>
        <title>Cookie Policy | Hoops Rewind</title>
        <meta name="description" content="Learn how Hoops Rewind uses cookies to improve your experience on our daily NBA trivia game. Read our cookie policy for full details." />
        <link rel="canonical" href="https://hoopsrewind.app/cookies" />
      </Helmet>
      <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="w-4 h-4" /> Back
      </Link>
      <h1 className="font-display text-2xl font-bold mb-4">Cookie Policy</h1>
      <p className="text-muted-foreground text-sm mb-4">Last updated: February 21, 2026</p>

      <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
        <h2 className="text-foreground font-semibold text-base">What Are Cookies</h2>
        <p>Cookies are small text files stored on your device when you visit a website. They help the site remember your preferences and improve your experience.</p>

        <h2 className="text-foreground font-semibold text-base">How We Use Cookies</h2>
        <p>Hoops Rewind uses cookies for:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>Preferences:</strong> Remembering your theme selection (light/dark mode).</li>
          <li><strong>Functionality:</strong> Storing game state so your progress is maintained during a session.</li>
        </ul>

        <h2 className="text-foreground font-semibold text-base">Third-Party Cookies</h2>
        <p>We may use third-party services (e.g., analytics or hosting providers) that set their own cookies. We do not control these cookies and recommend reviewing their policies.</p>

        <h2 className="text-foreground font-semibold text-base">Managing Cookies</h2>
        <p>You can control or delete cookies through your browser settings. Disabling cookies may affect some features of the website.</p>

        <h2 className="text-foreground font-semibold text-base">Changes</h2>
        <p>We may update this Cookie Policy periodically. Any changes will be reflected on this page.</p>
      </div>
    </div>
  );
}
