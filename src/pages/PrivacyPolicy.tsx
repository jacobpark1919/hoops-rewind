import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ArrowLeft } from "lucide-react";

export default function PrivacyPolicy() {
  useEffect(() => {
    document.documentElement.classList.add("admin-scroll");
    return () => document.documentElement.classList.remove("admin-scroll");
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground px-4 py-8 max-w-2xl mx-auto">
      <Helmet>
        <title>Privacy Policy | Hoops Rewind</title>
        <meta name="description" content="Read the Hoops Rewind privacy policy. Learn how we collect, store, and protect your data on our daily NBA trivia and basketball history game." />
      </Helmet>
      <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="w-4 h-4" /> Back
      </Link>
      <h1 className="font-display text-2xl font-bold mb-4">Privacy Policy</h1>
      <p className="text-muted-foreground text-sm mb-4">Last updated: April 30, 2026</p>

      <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
        <p>Hoops Rewind ("we", "us", or "our") operates the Hoops Rewind website at hoopsrewind.app. This Privacy Policy explains what information we collect, how we use it, and the choices you have. By using Hoops Rewind, you agree to the practices described below.</p>

        <h2 className="text-foreground font-semibold text-base">Accounts Are Optional</h2>
        <p>You can play Hoops Rewind without an account. Accounts exist for one reason: to save and display your progress (streaks, history, and stats) across sessions and devices. We do not use accounts for marketing, profiling, or any purpose unrelated to tracking your in-game progress.</p>

        <h2 className="text-foreground font-semibold text-base">Information We Collect</h2>
        <p><strong className="text-foreground">When you sign in with Google.</strong> If you choose to sign in, we receive your name, email address, profile picture, and Google account identifier from Google's OAuth service. We use this information solely to create and authenticate your Hoops Rewind account so we can save your progress.</p>
        <p><strong className="text-foreground">Game data.</strong> When signed in, we store the puzzles you've played and your results (correct/incorrect, completion date) so we can show you your stats and unlock past puzzles.</p>
        <p><strong className="text-foreground">Anonymous usage data.</strong> We collect aggregate, non-personally-identifiable analytics such as page views, browser type, and device type to understand how the site is used and improve it.</p>
        <p><strong className="text-foreground">Local preferences.</strong> Your theme choice (light/dark) and other UI preferences are stored locally in your browser and never sent to our servers.</p>

        <h2 className="text-foreground font-semibold text-base">Limited Use of Google User Data</h2>
        <p>Hoops Rewind's use and transfer of information received from Google APIs adheres to the <a href="https://developers.google.com/terms/api-services-user-data-policy#limited-use" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">Google API Services User Data Policy</a>, including the Limited Use requirements. We use Google account information only to authenticate you and track your in-game progress. We do not sell this data, use it for advertising, or share it with third parties for unrelated purposes. Humans do not access this data except (a) with your explicit consent, (b) to comply with applicable law, or (c) where strictly necessary for security and abuse prevention.</p>

        <h2 className="text-foreground font-semibold text-base">How We Use Information</h2>
        <p>We use the information we collect to operate the website, authenticate users who sign in, track in-game progress, and improve the product. We do not sell, rent, or trade your personal information.</p>

        <h2 className="text-foreground font-semibold text-base">Service Providers</h2>
        <p>We rely on a small number of third-party services to run Hoops Rewind. Each handles a specific function and is contractually limited to that function:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li><strong className="text-foreground">Supabase</strong> — authentication and database hosting (account info and game results)</li>
          <li><strong className="text-foreground">Google</strong> — OAuth sign-in provider</li>
          <li><strong className="text-foreground">Vercel</strong> — website hosting and anonymous analytics</li>
        </ul>
        <p>These providers may process information on our behalf in accordance with their own privacy policies.</p>

        <h2 className="text-foreground font-semibold text-base">Cookies and Local Storage</h2>
        <p>We use cookies and browser storage to keep you signed in (when you choose to sign in) and to remember preferences like your theme. See our <Link to="/cookies" className="underline hover:text-foreground">Cookie Policy</Link> for details.</p>

        <h2 className="text-foreground font-semibold text-base">Data Retention and Deletion</h2>
        <p>We keep account and progress data for as long as your account is active. You can request deletion of your account and all associated data at any time by contacting us — see the Contact section below. Once deleted, your data is permanently removed from our systems within a reasonable time, subject to backups that age out on a normal schedule.</p>

        <h2 className="text-foreground font-semibold text-base">Your Choices</h2>
        <p>You can play without signing in. If you do sign in, you may sign out at any time from the header. You can revoke our access to your Google account at <a href="https://myaccount.google.com/permissions" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">Google Account permissions</a>.</p>

        <h2 className="text-foreground font-semibold text-base">Children's Privacy</h2>
        <p>Hoops Rewind is not directed to children under 13 (or the equivalent minimum age in your jurisdiction). We do not knowingly collect personal information from children. If you believe a child has provided us with personal information, please contact us and we will delete it.</p>

        <h2 className="text-foreground font-semibold text-base">Security</h2>
        <p>We use industry-standard measures to protect the information we hold, including encrypted connections (HTTPS) and access-controlled databases. No system is perfectly secure, but we work to keep your information safe.</p>

        <h2 className="text-foreground font-semibold text-base">Changes to This Policy</h2>
        <p>We may update this Privacy Policy from time to time. Changes will be posted on this page with a new "Last updated" date.</p>

        <h2 className="text-foreground font-semibold text-base">Contact</h2>
        <p>If you have questions about this policy, want a copy of your data, or want your account deleted, please <Link to="/contact" className="underline hover:text-foreground">contact us</Link>.</p>
      </div>
    </div>
  );
}
