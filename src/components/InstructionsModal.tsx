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
        isVisible ? "bg-black/50" : "bg-black/0"
      }`}
      onClick={handleClose}
    >
      <div
        className={`relative bg-card border border-border rounded-xl sm:rounded-2xl p-4 sm:p-6 max-w-[92vw] sm:max-w-sm w-full shadow-2xl transition-all duration-200 max-h-[95vh] overflow-y-auto ${
          isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"
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
          <h2 className="font-display text-lg sm:text-2xl font-bold text-foreground mb-1.5 sm:mb-2">How to Play</h2>
          {/* Drag illustration — light + dark variants */}
          <div className="my-2 sm:my-6 flex justify-center">
            <div className="w-full rounded-lg sm:rounded-xl overflow-hidden bg-muted/30">
              {/* LIGHT MODE */}
              <svg
                viewBox="0 0 280 285"
                xmlns="http://www.w3.org/2000/svg"
                className="w-full block dark:hidden"
                role="img"
                aria-label="Drag a card into the timeline and tap to place"
              >
                <style>{`
                  .vl-bg{fill:hsl(35,30%,90%);}
                  .vl-rb{fill:hsl(220,14%,96%);stroke:hsl(220,13%,88%);stroke-width:0.75;}
                  .vl-rt{fill:hsl(220,9%,75%);}
                  .vl-bl{fill:hsl(20,82%,53%);}
                  .vl-yr{fill:hsl(45,90%,55%);}
                  .vl-yt{fill:hsl(220,30%,12%);font-family:ui-monospace,monospace;font-size:8px;font-weight:700;text-anchor:middle;}
                  .vl-gh{fill:none;stroke:hsl(20,82%,53%);stroke-width:2;stroke-dasharray:3 2.5;opacity:0.7;}
                  .vl-dz{fill:hsl(20,82%,53%,0.10);stroke:hsl(20,82%,53%);stroke-width:1.25;stroke-dasharray:3 2.5;}
                  .vl-dztext{fill:hsl(20,82%,45%);font-family:ui-sans-serif,sans-serif;font-size:8px;font-weight:700;text-anchor:middle;}
                  .vl-cl{fill:hsl(220,9%,70%);}
                  .vl-ca{fill:hsl(0,0%,100%);stroke:hsl(20,82%,53%);stroke-width:1.5;}
                  .vl-cu{fill:hsl(220,30%,16%);stroke:hsl(0,0%,100%);stroke-width:0.6;}
                  .vl-po{fill:none;stroke:hsl(20,82%,53%);stroke-width:1.5;}
                  .vl-pg{fill:none;stroke:hsl(142,71%,45%);stroke-width:2;}
                  .vl-tp{fill:hsl(20,82%,53%);}
                  .vl-tt{fill:#fff;font-family:ui-sans-serif,sans-serif;font-size:8.5px;font-weight:700;text-anchor:middle;}
                  .vl-cf{fill:none;stroke:hsl(142,71%,45%);stroke-width:2;}
                  .vl-lb{fill:hsl(35,18%,58%);font-family:ui-sans-serif,sans-serif;font-size:7.5px;font-weight:700;text-anchor:middle;letter-spacing:0.08em;}
                  .vl-ac{animation:vl-card 10s cubic-bezier(0.4,0,0.2,1) infinite;}
                  .vl-au{animation:vl-cur 10s cubic-bezier(0.4,0,0.2,1) infinite;}
                  .vl-ad1{animation:vl-dz1 10s ease-in-out infinite;}
                  .vl-ad2{animation:vl-dz2 10s ease-in-out infinite;}
                  .vl-r92{animation:vl-r1992 10s ease-in-out infinite;}
                  .vl-r2k{animation:vl-r2000 10s ease-in-out infinite;}
                  .vl-at{animation:vl-tap 10s ease-in-out infinite;transform-box:fill-box;transform-origin:center;}
                  .vl-a1{animation:vl-p1 10s ease-out infinite;transform-box:fill-box;transform-origin:center;}
                  .vl-a2{animation:vl-p2 10s ease-out infinite;transform-box:fill-box;transform-origin:center;}
                  .vl-a3{animation:vl-p3 10s ease-out infinite;transform-box:fill-box;transform-origin:center;}
                  .vl-af{animation:vl-cf 10s ease-out infinite;transform-box:fill-box;transform-origin:center;}
                  .vl-ay{animation:vl-yr 10s ease-out infinite;transform-box:fill-box;transform-origin:center;}
                  @keyframes vl-card{
                    0%  {transform:translate(0,0);opacity:0;}
                    5%  {transform:translate(0,0);opacity:1;}
                    17% {transform:translate(0,0);opacity:1;}
                    38% {transform:translate(0,90px);opacity:1;}
                    46% {transform:translate(0,90px);opacity:1;}
                    58% {transform:translate(0,122px);opacity:1;}
                    93% {transform:translate(0,122px);opacity:1;}
                    99% {transform:translate(0,122px);opacity:0;}
                    100%{transform:translate(0,0);opacity:0;}
                  }
                  @keyframes vl-cur{
                    0%  {transform:translate(290px,44px);opacity:1;}
                    13% {transform:translate(212px,44px);opacity:1;}
                    17% {transform:translate(212px,44px);opacity:1;}
                    38% {transform:translate(212px,134px);opacity:1;}
                    46% {transform:translate(212px,134px);opacity:1;}
                    58% {transform:translate(212px,166px);opacity:1;}
                    65% {transform:translate(212px,166px);opacity:1;}
                    71% {transform:translate(150px,160px);opacity:1;}
                    93% {transform:translate(150px,160px);opacity:1;}
                    99% {transform:translate(150px,160px);opacity:0;}
                    100%{transform:translate(290px,44px);opacity:0;}
                  }
                  @keyframes vl-dz1{
                    0%,26%{opacity:0;}33%{opacity:1;}45%{opacity:1;}52%,100%{opacity:0;}
                  }
                  @keyframes vl-dz2{
                    0%,49%{opacity:0;}55%{opacity:1;}58%{opacity:1;}66%,100%{opacity:0;}
                  }
                  @keyframes vl-r1992{
                    0%,23%{transform:translate(0,0);}
                    36%{transform:translate(0,32px);}
                    46%{transform:translate(0,32px);}
                    54%{transform:translate(0,0);}
                    96%,100%{transform:translate(0,0);}
                  }
                  @keyframes vl-r2000{
                    0%,23%{transform:translate(0,0);}
                    36%,95%{transform:translate(0,32px);}
                    100%{transform:translate(0,0);}
                  }
                  @keyframes vl-tap{
                    0%,67%{transform:scale(0);opacity:0;}
                    71%{transform:scale(1);opacity:1;}
                    76%{transform:scale(1);opacity:1;}
                    79%{transform:scale(0.9);opacity:1;}
                    82%{transform:scale(1);opacity:1;}
                    93%{transform:scale(1);opacity:1;}
                    99%,100%{transform:scale(1);opacity:0;}
                  }
                  @keyframes vl-p1{
                    0%,11%{transform:scale(0);opacity:0;}14%{transform:scale(0.3);opacity:0.85;}
                    21%{transform:scale(7);opacity:0;}22%,100%{transform:scale(0);opacity:0;}
                  }
                  @keyframes vl-p2{
                    0%,55%{transform:scale(0);opacity:0;}58%{transform:scale(0.3);opacity:0.9;}
                    66%{transform:scale(9);opacity:0;}67%,100%{transform:scale(0);opacity:0;}
                  }
                  @keyframes vl-p3{
                    0%,76%{transform:scale(0);opacity:0;}79%{transform:scale(0.3);opacity:0.9;}
                    87%{transform:scale(9);opacity:0;}88%,100%{transform:scale(0);opacity:0;}
                  }
                  @keyframes vl-cf{
                    0%,77%{transform:scale(0.96);opacity:0;}81%{transform:scale(1);opacity:1;}
                    89%{transform:scale(1.08);opacity:0;}90%,100%{transform:scale(0.96);opacity:0;}
                  }
                  @keyframes vl-yr{
                    0%,85%{transform:scale(0);opacity:0;}89%{transform:scale(1.25);opacity:1;}
                    93%{transform:scale(1);opacity:1;}99%{transform:scale(1);opacity:0;}
                    100%{transform:scale(0);opacity:0;}
                  }
                `}</style>

                <rect className="vl-bg" x="0" y="0" width="280" height="285"/>

                <text className="vl-lb" x="154" y="80">BEFORE</text>
                <line x1="44" y1="77" x2="114" y2="77" stroke="hsl(35,18%,62%)" strokeWidth="0.75" strokeDasharray="2 2"/>
                <line x1="194" y1="77" x2="264" y2="77" stroke="hsl(35,18%,62%)" strokeWidth="0.75" strokeDasharray="2 2"/>

                <rect className="vl-gh" x="34" y="30" width="240" height="28" rx="5"/>

                <g className="vl-ad1">
                  <rect className="vl-dz" x="34" y="115" width="240" height="38" rx="4"/>
                  <text className="vl-dztext" x="154" y="138">Drop here</text>
                </g>
                <g className="vl-ad2">
                  <rect className="vl-dz" x="34" y="147" width="240" height="38" rx="4"/>
                  <text className="vl-dztext" x="154" y="170">Drop here</text>
                </g>

                <g transform="translate(0,88)">
                  <rect className="vl-rb" x="34" y="0" width="240" height="28" rx="5"/>
                  <rect className="vl-yr" x="6" y="5" width="24" height="18" rx="3"/>
                  <text className="vl-yt" x="18" y="17">1991</text>
                  <circle className="vl-bl" cx="49" cy="14" r="5"/>
                  <rect className="vl-rt" x="62" y="9" width="190" height="3" rx="1"/>
                  <rect className="vl-rt" x="62" y="16" width="150" height="3" rx="1"/>
                </g>

                <g transform="translate(0,120)">
                  <g className="vl-r92">
                    <rect className="vl-rb" x="34" y="0" width="240" height="28" rx="5"/>
                    <rect className="vl-yr" x="6" y="5" width="24" height="18" rx="3"/>
                    <text className="vl-yt" x="18" y="17">1992</text>
                    <circle className="vl-bl" cx="49" cy="14" r="5"/>
                    <rect className="vl-rt" x="62" y="9" width="170" height="3" rx="1"/>
                    <rect className="vl-rt" x="62" y="16" width="130" height="3" rx="1"/>
                  </g>
                </g>

                <g transform="translate(0,152)">
                  <g className="vl-r2k">
                    <rect className="vl-rb" x="34" y="0" width="240" height="28" rx="5"/>
                    <rect className="vl-yr" x="6" y="5" width="24" height="18" rx="3"/>
                    <text className="vl-yt" x="18" y="17">2000</text>
                    <circle className="vl-bl" cx="49" cy="14" r="5"/>
                    <rect className="vl-rt" x="62" y="9" width="180" height="3" rx="1"/>
                    <rect className="vl-rt" x="62" y="16" width="160" height="3" rx="1"/>
                  </g>
                </g>

                <g transform="translate(0,184)">
                  <g className="vl-r2k">
                    <rect className="vl-rb" x="34" y="0" width="240" height="28" rx="5"/>
                    <rect className="vl-yr" x="6" y="5" width="24" height="18" rx="3"/>
                    <text className="vl-yt" x="18" y="17">2002</text>
                    <circle className="vl-bl" cx="49" cy="14" r="5"/>
                    <rect className="vl-rt" x="62" y="9" width="160" height="3" rx="1"/>
                    <rect className="vl-rt" x="62" y="16" width="120" height="3" rx="1"/>
                  </g>
                </g>

                <g transform="translate(0,226)">
                  <g className="vl-r2k">
                    <line x1="44" y1="8" x2="114" y2="8" stroke="hsl(35,18%,62%)" strokeWidth="0.75" strokeDasharray="2 2"/>
                    <line x1="194" y1="8" x2="264" y2="8" stroke="hsl(35,18%,62%)" strokeWidth="0.75" strokeDasharray="2 2"/>
                    <text className="vl-lb" x="154" y="11">AFTER</text>
                  </g>
                </g>

                <rect className="vl-cf vl-af" x="34" y="147" width="240" height="38" rx="4" vectorEffect="non-scaling-stroke"/>

                <g className="vl-ac">
                  <rect className="vl-ca" x="34" y="30" width="240" height="28" rx="5"/>
                  <circle className="vl-bl" cx="49" cy="44" r="5"/>
                  <rect className="vl-cl" x="62" y="39" width="190" height="3" rx="1"/>
                  <rect className="vl-cl" x="62" y="46" width="160" height="3" rx="1"/>
                  <rect className="vl-cl" x="62" y="52" width="80" height="2.5" rx="1" opacity="0.7"/>
                  <g className="vl-ay">
                    <rect className="vl-yr" x="6" y="35" width="24" height="18" rx="3"/>
                    <text className="vl-yt" x="18" y="47">1996</text>
                  </g>
                </g>

                <g transform="translate(114,155)">
                  <g className="vl-at">
                    <rect className="vl-tp" x="0" y="0" width="80" height="18" rx="9"/>
                    <text className="vl-tt" x="40" y="12.5">Tap to place</text>
                  </g>
                </g>

                <g className="vl-au">
                  <circle className="vl-po vl-a1" cx="0" cy="0" r="2"/>
                  <circle className="vl-po vl-a2" cx="0" cy="0" r="2"/>
                  <circle className="vl-pg vl-a3" cx="0" cy="0" r="2"/>
                  <path className="vl-cu" d="M0,0 L0,12 L3.2,9 L5.4,13.6 L7.4,12.7 L5.2,8.2 L8.6,8.2 Z"/>
                </g>
              </svg>

              {/* DARK MODE */}
              <svg
                viewBox="0 0 280 285"
                xmlns="http://www.w3.org/2000/svg"
                className="w-full hidden dark:block"
                role="img"
                aria-label="Drag a card into the timeline and tap to place"
              >
                <style>{`
                  .vd-bg{fill:hsl(220,12%,11%);}
                  .vd-rb{fill:hsl(220,12%,28%);stroke:hsl(220,8%,35%);stroke-width:0.75;}
                  .vd-rt{fill:hsl(220,8%,50%);}
                  .vd-bl{fill:hsl(20,82%,55%);}
                  .vd-yr{fill:hsl(45,75%,55%);}
                  .vd-yt{fill:hsl(45,30%,12%);font-family:ui-monospace,monospace;font-size:8px;font-weight:700;text-anchor:middle;}
                  .vd-gh{fill:none;stroke:hsl(20,82%,55%);stroke-width:2;stroke-dasharray:3 2.5;opacity:0.65;}
                  .vd-dz{fill:hsl(20,82%,55%,0.12);stroke:hsl(20,82%,55%);stroke-width:1.25;stroke-dasharray:3 2.5;}
                  .vd-dztext{fill:hsl(20,82%,60%);font-family:ui-sans-serif,sans-serif;font-size:8px;font-weight:700;text-anchor:middle;}
                  .vd-cl{fill:hsl(220,8%,55%);}
                  .vd-ca{fill:hsl(220,12%,28%);stroke:hsl(20,82%,55%);stroke-width:1.5;}
                  .vd-cu{fill:hsl(220,10%,95%);stroke:hsl(220,12%,11%);stroke-width:0.6;}
                  .vd-po{fill:none;stroke:hsl(20,82%,55%);stroke-width:1.5;}
                  .vd-pg{fill:none;stroke:hsl(142,76%,50%);stroke-width:2;}
                  .vd-tp{fill:hsl(20,82%,55%);}
                  .vd-tt{fill:#fff;font-family:ui-sans-serif,sans-serif;font-size:8.5px;font-weight:700;text-anchor:middle;}
                  .vd-cf{fill:none;stroke:hsl(142,76%,50%);stroke-width:2;}
                  .vd-lb{fill:hsl(220,8%,50%);font-family:ui-sans-serif,sans-serif;font-size:7.5px;font-weight:700;text-anchor:middle;letter-spacing:0.08em;}
                  .vd-ac{animation:vd-card 10s cubic-bezier(0.4,0,0.2,1) infinite;}
                  .vd-au{animation:vd-cur 10s cubic-bezier(0.4,0,0.2,1) infinite;}
                  .vd-ad1{animation:vd-dz1 10s ease-in-out infinite;}
                  .vd-ad2{animation:vd-dz2 10s ease-in-out infinite;}
                  .vd-r92{animation:vd-r1992 10s ease-in-out infinite;}
                  .vd-r2k{animation:vd-r2000 10s ease-in-out infinite;}
                  .vd-at{animation:vd-tap 10s ease-in-out infinite;transform-box:fill-box;transform-origin:center;}
                  .vd-a1{animation:vd-p1 10s ease-out infinite;transform-box:fill-box;transform-origin:center;}
                  .vd-a2{animation:vd-p2 10s ease-out infinite;transform-box:fill-box;transform-origin:center;}
                  .vd-a3{animation:vd-p3 10s ease-out infinite;transform-box:fill-box;transform-origin:center;}
                  .vd-af{animation:vd-cf 10s ease-out infinite;transform-box:fill-box;transform-origin:center;}
                  .vd-ay{animation:vd-yr 10s ease-out infinite;transform-box:fill-box;transform-origin:center;}
                  @keyframes vd-card{
                    0%  {transform:translate(0,0);opacity:0;}
                    5%  {transform:translate(0,0);opacity:1;}
                    17% {transform:translate(0,0);opacity:1;}
                    38% {transform:translate(0,90px);opacity:1;}
                    46% {transform:translate(0,90px);opacity:1;}
                    58% {transform:translate(0,122px);opacity:1;}
                    93% {transform:translate(0,122px);opacity:1;}
                    99% {transform:translate(0,122px);opacity:0;}
                    100%{transform:translate(0,0);opacity:0;}
                  }
                  @keyframes vd-cur{
                    0%  {transform:translate(290px,44px);opacity:1;}
                    13% {transform:translate(212px,44px);opacity:1;}
                    17% {transform:translate(212px,44px);opacity:1;}
                    38% {transform:translate(212px,134px);opacity:1;}
                    46% {transform:translate(212px,134px);opacity:1;}
                    58% {transform:translate(212px,166px);opacity:1;}
                    65% {transform:translate(212px,166px);opacity:1;}
                    71% {transform:translate(150px,160px);opacity:1;}
                    93% {transform:translate(150px,160px);opacity:1;}
                    99% {transform:translate(150px,160px);opacity:0;}
                    100%{transform:translate(290px,44px);opacity:0;}
                  }
                  @keyframes vd-dz1{
                    0%,26%{opacity:0;}33%{opacity:1;}45%{opacity:1;}52%,100%{opacity:0;}
                  }
                  @keyframes vd-dz2{
                    0%,49%{opacity:0;}55%{opacity:1;}58%{opacity:1;}66%,100%{opacity:0;}
                  }
                  @keyframes vd-r1992{
                    0%,23%{transform:translate(0,0);}
                    36%{transform:translate(0,32px);}
                    46%{transform:translate(0,32px);}
                    54%{transform:translate(0,0);}
                    96%,100%{transform:translate(0,0);}
                  }
                  @keyframes vd-r2000{
                    0%,23%{transform:translate(0,0);}
                    36%,95%{transform:translate(0,32px);}
                    100%{transform:translate(0,0);}
                  }
                  @keyframes vd-tap{
                    0%,67%{transform:scale(0);opacity:0;}
                    71%{transform:scale(1);opacity:1;}
                    76%{transform:scale(1);opacity:1;}
                    79%{transform:scale(0.9);opacity:1;}
                    82%{transform:scale(1);opacity:1;}
                    93%{transform:scale(1);opacity:1;}
                    99%,100%{transform:scale(1);opacity:0;}
                  }
                  @keyframes vd-p1{
                    0%,11%{transform:scale(0);opacity:0;}14%{transform:scale(0.3);opacity:0.85;}
                    21%{transform:scale(7);opacity:0;}22%,100%{transform:scale(0);opacity:0;}
                  }
                  @keyframes vd-p2{
                    0%,55%{transform:scale(0);opacity:0;}58%{transform:scale(0.3);opacity:0.9;}
                    66%{transform:scale(9);opacity:0;}67%,100%{transform:scale(0);opacity:0;}
                  }
                  @keyframes vd-p3{
                    0%,76%{transform:scale(0);opacity:0;}79%{transform:scale(0.3);opacity:0.9;}
                    87%{transform:scale(9);opacity:0;}88%,100%{transform:scale(0);opacity:0;}
                  }
                  @keyframes vd-cf{
                    0%,77%{transform:scale(0.96);opacity:0;}81%{transform:scale(1);opacity:1;}
                    89%{transform:scale(1.08);opacity:0;}90%,100%{transform:scale(0.96);opacity:0;}
                  }
                  @keyframes vd-yr{
                    0%,85%{transform:scale(0);opacity:0;}89%{transform:scale(1.25);opacity:1;}
                    93%{transform:scale(1);opacity:1;}99%{transform:scale(1);opacity:0;}
                    100%{transform:scale(0);opacity:0;}
                  }
                `}</style>

                <rect className="vd-bg" x="0" y="0" width="280" height="285"/>

                <text className="vd-lb" x="154" y="80">BEFORE</text>
                <line x1="44" y1="77" x2="114" y2="77" stroke="hsl(220,8%,38%)" strokeWidth="0.75" strokeDasharray="2 2"/>
                <line x1="194" y1="77" x2="264" y2="77" stroke="hsl(220,8%,38%)" strokeWidth="0.75" strokeDasharray="2 2"/>

                <rect className="vd-gh" x="34" y="30" width="240" height="28" rx="5"/>

                <g className="vd-ad1">
                  <rect className="vd-dz" x="34" y="115" width="240" height="38" rx="4"/>
                  <text className="vd-dztext" x="154" y="138">Drop here</text>
                </g>
                <g className="vd-ad2">
                  <rect className="vd-dz" x="34" y="147" width="240" height="38" rx="4"/>
                  <text className="vd-dztext" x="154" y="170">Drop here</text>
                </g>

                <g transform="translate(0,88)">
                  <rect className="vd-rb" x="34" y="0" width="240" height="28" rx="5"/>
                  <rect className="vd-yr" x="6" y="5" width="24" height="18" rx="3"/>
                  <text className="vd-yt" x="18" y="17">1991</text>
                  <circle className="vd-bl" cx="49" cy="14" r="5"/>
                  <rect className="vd-rt" x="62" y="9" width="190" height="3" rx="1"/>
                  <rect className="vd-rt" x="62" y="16" width="150" height="3" rx="1"/>
                </g>

                <g transform="translate(0,120)">
                  <g className="vd-r92">
                    <rect className="vd-rb" x="34" y="0" width="240" height="28" rx="5"/>
                    <rect className="vd-yr" x="6" y="5" width="24" height="18" rx="3"/>
                    <text className="vd-yt" x="18" y="17">1992</text>
                    <circle className="vd-bl" cx="49" cy="14" r="5"/>
                    <rect className="vd-rt" x="62" y="9" width="170" height="3" rx="1"/>
                    <rect className="vd-rt" x="62" y="16" width="130" height="3" rx="1"/>
                  </g>
                </g>

                <g transform="translate(0,152)">
                  <g className="vd-r2k">
                    <rect className="vd-rb" x="34" y="0" width="240" height="28" rx="5"/>
                    <rect className="vd-yr" x="6" y="5" width="24" height="18" rx="3"/>
                    <text className="vd-yt" x="18" y="17">2000</text>
                    <circle className="vd-bl" cx="49" cy="14" r="5"/>
                    <rect className="vd-rt" x="62" y="9" width="180" height="3" rx="1"/>
                    <rect className="vd-rt" x="62" y="16" width="160" height="3" rx="1"/>
                  </g>
                </g>

                <g transform="translate(0,184)">
                  <g className="vd-r2k">
                    <rect className="vd-rb" x="34" y="0" width="240" height="28" rx="5"/>
                    <rect className="vd-yr" x="6" y="5" width="24" height="18" rx="3"/>
                    <text className="vd-yt" x="18" y="17">2002</text>
                    <circle className="vd-bl" cx="49" cy="14" r="5"/>
                    <rect className="vd-rt" x="62" y="9" width="160" height="3" rx="1"/>
                    <rect className="vd-rt" x="62" y="16" width="120" height="3" rx="1"/>
                  </g>
                </g>

                <g transform="translate(0,226)">
                  <g className="vd-r2k">
                    <line x1="44" y1="8" x2="114" y2="8" stroke="hsl(220,8%,38%)" strokeWidth="0.75" strokeDasharray="2 2"/>
                    <line x1="194" y1="8" x2="264" y2="8" stroke="hsl(220,8%,38%)" strokeWidth="0.75" strokeDasharray="2 2"/>
                    <text className="vd-lb" x="154" y="11">AFTER</text>
                  </g>
                </g>

                <rect className="vd-cf vd-af" x="34" y="147" width="240" height="38" rx="4" vectorEffect="non-scaling-stroke"/>

                <g className="vd-ac">
                  <rect className="vd-ca" x="34" y="30" width="240" height="28" rx="5"/>
                  <circle className="vd-bl" cx="49" cy="44" r="5"/>
                  <rect className="vd-cl" x="62" y="39" width="190" height="3" rx="1"/>
                  <rect className="vd-cl" x="62" y="46" width="160" height="3" rx="1"/>
                  <rect className="vd-cl" x="62" y="52" width="80" height="2.5" rx="1" opacity="0.7"/>
                  <g className="vd-ay">
                    <rect className="vd-yr" x="6" y="35" width="24" height="18" rx="3"/>
                    <text className="vd-yt" x="18" y="47">1996</text>
                  </g>
                </g>

                <g transform="translate(114,155)">
                  <g className="vd-at">
                    <rect className="vd-tp" x="0" y="0" width="80" height="18" rx="9"/>
                    <text className="vd-tt" x="40" y="12.5">Tap to place</text>
                  </g>
                </g>

                <g className="vd-au">
                  <circle className="vd-po vd-a1" cx="0" cy="0" r="2"/>
                  <circle className="vd-po vd-a2" cx="0" cy="0" r="2"/>
                  <circle className="vd-pg vd-a3" cx="0" cy="0" r="2"/>
                  <path className="vd-cu" d="M0,0 L0,12 L3.2,9 L5.4,13.6 L7.4,12.7 L5.2,8.2 L8.6,8.2 Z"/>
                </g>
              </svg>
            </div>
          </div>

          {/* Instructions */}
          <div className="space-y-2 sm:space-y-3 text-left mb-4 sm:mb-6">
            <div className="flex items-start gap-2 sm:gap-3">
              <span className="flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-accent text-accent-foreground font-display font-bold text-[11px] sm:text-sm flex items-center justify-center">
                1
              </span>
              <p className="text-foreground text-xs sm:text-sm">Grab an event card from the top of the screen.</p>
            </div>
            <div className="flex items-start gap-2 sm:gap-3">
              <span className="flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-accent text-accent-foreground font-display font-bold text-[11px] sm:text-sm flex items-center justify-center">
                2
              </span>
              <p className="text-foreground text-xs sm:text-sm">
                Drag it into the timeline where you think it belongs chronologically.
              </p>
            </div>
            <div className="flex items-start gap-2 sm:gap-3">
              <span className="flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-accent text-accent-foreground font-display font-bold text-[11px] sm:text-sm flex items-center justify-center">
                3
              </span>
              <p className="text-foreground text-xs sm:text-sm">
                Press 'Tap to Place' when you're ready to lock it in! Incorrect events are automatically moved to the
                correct place in the timeline.
              </p>
            </div>
            <div className="flex items-start gap-2 sm:gap-3">
              <span className="flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-accent text-accent-foreground font-display font-bold text-[11px] sm:text-sm flex items-center justify-center">
                4
              </span>
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
