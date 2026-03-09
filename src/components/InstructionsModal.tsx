import { useState, useEffect, useRef } from "react";
import { X } from "lucide-react";
import dragHintVideo from "@/assets/drag-hint.mp4";

// Preload video globally so it's cached before modal opens
const preloadLink = document.createElement("link");
preloadLink.rel = "preload";
preloadLink.as = "video";
preloadLink.href = dragHintVideo;
document.head.appendChild(preloadLink);

interface InstructionsModalProps {
  onClose: () => void;
}

export function InstructionsModal({ onClose }: InstructionsModalProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [videoReady, setVideoReady] = useState(false);

  useEffect(() => {
    setTimeout(() => setIsVisible(true), 50);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 200);
  };

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 transition-all duration-200 ${
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
          
          {/* Drag illustration */}
          <div className="my-2 sm:my-6 flex justify-center">
            <div className="w-full rounded-lg sm:rounded-xl overflow-hidden bg-muted/30 relative" style={{ aspectRatio: '16/9' }}>
              {!videoReady && (
                <div className="absolute inset-0 bg-muted animate-pulse rounded-lg sm:rounded-xl" />
              )}
              <video
                src={dragHintVideo}
                autoPlay
                loop
                muted
                playsInline
                preload="auto"
                onCanPlay={() => setVideoReady(true)}
                className={`w-full block object-cover transition-opacity duration-150 ${videoReady ? 'opacity-100' : 'opacity-0'}`}
              />
            </div>
          </div>

          {/* Instructions */}
          <div className="space-y-2 sm:space-y-3 text-left mb-4 sm:mb-6">
            <div className="flex items-start gap-2 sm:gap-3">
              <span className="flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-primary text-primary-foreground font-display font-bold text-[11px] sm:text-sm flex items-center justify-center">1</span>
              <p className="text-foreground text-xs sm:text-sm">Drag each event card into the timeline</p>
            </div>
            <div className="flex items-start gap-2 sm:gap-3">
              <span className="flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-primary text-primary-foreground font-display font-bold text-[11px] sm:text-sm flex items-center justify-center">2</span>
              <p className="text-foreground text-xs sm:text-sm">Place it where you think it belongs chronologically</p>
            </div>
            <div className="flex items-start gap-2 sm:gap-3">
              <span className="flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-primary text-primary-foreground font-display font-bold text-[11px] sm:text-sm flex items-center justify-center">3</span>
              <p className="text-foreground text-xs sm:text-sm">Daily game — come back tomorrow for a new puzzle!</p>
            </div>
          </div>

          {/* Start button */}
          <button
            onClick={handleClose}
            className="w-full py-2.5 sm:py-3 px-4 sm:px-6 bg-primary text-primary-foreground font-display font-bold text-sm sm:text-base rounded-lg sm:rounded-xl transition-all duration-200 hover:opacity-90 hover:scale-[1.02]"
          >
            Let's Go!
          </button>
        </div>
      </div>
    </div>
  );
}
