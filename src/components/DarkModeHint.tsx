export function DarkModeHint() {
  return (
    <div className="absolute top-16 right-16 md:top-14 md:right-20 z-10 pointer-events-none select-none animate-fade-in">
      <div className="relative">
        {/* Handwritten text */}
        <span 
          className="text-muted-foreground/70 text-sm md:text-base whitespace-nowrap"
          style={{ 
            fontFamily: "'Caveat', cursive",
            transform: 'rotate(-8deg)',
            display: 'inline-block',
          }}
        >
          try dark mode!
        </span>
        
        {/* Hand-drawn arrow pointing up-right */}
        <svg 
          className="absolute -top-6 right-0 w-8 h-8 text-muted-foreground/70"
          viewBox="0 0 32 32" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ transform: 'rotate(15deg)' }}
        >
          {/* Curved arrow path */}
          <path d="M20 24 C 16 20, 14 14, 16 8" />
          {/* Arrow head */}
          <path d="M12 10 L 16 6 L 20 10" />
        </svg>
      </div>
    </div>
  );
}
