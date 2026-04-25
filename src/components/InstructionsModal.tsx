import { useState, useEffect } from "react";
import { X } from "lucide-react";

interface InstructionsModalProps {
  onClose: () => void;
}

export function InstructionsModal({ onClose }: InstructionsModalProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Animate in
    setTimeout(() => setIsVisible(true), 50);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 200);
  };

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-start sm:items-center justify-center p-3 sm:p-4 pt-[6vh] sm:pt-4 transition-all duration-200 ${
        isVisible ? 'bg-black/50' : 'bg-black/0'
      }`}
      onClick={handleClose}
    >
      <div 
        className={`relative bg-card border border-border rounded-xl sm:rounded-2xl p-4 sm:p-6 max-w-[92vw] sm:max-w-sm w-full shadow-2xl transition-all duration-200 max-h-[95vh] overflow-y-auto ${
          isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-2 right-2 sm:top-3 sm:right-3 p-1 rounded-full hover:bg-muted transition-colors"
        >
          <X className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-muted-foreground" />
        </button>

        {/* Content */}
        <div className="text-center">
          <h2 className="font-display text-lg sm:text-2xl font-bold text-foreground mb-1.5 sm:mb-2">
            How to Play
          </h2>
          {/* Drag illustration — light + dark variants */}
          <div className="my-2 sm:my-6 flex justify-center">
            <div className="w-full rounded-lg sm:rounded-xl overflow-hidden bg-muted/30 aspect-[280/306] sm:aspect-auto">
              {/* LIGHT MODE SVG */}
              <svg
                viewBox="0 0 280 360"
                xmlns="http://www.w3.org/2000/svg"
                className="w-full h-full block dark:hidden"
                preserveAspectRatio="xMidYMin slice"
                role="img"
                aria-label="Drag a card into the timeline and tap to place"
              >
                <style>{`
                  .dhl-rowbg { fill: hsl(220, 14%, 96%); stroke: hsl(220, 13%, 88%); stroke-width: 0.75; }
                  .dhl-rowtext { fill: hsl(220, 9%, 75%); }
                  .dhl-ball { fill: hsl(20, 82%, 53%); }
                  .dhl-year { fill: hsl(45, 90%, 55%); }
                  .dhl-yeartext { fill: hsl(220, 30%, 12%); font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 8px; font-weight: 700; text-anchor: middle; }
                  .dhl-zone { fill: hsl(20, 82%, 53%, 0.10); stroke: hsl(20, 82%, 53%); stroke-width: 1.25; stroke-dasharray: 3 2.5; }
                  .dhl-droptext { fill: hsl(20, 82%, 45%); font-family: ui-sans-serif, system-ui, sans-serif; font-size: 8px; font-weight: 700; text-anchor: middle; }
                  .dhl-cardline { fill: hsl(220, 9%, 70%); }
                  .dhl-card { fill: hsl(0, 0%, 100%); stroke: hsl(20, 82%, 53%); stroke-width: 1.5; }
                  .dhl-cursor { fill: hsl(220, 30%, 16%); stroke: hsl(0, 0%, 100%); stroke-width: 0.6; }
                  .dhl-pulse-orange { fill: none; stroke: hsl(20, 82%, 53%); stroke-width: 1.5; }
                  .dhl-pulse-green { fill: none; stroke: hsl(142, 71%, 45%); stroke-width: 2; }
                  .dhl-tap-pill { fill: hsl(20, 82%, 53%); }
                  .dhl-tap-text { fill: hsl(0, 0%, 100%); font-family: ui-sans-serif, system-ui, sans-serif; font-size: 8.5px; font-weight: 700; text-anchor: middle; }
                  .dhl-confirm { fill: none; stroke: hsl(142, 71%, 45%); stroke-width: 2; }
                  .dhl-confirm-anim { animation: dhl-confirm 5.5s ease-out infinite; transform-box: fill-box; transform-origin: center; }
                  .dhl-card-anim { animation: dhl-card 5.5s cubic-bezier(0.4, 0, 0.2, 1) infinite; }
                  .dhl-cur-anim { animation: dhl-cur 5.5s cubic-bezier(0.4, 0, 0.2, 1) infinite; }
                  .dhl-zone-anim { animation: dhl-zone 5.5s ease-in-out infinite; }
                  .dhl-tap-anim { animation: dhl-tap 5.5s ease-in-out infinite; transform-box: fill-box; transform-origin: center; }
                  .dhl-pulse1-anim { animation: dhl-pulse1 5.5s ease-out infinite; transform-box: fill-box; transform-origin: center; }
                  .dhl-pulse2-anim { animation: dhl-pulse2 5.5s ease-out infinite; transform-box: fill-box; transform-origin: center; }
                  .dhl-year-anim { animation: dhl-year 5.5s ease-out infinite; transform-box: fill-box; transform-origin: center; }
                  @keyframes dhl-card {
                    0%   { transform: translate(0px, 0px); opacity: 0; }
                    4%   { transform: translate(0px, 0px); opacity: 1; }
                    32%  { transform: translate(0px, 0px); opacity: 1; }
                    55%  { transform: translate(0px, 130px); opacity: 1; }
                    94%  { transform: translate(0px, 130px); opacity: 1; }
                    98%  { transform: translate(0px, 130px); opacity: 0; }
                    100% { transform: translate(0px, 0px); opacity: 0; }
                  }
                  @keyframes dhl-cur {
                    0%   { transform: translate(290px, 44px); opacity: 1; }
                    14%  { transform: translate(212px, 44px); opacity: 1; }
                    30%  { transform: translate(212px, 44px); opacity: 1; }
                    55%  { transform: translate(212px, 174px); opacity: 1; }
                    63%  { transform: translate(212px, 174px); opacity: 1; }
                    70%  { transform: translate(150px, 169px); opacity: 1; }
                    90%  { transform: translate(150px, 169px); opacity: 1; }
                    95%  { transform: translate(150px, 169px); opacity: 0; }
                    100% { transform: translate(290px, 44px); opacity: 0; }
                  }
                  @keyframes dhl-zone {
                    0%, 35%   { opacity: 0; }
                    48%       { opacity: 1; }
                    55%       { opacity: 1; }
                    62%, 100% { opacity: 0; }
                  }
                  @keyframes dhl-tap {
                    0%, 58%   { transform: scale(0); opacity: 0; }
                    64%       { transform: scale(1); opacity: 1; }
                    74%       { transform: scale(1); opacity: 1; }
                    77%       { transform: scale(0.9); opacity: 1; }
                    80%       { transform: scale(1); opacity: 1; }
                    84%       { transform: scale(1); opacity: 1; }
                    88%, 100% { transform: scale(1); opacity: 0; }
                  }
                  @keyframes dhl-pulse1 {
                    0%, 12%   { transform: scale(0); opacity: 0; }
                    15%       { transform: scale(0.3); opacity: 0.85; }
                    24%       { transform: scale(7); opacity: 0; }
                    25%, 100% { transform: scale(0); opacity: 0; }
                  }
                  @keyframes dhl-pulse2 {
                    0%, 74%   { transform: scale(0); opacity: 0; }
                    77%       { transform: scale(0.3); opacity: 0.9; }
                    85%       { transform: scale(9); opacity: 0; }
                    86%, 100% { transform: scale(0); opacity: 0; }
                  }
                  @keyframes dhl-confirm {
                    0%, 76%   { transform: scale(0.96); opacity: 0; }
                    80%       { transform: scale(1); opacity: 1; }
                    88%       { transform: scale(1.08); opacity: 0; }
                    89%, 100% { transform: scale(0.96); opacity: 0; }
                  }
                  @keyframes dhl-year {
                    0%, 84%   { transform: scale(0); opacity: 0; }
                    88%       { transform: scale(1.25); opacity: 1; }
                    92%       { transform: scale(1); opacity: 1; }
                    94%       { transform: scale(1); opacity: 1; }
                    100%      { transform: scale(1); opacity: 0; }
                  }
                `}</style>

                <g transform="translate(0, 88)">
                  <rect className="dhl-rowbg" x="34" y="0" width="240" height="28" rx="5" />
                  <rect className="dhl-year" x="6" y="5" width="24" height="18" rx="3" />
                  <text className="dhl-yeartext" x="18" y="17">1991</text>
                  <circle className="dhl-ball" cx="49" cy="14" r="5" />
                  <rect className="dhl-rowtext" x="62" y="9" width="200" height="3" rx="1" />
                  <rect className="dhl-rowtext" x="62" y="16" width="160" height="3" rx="1" />
                </g>
                <g transform="translate(0, 124)">
                  <rect className="dhl-rowbg" x="34" y="0" width="240" height="28" rx="5" />
                  <rect className="dhl-year" x="6" y="5" width="24" height="18" rx="3" />
                  <text className="dhl-yeartext" x="18" y="17">1992</text>
                  <circle className="dhl-ball" cx="49" cy="14" r="5" />
                  <rect className="dhl-rowtext" x="62" y="9" width="180" height="3" rx="1" />
                  <rect className="dhl-rowtext" x="62" y="16" width="140" height="3" rx="1" />
                </g>
                <g className="dhl-zone-anim" transform="translate(0, 160)">
                  <rect className="dhl-zone" x="34" y="0" width="240" height="28" rx="5" />
                  <text className="dhl-droptext" x="154" y="18">Drop here</text>
                </g>
                <g transform="translate(0, 196)">
                  <rect className="dhl-rowbg" x="34" y="0" width="240" height="28" rx="5" />
                  <rect className="dhl-year" x="6" y="5" width="24" height="18" rx="3" />
                  <text className="dhl-yeartext" x="18" y="17">2000</text>
                  <circle className="dhl-ball" cx="49" cy="14" r="5" />
                  <rect className="dhl-rowtext" x="62" y="9" width="190" height="3" rx="1" />
                  <rect className="dhl-rowtext" x="62" y="16" width="170" height="3" rx="1" />
                </g>
                <g transform="translate(0, 232)">
                  <rect className="dhl-rowbg" x="34" y="0" width="240" height="28" rx="5" />
                  <rect className="dhl-year" x="6" y="5" width="24" height="18" rx="3" />
                  <text className="dhl-yeartext" x="18" y="17">2002</text>
                  <circle className="dhl-ball" cx="49" cy="14" r="5" />
                  <rect className="dhl-rowtext" x="62" y="9" width="170" height="3" rx="1" />
                  <rect className="dhl-rowtext" x="62" y="16" width="120" height="3" rx="1" />
                </g>
                <text
                  style={{ fill: 'hsl(35, 18%, 58%)', fontFamily: 'ui-sans-serif, system-ui, sans-serif', fontSize: '7.5px', fontWeight: 700, textAnchor: 'middle', letterSpacing: '0.08em' }}
                  x="154" y="80">BEFORE</text>
                <text
                  style={{ fill: 'hsl(35, 18%, 58%)', fontFamily: 'ui-sans-serif, system-ui, sans-serif', fontSize: '7.5px', fontWeight: 700, textAnchor: 'middle', letterSpacing: '0.08em' }}
                  x="154" y="276">AFTER</text>
                <line x1="44" y1="77" x2="114" y2="77" stroke="hsl(35,18%,68%)" strokeWidth="0.75" strokeDasharray="2 2" />
                <line x1="194" y1="77" x2="264" y2="77" stroke="hsl(35,18%,68%)" strokeWidth="0.75" strokeDasharray="2 2" />
                <line x1="44" y1="273" x2="114" y2="273" stroke="hsl(35,18%,68%)" strokeWidth="0.75" strokeDasharray="2 2" />
                <line x1="194" y1="273" x2="264" y2="273" stroke="hsl(35,18%,68%)" strokeWidth="0.75" strokeDasharray="2 2" />
                <rect
                  x="34" y="30" width="240" height="28" rx="5"
                  fill="none"
                  stroke="hsl(20,82%,53%)"
                  strokeWidth="1.25"
                  strokeDasharray="3 2.5"
                  opacity="0.35"
                />
                <g className="dhl-card-anim">
                  <rect className="dhl-card" x="34" y="30" width="240" height="28" rx="5" />
                  <circle className="dhl-ball" cx="49" cy="44" r="5" />
                  <rect className="dhl-cardline" x="62" y="39" width="190" height="3" rx="1" />
                  <rect className="dhl-cardline" x="62" y="46" width="160" height="3" rx="1" />
                  <rect className="dhl-cardline" x="62" y="53" width="80" height="2.5" rx="1" opacity="0.7" />
                  <g className="dhl-year-anim">
                    <rect className="dhl-year" x="6" y="35" width="24" height="18" rx="3" />
                    <text className="dhl-yeartext" x="18" y="47">1996</text>
                  </g>
                </g>
                <rect className="dhl-confirm dhl-confirm-anim" x="34" y="160" width="240" height="28" rx="5" vectorEffect="non-scaling-stroke" />
                <g transform="translate(114, 165)">
                  <g className="dhl-tap-anim">
                    <rect className="dhl-tap-pill" x="0" y="0" width="80" height="18" rx="9" />
                    <text className="dhl-tap-text" x="40" y="12.5">Tap to place</text>
                  </g>
                </g>
                <g className="dhl-cur-anim">
                  <circle className="dhl-pulse-orange dhl-pulse1-anim" cx="0" cy="0" r="2" />
                  <circle className="dhl-pulse-green dhl-pulse2-anim" cx="0" cy="0" r="2" />
                  <path className="dhl-cursor" d="M0,0 L0,12 L3.2,9 L5.4,13.6 L7.4,12.7 L5.2,8.2 L8.6,8.2 Z" />
                </g>
              </svg>

              {/* DARK MODE SVG */}
              <svg
                viewBox="0 0 280 340"
                xmlns="http://www.w3.org/2000/svg"
                className="w-full h-full hidden dark:block"
                preserveAspectRatio="xMidYMin slice"
                role="img"
                aria-label="Drag a card into the timeline and tap to place"
              >
                <style>{`
                  .dhd-rowbg { fill: hsl(220, 10%, 20%); stroke: hsl(220, 8%, 30%); stroke-width: 0.75; }
                  .dhd-rowtext { fill: hsl(220, 8%, 40%); }
                  .dhd-ball { fill: hsl(20, 82%, 55%); }
                  .dhd-year { fill: hsl(45, 75%, 55%); }
                  .dhd-yeartext { fill: hsl(45, 30%, 12%); font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 8px; font-weight: 700; }
                  .dhd-zone { fill: hsl(20, 82%, 55%, 0.12); stroke: hsl(20, 82%, 55%); stroke-width: 1.25; stroke-dasharray: 3 2.5; }
                  .dhd-droptext { fill: hsl(20, 82%, 60%); font-family: ui-sans-serif, system-ui, sans-serif; font-size: 8px; font-weight: 700; text-anchor: middle; }
                  .dhd-cardline { fill: hsl(220, 8%, 50%); }
                  .dhd-card { fill: hsl(220, 10%, 24%); stroke: hsl(20, 82%, 55%); stroke-width: 1.5; }
                  .dhd-cursor { fill: hsl(220, 10%, 95%); stroke: hsl(220, 10%, 16%); stroke-width: 0.6; }
                  .dhd-pulse-orange { fill: none; stroke: hsl(20, 82%, 55%); stroke-width: 1.5; }
                  .dhd-pulse-green { fill: none; stroke: hsl(142, 76%, 50%); stroke-width: 2; }
                  .dhd-tap-pill { fill: hsl(20, 82%, 55%); }
                  .dhd-tap-text { fill: hsl(0, 0%, 100%); font-family: ui-sans-serif, system-ui, sans-serif; font-size: 8.5px; font-weight: 700; text-anchor: middle; }
                  .dhd-confirm { fill: none; stroke: hsl(142, 76%, 50%); stroke-width: 2; }
                  .dhd-confirm-anim { animation: dhd-confirm 5.5s ease-out infinite; transform-box: fill-box; transform-origin: center; }
                  .dhd-card-anim { animation: dhd-card 5.5s cubic-bezier(0.4, 0, 0.2, 1) infinite; }
                  .dhd-cur-anim { animation: dhd-cur 5.5s cubic-bezier(0.4, 0, 0.2, 1) infinite; }
                  .dhd-zone-anim { animation: dhd-zone 5.5s ease-in-out infinite; }
                  .dhd-tap-anim { animation: dhd-tap 5.5s ease-in-out infinite; transform-box: fill-box; transform-origin: center; }
                  .dhd-pulse1-anim { animation: dhd-pulse1 5.5s ease-out infinite; transform-box: fill-box; transform-origin: center; }
                  .dhd-pulse2-anim { animation: dhd-pulse2 5.5s ease-out infinite; transform-box: fill-box; transform-origin: center; }
                  .dhd-year-anim { animation: dhd-year 5.5s ease-out infinite; transform-box: fill-box; transform-origin: center; }
                  @keyframes dhd-card {
                    0%   { transform: translate(0px, 0px); opacity: 0; }
                    4%   { transform: translate(0px, 0px); opacity: 1; }
                    32%  { transform: translate(0px, 0px); opacity: 1; }
                    55%  { transform: translate(0px, 130px); opacity: 1; }
                    94%  { transform: translate(0px, 130px); opacity: 1; }
                    98%  { transform: translate(0px, 130px); opacity: 0; }
                    100% { transform: translate(0px, 0px); opacity: 0; }
                  }
                  @keyframes dhd-cur {
                    0%   { transform: translate(290px, 44px); opacity: 0; }
                    10%  { transform: translate(290px, 44px); opacity: 0; }
                    18%  { transform: translate(290px, 44px); opacity: 1; }
                    28%  { transform: translate(212px, 44px); opacity: 1; }
                    33%  { transform: translate(212px, 44px); opacity: 1; }
                    55%  { transform: translate(212px, 174px); opacity: 1; }
                    63%  { transform: translate(212px, 174px); opacity: 1; }
                    70%  { transform: translate(150px, 169px); opacity: 1; }
                    77%  { transform: translate(150px, 169px); opacity: 1; }
                    90%  { transform: translate(150px, 169px); opacity: 1; }
                    95%  { transform: translate(150px, 169px); opacity: 0; }
                    100% { transform: translate(290px, 44px); opacity: 0; }
                  }
                  @keyframes dhd-zone {
                    0%, 35%   { opacity: 0; }
                    48%       { opacity: 1; }
                    55%       { opacity: 1; }
                    62%, 100% { opacity: 0; }
                  }
                  @keyframes dhd-tap {
                    0%, 58%   { transform: scale(0); opacity: 0; }
                    64%       { transform: scale(1); opacity: 1; }
                    74%       { transform: scale(1); opacity: 1; }
                    77%       { transform: scale(0.9); opacity: 1; }
                    80%       { transform: scale(1); opacity: 1; }
                    84%       { transform: scale(1); opacity: 1; }
                    88%, 100% { transform: scale(1); opacity: 0; }
                  }
                  @keyframes dhd-pulse1 {
                    0%, 30%   { transform: scale(0); opacity: 0; }
                    33%       { transform: scale(0.3); opacity: 0.85; }
                    42%       { transform: scale(7); opacity: 0; }
                    43%, 100% { transform: scale(0); opacity: 0; }
                  }
                  @keyframes dhd-pulse2 {
                    0%, 74%   { transform: scale(0); opacity: 0; }
                    77%       { transform: scale(0.3); opacity: 0.9; }
                    85%       { transform: scale(9); opacity: 0; }
                    86%, 100% { transform: scale(0); opacity: 0; }
                  }
                  @keyframes dhd-confirm {
                    0%, 76%   { transform: scale(0.96); opacity: 0; }
                    80%       { transform: scale(1); opacity: 1; }
                    88%       { transform: scale(1.08); opacity: 0; }
                    89%, 100% { transform: scale(0.96); opacity: 0; }
                  }
                  @keyframes dhd-year {
                    0%, 84%   { transform: scale(0); opacity: 0; }
                    88%       { transform: scale(1.25); opacity: 1; }
                    92%       { transform: scale(1); opacity: 1; }
                    94%       { transform: scale(1); opacity: 1; }
                    100%      { transform: scale(1); opacity: 0; }
                  }
                `}</style>

                <g transform="translate(0, 88)">
                  <rect className="dhd-rowbg" x="34" y="0" width="240" height="28" rx="5" />
                  <rect className="dhd-year" x="6" y="5" width="24" height="18" rx="3" />
                  <text className="dhd-yeartext" x="10" y="17">1991</text>
                  <circle className="dhd-ball" cx="49" cy="14" r="5" />
                  <rect className="dhd-rowtext" x="62" y="9" width="200" height="3" rx="1" />
                  <rect className="dhd-rowtext" x="62" y="16" width="160" height="3" rx="1" />
                </g>
                <g transform="translate(0, 124)">
                  <rect className="dhd-rowbg" x="34" y="0" width="240" height="28" rx="5" />
                  <rect className="dhd-year" x="6" y="5" width="24" height="18" rx="3" />
                  <text className="dhd-yeartext" x="10" y="17">1992</text>
                  <circle className="dhd-ball" cx="49" cy="14" r="5" />
                  <rect className="dhd-rowtext" x="62" y="9" width="180" height="3" rx="1" />
                  <rect className="dhd-rowtext" x="62" y="16" width="140" height="3" rx="1" />
                </g>
                <g className="dhd-zone-anim" transform="translate(0, 160)">
                  <rect className="dhd-zone" x="34" y="0" width="240" height="28" rx="5" />
                  <text className="dhd-droptext" x="154" y="18">Drop here</text>
                </g>
                <g transform="translate(0, 196)">
                  <rect className="dhd-rowbg" x="34" y="0" width="240" height="28" rx="5" />
                  <rect className="dhd-year" x="6" y="5" width="24" height="18" rx="3" />
                  <text className="dhd-yeartext" x="10" y="17">2000</text>
                  <circle className="dhd-ball" cx="49" cy="14" r="5" />
                  <rect className="dhd-rowtext" x="62" y="9" width="190" height="3" rx="1" />
                  <rect className="dhd-rowtext" x="62" y="16" width="170" height="3" rx="1" />
                </g>
                <g transform="translate(0, 232)">
                  <rect className="dhd-rowbg" x="34" y="0" width="240" height="28" rx="5" />
                  <rect className="dhd-year" x="6" y="5" width="24" height="18" rx="3" />
                  <text className="dhd-yeartext" x="10" y="17">2002</text>
                  <circle className="dhd-ball" cx="49" cy="14" r="5" />
                  <rect className="dhd-rowtext" x="62" y="9" width="170" height="3" rx="1" />
                  <rect className="dhd-rowtext" x="62" y="16" width="120" height="3" rx="1" />
                </g>
                <g className="dhd-card-anim">
                  <rect className="dhd-card" x="34" y="30" width="240" height="28" rx="5" />
                  <circle className="dhd-ball" cx="49" cy="44" r="5" />
                  <rect className="dhd-cardline" x="62" y="39" width="190" height="3" rx="1" />
                  <rect className="dhd-cardline" x="62" y="46" width="160" height="3" rx="1" />
                  <rect className="dhd-cardline" x="62" y="53" width="80" height="2.5" rx="1" opacity="0.7" />
                  <g className="dhd-year-anim">
                    <rect className="dhd-year" x="6" y="35" width="24" height="18" rx="3" />
                    <text className="dhd-yeartext" x="10" y="47">1996</text>
                  </g>
                </g>
                <rect className="dhd-confirm dhd-confirm-anim" x="34" y="160" width="240" height="28" rx="5" vectorEffect="non-scaling-stroke" />
                <g transform="translate(114, 165)">
                  <g className="dhd-tap-anim">
                    <rect className="dhd-tap-pill" x="0" y="0" width="80" height="18" rx="9" />
                    <text className="dhd-tap-text" x="40" y="12.5">Tap to place</text>
                  </g>
                </g>
                <g className="dhd-cur-anim">
                  <circle className="dhd-pulse-orange dhd-pulse1-anim" cx="0" cy="0" r="2" />
                  <circle className="dhd-pulse-green dhd-pulse2-anim" cx="0" cy="0" r="2" />
                  <path className="dhd-cursor" d="M0,0 L0,12 L3.2,9 L5.4,13.6 L7.4,12.7 L5.2,8.2 L8.6,8.2 Z" />
                </g>
              </svg>
            </div>
          </div>

          {/* Instructions */}
          <div className="space-y-2 sm:space-y-3 text-left mb-4 sm:mb-6">
            <div className="flex items-start gap-2 sm:gap-3">
              <span className="flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-accent text-accent-foreground font-display font-bold text-[11px] sm:text-sm flex items-center justify-center">1</span>
              <p className="text-foreground text-xs sm:text-sm">Drag each event card into the timeline</p>
            </div>
            <div className="flex items-start gap-2 sm:gap-3">
              <span className="flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-accent text-accent-foreground font-display font-bold text-[11px] sm:text-sm flex items-center justify-center">2</span>
              <p className="text-foreground text-xs sm:text-sm">Place it where you think it belongs chronologically</p>
            </div>
            <div className="flex items-start gap-2 sm:gap-3">
              <span className="flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-accent text-accent-foreground font-display font-bold text-[11px] sm:text-sm flex items-center justify-center">3</span>
              <p className="text-foreground text-xs sm:text-sm">Daily game — come back tomorrow for a new puzzle!</p>
            </div>
          </div>

          {/* Start button */}
          <button
            onClick={handleClose}
            className="w-full py-2.5 sm:py-3 px-4 sm:px-6 bg-accent text-accent-foreground font-display font-bold text-sm sm:text-base rounded-lg sm:rounded-xl transition-all duration-200 hover:opacity-90 hover:scale-[1.02]"
          >
            Let's Go!
          </button>
        </div>
      </div>
    </div>
  );
}
