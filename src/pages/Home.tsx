import { useNavigate, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ThemeToggle } from "@/components/ThemeToggle";
import { StatsModal } from "@/components/StatsModal";
import { useAuth } from "@/hooks/useAuth";
import { LogIn, LogOut, BarChart3 } from "lucide-react";
import { lovable } from "@/integrations/lovable/index";
import { useState } from "react";

const ORIGIN_DATE = new Date(2026, 1, 12);

function getPuzzleNumber() {
  const ORIGIN_UTC = Date.UTC(2026, 1, 12);
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const y = +parts.find(p => p.type === "year")!.value;
  const m = +parts.find(p => p.type === "month")!.value;
  const d = +parts.find(p => p.type === "day")!.value;
  return Math.max(1, Math.floor((Date.UTC(y, m - 1, d) - ORIGIN_UTC) / 86400000) + 1);
}

export default function Home() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [showStats, setShowStats] = useState(false);

  const handlePlay = () => {
    navigate("/play?sport=Basketball");
  };

  const today = new Date().toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).toUpperCase();
  const puzzleNum = getPuzzleNumber();

  const BballIcon = () => (
    <svg viewBox="0 0 24 24" className="shrink-0" style={{ width: 'clamp(22px, 2.5vh, 36px)', height: 'clamp(22px, 2.5vh, 36px)' }}>
      <circle cx="12" cy="12" r="11" fill="hsl(var(--accent))" />
      <path d="M12 1 Q12 12 12 23" stroke="rgba(0,0,0,0.25)" strokeWidth="1.2" fill="none" />
      <path d="M1 12 Q12 12 23 12" stroke="rgba(0,0,0,0.25)" strokeWidth="1.2" fill="none" />
      <path d="M3.5 5 Q12 10 20.5 5" stroke="rgba(0,0,0,0.25)" strokeWidth="1.2" fill="none" />
      <path d="M3.5 19 Q12 14 20.5 19" stroke="rgba(0,0,0,0.25)" strokeWidth="1.2" fill="none" />
    </svg>
  );

  return (
    <div className="home-page">
      <Helmet>
        <title>NBA Trivia &amp; Basketball History Game | Hoops Rewind</title>
        <meta name="description" content="Hoops Rewind is the daily NBA timeline game. Drag historic basketball moments into chronological order and prove you know ball. New puzzle every day — free to play." />
      </Helmet>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Georgia&display=swap');

        .home-page {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          background: hsl(var(--background));
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          transition: background 0.3s;
        }

        .home-nav {
          background: hsl(var(--background));
          border-bottom: 1px solid hsl(var(--border));
          padding: 12px 48px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          position: sticky;
          top: 0;
          z-index: 100;
          transition: background 0.3s, border-color 0.3s;
          flex-shrink: 0;
        }

        .home-logo {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          font-weight: 800;
          letter-spacing: 1.5px;
          color: hsl(var(--foreground));
          text-decoration: none;
          transition: color 0.3s;
        }

        .home-nav-btn {
          background: transparent;
          border: 1px solid hsl(var(--border));
          border-radius: 8px;
          padding: 7px 14px;
          font-size: 12px;
          font-weight: 600;
          color: hsl(var(--muted-foreground));
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: background 0.2s, color 0.3s, border-color 0.3s;
          white-space: nowrap;
        }
        .home-nav-btn:hover { background: hsl(var(--secondary)); }

        .home-nav-icon-btn {
          background: hsl(var(--secondary));
          border: 1px solid hsl(var(--border));
          border-radius: 8px;
          padding: 7px 10px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.2s, border-color 0.3s;
          flex-shrink: 0;
        }
        .home-nav-icon-btn:hover { background: hsl(var(--secondary)); }

        .home-nav-right { display: flex; gap: 8px; align-items: center; }

        .home-main {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: clamp(16px, 2.5vh, 36px) clamp(20px, 5vw, 60px);
        }

        .home-hero {
          display: flex;
          gap: clamp(24px, 3.5vw, 56px);
          align-items: center;
          width: 100%;
          max-width: 1100px;
        }

        .home-hero-left { flex: 1; min-width: 0; }

        .home-puzzle-label {
          font-size: clamp(11px, min(1.2vw, 1.8vh), 15px);
          letter-spacing: 2.5px;
          color: hsl(var(--muted-foreground));
          font-weight: 600;
          margin-bottom: clamp(8px, 2vh, 22px);
          transition: color 0.3s;
        }

        .home-hero-title {
          font-size: clamp(28px, min(5.5vw, 8.5vh), 88px);
          font-weight: 900;
          line-height: 1.0;
          color: hsl(var(--foreground));
          font-family: Georgia, serif;
          margin-bottom: clamp(10px, 2.2vh, 30px);
          transition: color 0.3s;
        }

        .home-hero-sub {
          font-size: clamp(12px, min(1.5vw, 2vh), 19px);
          color: hsl(var(--muted-foreground));
          line-height: 1.7;
          margin-bottom: clamp(16px, 3vh, 38px);
          max-width: 380px;
          transition: color 0.3s;
        }

        .home-play-btn {
          display: inline-block;
          background: hsl(var(--accent));
          color: hsl(var(--accent-foreground));
          padding: clamp(10px, 1.8vh, 17px) clamp(16px, 2.5vw, 34px);
          border-radius: 9px;
          font-size: clamp(12px, min(1.4vw, 2vh), 17px);
          font-weight: 700;
          border: none;
          cursor: pointer;
          margin-bottom: clamp(8px, 1.6vh, 17px);
          transition: opacity 0.2s, transform 0.1s;
          text-decoration: none;
        }
        .home-play-btn:hover { opacity: 0.9; transform: translateY(-1px); }
        .home-play-btn:active { transform: translateY(0); }

        .home-new-puzzle-badge {
          font-size: clamp(10px, min(1.1vw, 1.8vh), 15px);
          color: hsl(var(--muted-foreground));
          display: flex;
          align-items: center;
          gap: 7px;
          transition: color 0.3s;
        }

        .home-green-dot {
          width: 7px; height: 7px;
          background: hsl(var(--success));
          border-radius: 50%;
          flex-shrink: 0;
          animation: pulse 2s ease-in-out infinite;
        }

        .home-hero-right {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          min-width: 0;
        }

        .home-browser-window {
          width: 100%;
          max-width: clamp(340px, 42vw, 560px);
          background: hsl(var(--card));
          border-radius: 16px;
          border: 1px solid hsl(var(--border));
          overflow: hidden;
          box-shadow: 0 8px 40px hsl(var(--foreground) / 0.10);
          transition: background 0.3s, border-color 0.3s;
        }

        .home-browser-chrome {
          background: hsl(var(--secondary));
          padding: clamp(8px, 1.4vh, 14px) 16px;
          display: flex;
          align-items: center;
          gap: 10px;
          border-bottom: 1px solid hsl(var(--border));
          transition: background 0.3s, border-color 0.3s;
        }

        .home-browser-dots { display: flex; gap: 5px; }
        .home-dot-r { width: 10px; height: 10px; border-radius: 50%; background: #FF5F57; }
        .home-dot-y { width: 10px; height: 10px; border-radius: 50%; background: #FFBD2E; }
        .home-dot-g { width: 10px; height: 10px; border-radius: 50%; background: #28C840; }

        .home-browser-url {
          flex: 1;
          background: hsl(var(--muted));
          border-radius: 5px;
          height: 20px;
          display: flex;
          align-items: center;
          padding: 0 10px;
          font-size: 10px;
          color: hsl(var(--muted-foreground));
          transition: background 0.3s;
        }

        .home-game-inner { padding: clamp(12px, 2vh, 22px) clamp(12px, 2vw, 22px); }

        .home-game-nav {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: clamp(10px, 1.6vh, 18px);
          padding-bottom: clamp(8px, 1.2vh, 13px);
          border-bottom: 1px solid hsl(var(--border));
          transition: border-color 0.3s;
        }

        .home-game-round {
          font-size: clamp(9px, 1vh, 12px);
          color: hsl(var(--muted-foreground));
          letter-spacing: 1px;
        }

        .home-round-dots { display: flex; gap: 4px; }
        .home-rdot { width: 7px; height: 7px; border-radius: 50%; }
        .home-rdot-on { background: hsl(var(--success)); }
        .home-rdot-off { background: hsl(var(--border)); }

        .home-timeline-label {
          font-size: clamp(9px, 1vh, 11px);
          color: hsl(var(--muted-foreground));
          text-align: center;
          letter-spacing: 1.5px;
          margin-bottom: clamp(6px, 1.2vh, 14px);
          transition: color 0.3s;
        }

        .home-event-card {
          background: hsl(var(--card));
          border-radius: 10px;
          padding: clamp(8px, 1.6vh, 15px) clamp(10px, 1.5vw, 18px);
          border: 1px solid hsl(var(--border));
          margin-bottom: clamp(6px, 1.1vh, 11px);
          display: flex;
          align-items: center;
          gap: clamp(8px, 1vw, 14px);
          transition: background 0.3s, border-color 0.3s;
        }
        .home-event-card.mystery {
          border: 2px dashed hsl(var(--primary));
        }

        .home-event-text { flex: 1; min-width: 0; }
        .home-event-title {
          font-size: clamp(10px, min(1.2vw, 1.9vh), 16px);
          color: hsl(var(--foreground));
          font-weight: 500;
          line-height: 1.3;
          transition: color 0.3s;
        }
        .home-event-title.mystery-text { color: hsl(var(--primary)); }
        .home-event-cat {
          font-size: clamp(9px, 1.1vh, 12px);
          color: hsl(var(--muted-foreground));
          margin-top: 2px;
          transition: color 0.3s;
        }

        .home-year-badge {
          font-size: clamp(9px, 1.1vh, 12px);
          font-weight: 700;
          border-radius: 20px;
          padding: clamp(2px, 0.5vh, 5px) clamp(7px, 0.8vw, 11px);
          flex-shrink: 0;
        }
        .home-y-green { background: hsl(var(--success)); color: hsl(var(--success-foreground)); }
        .home-y-mystery { background: hsl(var(--primary)); color: hsl(var(--primary-foreground)); letter-spacing: 1px; }

        .home-footer {
          background: hsl(var(--background));
          border-top: 1px solid hsl(var(--border));
          padding: clamp(10px, 2vh, 16px) 48px;
          text-align: center;
          transition: background 0.3s, border-color 0.3s;
          flex-shrink: 0;
        }

        .home-footer-links {
          font-size: 11px;
          color: hsl(var(--muted-foreground));
          display: flex;
          align-items: center;
          justify-content: center;
          flex-wrap: wrap;
          gap: 4px;
        }
        .home-footer-links a {
          color: hsl(var(--muted-foreground));
          text-decoration: none;
        }
        .home-footer-links a:hover {
          color: hsl(var(--foreground));
          text-decoration: underline;
        }

        /* Short viewport */
        @media (max-height: 580px) and (min-width: 641px) {
          .home-main { padding: 16px clamp(20px, 4vw, 48px); }
          .home-hero-title { font-size: clamp(22px, 3.5vw, 40px) !important; }
          .home-hero-sub { font-size: 12px; margin-bottom: 14px; }
          .home-play-btn { padding: 9px 18px; font-size: 12px; margin-bottom: 9px; }
          .home-event-card { padding: 5px 11px; margin-bottom: 5px; }
          .home-event-title { font-size: 10px; }
          .home-game-inner { padding: 10px 12px; }
          .home-game-nav { margin-bottom: 8px; padding-bottom: 7px; }
          .home-timeline-label { margin-bottom: 5px; }
          .home-footer { padding: 10px 48px; }
        }

        /* Very short: hide browser mockup */
        @media (max-height: 420px) and (min-width: 641px) {
          .home-hero-right { display: none; }
          .home-hero-left { text-align: center; }
          .home-hero-sub { max-width: 100%; }
          .home-play-btn { padding: 11px 24px; }
          .home-new-puzzle-badge { justify-content: center; }
        }

        /* Mobile */
        @media (max-width: 640px) {
          .home-page { min-height: auto; overflow: auto; }
          .home-nav { padding: 12px 20px; }
          .home-signin-label { display: none; }

          .home-main {
            flex: none;
            padding: 32px 20px 28px;
            align-items: flex-start;
          }

          .home-hero {
            flex-direction: column;
            gap: 36px;
            align-items: stretch;
          }

          .home-hero-left { text-align: center; }
          .home-puzzle-label { font-size: 10px; }
          .home-hero-title { font-size: clamp(36px, 11vw, 52px) !important; }
          .home-hero-sub {
            font-size: 14px;
            max-width: 100%;
            margin-left: auto;
            margin-right: auto;
          }

          .home-play-btn {
            display: block;
            width: 100%;
            text-align: center;
            font-size: 15px;
            padding: 15px 20px;
          }

          .home-new-puzzle-badge { justify-content: center; }
          .home-hero-right { justify-content: center; }
          .home-browser-window {
            max-width: 100%;
            border-radius: 14px;
          }
          .home-footer { padding: 14px 20px; }
          .home-footer-links { font-size: 10px; }
        }

        @media (max-width: 380px) {
          .home-hero-title { font-size: 32px !important; }
          .home-footer-links { font-size: 9px; }
        }
      `}</style>

      {/* NAV */}
      <nav className="home-nav">
        <span className="home-logo" style={{ cursor: 'default' }}>
          <svg width="22" height="15" viewBox="0 0 20 14">
            <polygon points="10,0 0,7 10,14" fill="hsl(var(--accent))" />
            <polygon points="20,0 10,7 20,14" fill="hsl(var(--accent))" />
          </svg>
          HOOPS REWIND
        </span>
        <div className="home-nav-right">
          {user ? (
            <>
              <button
                onClick={() => setShowStats(true)}
                className="home-nav-icon-btn"
                aria-label="Your stats"
              >
                <BarChart3 className="w-[14px] h-[14px] text-muted-foreground" />
              </button>
              <button
                onClick={signOut}
                className="home-nav-icon-btn"
                aria-label="Sign out"
              >
                <LogOut className="w-[14px] h-[14px] text-muted-foreground" />
              </button>
            </>
          ) : (
            <button
              onClick={() => lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin })}
              className="home-nav-icon-btn"
              aria-label="Sign in"
              style={{ gap: '6px' }}
            >
              <LogIn className="w-[14px] h-[14px] text-foreground" />
              <span className="home-signin-label" style={{ fontSize: '12px', fontWeight: 600, color: 'hsl(var(--foreground))' }}>Sign In</span>
            </button>
          )}
          <ThemeToggle size="sm" className="sm:hidden" />
          <ThemeToggle className="hidden sm:block" />
        </div>
      </nav>

      {/* HERO */}
      <main className="home-main">
        <div className="home-hero">
          {/* LEFT */}
          <div className="home-hero-left">
            <div className="home-puzzle-label">PUZZLE #{puzzleNum} · {today}</div>
            <h1 className="home-hero-title">
              The NBA<br />Timeline <span style={{ color: 'hsl(var(--accent))' }}>Game.</span>
            </h1>
            <p className="home-hero-sub">
              Drag NBA moments into the right order.<br />New puzzle drops every day.
            </p>
            <button onClick={handlePlay} className="home-play-btn">
              Play Today's Puzzle
            </button>
            <div className="home-new-puzzle-badge">
              <div className="home-green-dot" />
              New puzzle every day
            </div>
          </div>

          {/* RIGHT: browser mockup */}
          <div className="home-hero-right">
            <div className="home-browser-window">
              <div className="home-browser-chrome">
                <div className="home-browser-dots">
                  <div className="home-dot-r" />
                  <div className="home-dot-y" />
                  <div className="home-dot-g" />
                </div>
                <div className="home-browser-url">hoopsrewind.app</div>
              </div>

              <div className="home-game-inner">
                <div className="home-game-nav">
                  <span className="home-game-round">ROUND 3/8 · PUZZLE #{puzzleNum}</span>
                  <div className="home-round-dots">
                    <div className="home-rdot home-rdot-on" />
                    <div className="home-rdot home-rdot-on" />
                    <div className="home-rdot home-rdot-on" />
                    <div className="home-rdot home-rdot-off" />
                    <div className="home-rdot home-rdot-off" />
                    <div className="home-rdot home-rdot-off" />
                    <div className="home-rdot home-rdot-off" />
                    <div className="home-rdot home-rdot-off" />
                  </div>
                </div>

                <div className="home-timeline-label">EARLIEST</div>

                <div className="home-event-card">
                  <div className="home-year-badge home-y-green">1989</div>
                  <BballIcon />
                  <div className="home-event-text">
                    <div className="home-event-title">Pistons sweep Lakers 4-0 in the Finals</div>
                    <div className="home-event-cat">Basketball</div>
                  </div>
                </div>

                <div className="home-event-card mystery">
                  <div className="home-year-badge home-y-mystery">???</div>
                  <BballIcon />
                  <div className="home-event-text">
                    <div className="home-event-title mystery-text">LeBron James gets drafted #1 overall</div>
                    <div className="home-event-cat">Basketball</div>
                  </div>
                </div>

                <div className="home-event-card">
                  <div className="home-year-badge home-y-green">2012</div>
                  <BballIcon />
                  <div className="home-event-text">
                    <div className="home-event-title">Jeremy Lin sparks Linsanity in New York</div>
                    <div className="home-event-cat">Basketball</div>
                  </div>
                </div>

                <div className="home-event-card">
                  <div className="home-year-badge home-y-green">2021</div>
                  <BballIcon />
                  <div className="home-event-text">
                    <div className="home-event-title">Steph Curry breaks the all-time three-point record</div>
                    <div className="home-event-cat">Basketball</div>
                  </div>
                </div>

                <div className="home-timeline-label" style={{ marginTop: 8, marginBottom: 0 }}>LATEST</div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="home-footer">
        <div className="home-footer-links">
          <Link to="/faq">FAQ</Link><span>·</span>
          <Link to="/contact">Contact Us</Link><span>·</span>
          <Link to="/privacy">Privacy Policy</Link><span>·</span>
          <Link to="/terms">Terms of Service</Link><span>·</span>
          <Link to="/cookies">Cookie Policy</Link><span>·</span>
          <span>© {new Date().getFullYear()} Hoops Rewind. All rights reserved.</span>
        </div>
      </footer>

      {/* Stats Modal */}
      <StatsModal open={showStats} onClose={() => setShowStats(false)} />
    </div>
  );
}
