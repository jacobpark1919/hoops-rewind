import { useState, useEffect } from "react";
import { X } from "lucide-react";
import dragHintImage from "@/assets/drag-hint.png";

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
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-200 ${
        isVisible ? 'bg-black/50' : 'bg-black/0'
      }`}
      onClick={handleClose}
    >
      <div 
        className={`relative bg-card border border-border rounded-2xl p-6 max-w-sm w-full shadow-2xl transition-all duration-200 ${
          isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 p-1 rounded-full hover:bg-muted transition-colors"
        >
          <X className="w-5 h-5 text-muted-foreground" />
        </button>

        {/* Content */}
        <div className="text-center">
          <h2 className="font-display text-2xl font-bold text-foreground mb-2">
            How to Play
          </h2>
          
          {/* Drag illustration */}
          <div className="my-6 flex justify-center">
            <div className="w-32 h-32 rounded-xl overflow-hidden bg-muted/30">
              <img 
                src={dragHintImage} 
                alt="Drag cards to reorder" 
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Instructions */}
          <div className="space-y-3 text-left mb-6">
            <div className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground font-display font-bold text-sm flex items-center justify-center">1</span>
              <p className="text-foreground text-sm">Drag each event card into the timeline</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground font-display font-bold text-sm flex items-center justify-center">2</span>
              <p className="text-foreground text-sm">Place it where you think it belongs chronologically</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground font-display font-bold text-sm flex items-center justify-center">3</span>
              <p className="text-foreground text-sm">You have 3 lives — place all 8 events to win!</p>
            </div>
          </div>

          {/* Start button */}
          <button
            onClick={handleClose}
            className="w-full py-3 px-6 bg-primary text-primary-foreground font-display font-bold rounded-xl transition-all duration-200 hover:opacity-90 hover:scale-[1.02]"
          >
            Let's Go!
          </button>
        </div>
      </div>
    </div>
  );
}
