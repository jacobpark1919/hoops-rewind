import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-background text-foreground px-4 py-8 max-w-2xl mx-auto">
      <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="w-4 h-4" /> Back
      </Link>
      <h1 className="font-display text-2xl font-bold mb-4">Privacy Policy</h1>
      <p className="text-muted-foreground text-sm mb-4">Last updated: February 21, 2026</p>

      <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
        <p>Sports Rewind ("we", "us", or "our") operates the Sports Rewind website. This page informs you of our policies regarding the collection, use, and disclosure of personal information.</p>

        <h2 className="text-foreground font-semibold text-base">Information We Collect</h2>
        <p>We may collect limited, non-personally identifiable information such as browser type, device type, and usage patterns to improve the experience. We do not require account creation or collect personal data unless you voluntarily provide it.</p>

        <h2 className="text-foreground font-semibold text-base">How We Use Information</h2>
        <p>Any information collected is used solely to operate, maintain, and improve the website. We do not sell, trade, or share your information with third parties.</p>

        <h2 className="text-foreground font-semibold text-base">Cookies</h2>
        <p>We may use cookies and similar technologies to remember preferences such as your theme selection. See our Cookie Policy for more details.</p>

        <h2 className="text-foreground font-semibold text-base">Third-Party Services</h2>
        <p>We may use third-party services for hosting and analytics. These services may collect information as governed by their own privacy policies.</p>

        <h2 className="text-foreground font-semibold text-base">Changes to This Policy</h2>
        <p>We may update this Privacy Policy from time to time. Changes will be posted on this page with an updated revision date.</p>

        <h2 className="text-foreground font-semibold text-base">Contact</h2>
        <p>If you have questions about this policy, please contact us through the website.</p>
      </div>
    </div>
  );
}
