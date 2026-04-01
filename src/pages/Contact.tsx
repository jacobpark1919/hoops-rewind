import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ArrowLeft, Mail } from "lucide-react";

export default function Contact() {
  useEffect(() => {
    document.documentElement.classList.add("admin-scroll");
    return () => document.documentElement.classList.remove("admin-scroll");
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground px-4 py-8 max-w-2xl mx-auto">
      <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="w-4 h-4" /> Back
      </Link>
      <h1 className="font-display text-2xl font-bold mb-4">Contact Us</h1>

      <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
        <p>Have a question, suggestion, or found a bug? We'd love to hear from you.</p>

        <h2 className="text-foreground font-semibold text-base">Email</h2>
        <p className="flex items-center gap-2">
          <Mail className="w-4 h-4 text-accent" />
          <a href="mailto:sportsrewind123@gmail.com" className="text-accent hover:underline">
            sportsrewind123@gmail.com
          </a>
        </p>

        <h2 className="text-foreground font-semibold text-base">Response Time</h2>
        <p>We aim to respond within 48 hours.</p>

        <h2 className="text-foreground font-semibold text-base">Before Reaching Out</h2>
        <ul className="list-disc pl-5 space-y-1">
          <li>Check our <Link to="/privacy" className="text-accent hover:underline">Privacy Policy</Link> and <Link to="/terms" className="text-accent hover:underline">Terms of Service</Link> for common questions.</li>
          <li>Try refreshing the page or clearing your browser cache if you're experiencing issues.</li>
        </ul>
      </div>
    </div>
  );
}
