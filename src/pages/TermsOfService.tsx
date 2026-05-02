import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ArrowLeft } from "lucide-react";

export default function TermsOfService() {
  useEffect(() => {
    document.documentElement.classList.add("admin-scroll");
    return () => document.documentElement.classList.remove("admin-scroll");
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground px-4 py-8 max-w-2xl mx-auto">
      <Helmet>
        <title>Terms of Service | Hoops Rewind</title>
        <meta name="description" content="Review the terms of service for Hoops Rewind, the daily NBA basketball history and sports trivia game. Understand your rights and responsibilities as a player." />
        <link rel="canonical" href="https://hoopsrewind.app/terms" />
      </Helmet>
      <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="w-4 h-4" /> Back
      </Link>
      <h1 className="font-display text-2xl font-bold mb-4">Terms of Service</h1>
      <p className="text-muted-foreground text-sm mb-4">Last updated: February 21, 2026</p>

      <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
        <h2 className="text-foreground font-semibold text-base">Acceptance of Terms</h2>
        <p>By accessing and using Hoops Rewind, you agree to be bound by these Terms of Service. If you do not agree, please do not use the website.</p>

        <h2 className="text-foreground font-semibold text-base">Use of the Service</h2>
        <p>Hoops Rewind is a free, browser-based game. You may use it for personal, non-commercial purposes. You agree not to misuse the service, attempt to disrupt its operation, or use automated tools to access it.</p>

        <h2 className="text-foreground font-semibold text-base">Intellectual Property</h2>
        <p>All content, design, and code on this website are the property of Hoops Rewind or its licensors. You may not reproduce, distribute, or create derivative works without permission.</p>

        <h2 className="text-foreground font-semibold text-base">Disclaimer</h2>
        <p>The service is provided "as is" without warranties of any kind. We do not guarantee uninterrupted or error-free operation.</p>

        <h2 className="text-foreground font-semibold text-base">Limitation of Liability</h2>
        <p>To the fullest extent permitted by law, Hoops Rewind shall not be liable for any damages arising from your use of the service.</p>

        <h2 className="text-foreground font-semibold text-base">Changes</h2>
        <p>We reserve the right to modify these terms at any time. Continued use of the service constitutes acceptance of the updated terms.</p>
      </div>
    </div>
  );
}
