import { useEffect, useRef, useState } from "react";

interface YearParticle {
  id: string;
  year: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
}

const YEARS = ["1985", "1972", "2008", "1996", "1954", "2019", "1967", "2003"];
const PARTICLE_SPEED = 2.5;
const BOUNCE_DAMPENING = 0.95;

export function FloatingYears() {
  const containerRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<YearParticle[]>([]);
  const animationRef = useRef<number>();
  const [particles, setParticles] = useState<YearParticle[]>([]);
  const initializedRef = useRef(false);

  // Initialize particles with random positions and velocities
  useEffect(() => {
    if (initializedRef.current || !containerRef.current) return;
    
    const container = containerRef.current;
    const rect = container.getBoundingClientRect();
    
    // Estimate particle size based on font size (smaller now)
    const isMobile = window.innerWidth < 768;
    const estimatedWidth = isMobile ? 120 : 170;
    const estimatedHeight = isMobile ? 50 : 75;
    
    // Create safe zone in the center for the card (roughly 400x500 area)
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const safeZoneWidth = 420;
    const safeZoneHeight = 520;
    
    const initialParticles: YearParticle[] = YEARS.map((year, index) => {
      // Place particles around the edges, avoiding center
      let x: number, y: number;
      const edge = index % 4;
      const padding = 20;
      
      switch (edge) {
        case 0: // Top edge
          x = padding + Math.random() * (rect.width - estimatedWidth - padding * 2);
          y = padding + Math.random() * (centerY - safeZoneHeight / 2 - estimatedHeight - padding);
          break;
        case 1: // Right edge
          x = centerX + safeZoneWidth / 2 + Math.random() * (rect.width - centerX - safeZoneWidth / 2 - estimatedWidth - padding);
          y = padding + Math.random() * (rect.height - estimatedHeight - padding * 2);
          break;
        case 2: // Bottom edge
          x = padding + Math.random() * (rect.width - estimatedWidth - padding * 2);
          y = centerY + safeZoneHeight / 2 + Math.random() * (rect.height - centerY - safeZoneHeight / 2 - estimatedHeight - padding);
          break;
        case 3: // Left edge
        default:
          x = padding + Math.random() * (centerX - safeZoneWidth / 2 - estimatedWidth - padding);
          y = padding + Math.random() * (rect.height - estimatedHeight - padding * 2);
          break;
      }
      
      // Random velocity direction
      const angle = Math.random() * Math.PI * 2;
      const speed = PARTICLE_SPEED * (0.5 + Math.random() * 0.5);
      
      return {
        id: `${year}-${index}`,
        year,
        x: Math.max(padding, Math.min(x, rect.width - estimatedWidth - padding)),
        y: Math.max(padding, Math.min(y, rect.height - estimatedHeight - padding)),
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        width: estimatedWidth,
        height: estimatedHeight,
      };
    });
    
    particlesRef.current = initialParticles;
    setParticles(initialParticles);
    initializedRef.current = true;
  }, []);

  // Animation loop with collision detection
  useEffect(() => {
    if (!containerRef.current) return;
    
    const container = containerRef.current;
    
    const animate = () => {
      const rect = container.getBoundingClientRect();
      const particles = particlesRef.current;
      
      // Update positions
      for (const particle of particles) {
        particle.x += particle.vx;
        particle.y += particle.vy;
        
        // Wall collisions
        if (particle.x <= 0) {
          particle.x = 0;
          particle.vx = Math.abs(particle.vx) * BOUNCE_DAMPENING;
        } else if (particle.x + particle.width >= rect.width) {
          particle.x = rect.width - particle.width;
          particle.vx = -Math.abs(particle.vx) * BOUNCE_DAMPENING;
        }
        
        if (particle.y <= 0) {
          particle.y = 0;
          particle.vy = Math.abs(particle.vy) * BOUNCE_DAMPENING;
        } else if (particle.y + particle.height >= rect.height) {
          particle.y = rect.height - particle.height;
          particle.vy = -Math.abs(particle.vy) * BOUNCE_DAMPENING;
        }
        
        // Maintain minimum speed
        const speed = Math.sqrt(particle.vx ** 2 + particle.vy ** 2);
        if (speed < PARTICLE_SPEED * 0.3) {
          const angle = Math.atan2(particle.vy, particle.vx);
          particle.vx = Math.cos(angle) * PARTICLE_SPEED * 0.5;
          particle.vy = Math.sin(angle) * PARTICLE_SPEED * 0.5;
        }
      }
      
      // Particle-particle collisions
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i];
          const b = particles[j];
          
          // Check AABB collision
          const overlapX = Math.min(a.x + a.width, b.x + b.width) - Math.max(a.x, b.x);
          const overlapY = Math.min(a.y + a.height, b.y + b.height) - Math.max(a.y, b.y);
          
          if (overlapX > 0 && overlapY > 0) {
            // Collision detected - separate and bounce
            const centerAX = a.x + a.width / 2;
            const centerAY = a.y + a.height / 2;
            const centerBX = b.x + b.width / 2;
            const centerBY = b.y + b.height / 2;
            
            const dx = centerBX - centerAX;
            const dy = centerBY - centerAY;
            const dist = Math.sqrt(dx * dx + dy * dy) || 1;
            
            // Normalize direction
            const nx = dx / dist;
            const ny = dy / dist;
            
            // Separate particles
            const separation = Math.min(overlapX, overlapY) / 2 + 1;
            a.x -= nx * separation;
            a.y -= ny * separation;
            b.x += nx * separation;
            b.y += ny * separation;
            
            // Swap velocity components along collision axis
            const relVelX = a.vx - b.vx;
            const relVelY = a.vy - b.vy;
            const relVelDotN = relVelX * nx + relVelY * ny;
            
            a.vx -= relVelDotN * nx * BOUNCE_DAMPENING;
            a.vy -= relVelDotN * ny * BOUNCE_DAMPENING;
            b.vx += relVelDotN * nx * BOUNCE_DAMPENING;
            b.vy += relVelDotN * ny * BOUNCE_DAMPENING;
          }
        }
      }
      
      setParticles([...particles]);
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animationRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <div 
      ref={containerRef} 
      className="absolute inset-0 pointer-events-none select-none overflow-hidden"
    >
      {particles.map((particle) => (
        <span
          key={particle.id}
          className="absolute text-[3rem] md:text-[4.5rem] font-display font-bold text-muted-foreground/10 leading-none transition-none"
          style={{
            transform: `translate(${particle.x}px, ${particle.y}px)`,
            willChange: 'transform',
          }}
        >
          {particle.year}
        </span>
      ))}
    </div>
  );
}
