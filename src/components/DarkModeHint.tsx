export function DarkModeHint() {
  return (
    <div className="absolute top-3 right-14 md:top-4 md:right-16 z-10 pointer-events-none select-none animate-fade-in">
      <div className="relative flex items-center gap-1">
        {/* Handwritten text */}
        <span 
          className="text-muted-foreground/70 text-sm md:text-base whitespace-nowrap"
          style={{ 
            fontFamily: "'Caveat', cursive",
            transform: 'rotate(-6deg)',
            display: 'inline-block',
          }}
        >
          try dark mode!
        </span>
        
        {/* Simple arrow pointing right */}
        <svg 
          className="w-6 h-6 text-muted-foreground/70 -mt-1"
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M5 12h14M14 6l6 6-6 6" />
        </svg>
      </div>
    </div>
  );
}
