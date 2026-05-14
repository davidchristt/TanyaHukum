"use client";

import { useState, useEffect } from "react";

export default function AnimatedBackground() {
  const [mounted, setMounted] = useState(false);
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    setMounted(true);
    // Generate particles ONLY on client side to avoid hydration mismatch
    const generated = [...Array(6)].map((_, i) => ({
      width: `${Math.random() * 300 + 100}px`,
      height: `${Math.random() * 300 + 100}px`,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      animationDelay: `${i * 2}s`,
      animationDuration: `${Math.random() * 10 + 15}s`,
    }));
    setParticles(generated);
  }, []);

  return (
    <div className="fixed inset-0 -z-50 overflow-hidden bg-[#f8fbff] dark:bg-[#0b1120] transition-colors duration-500">
      {/* Dynamic Gradient Shifting */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(47,111,237,0.05),transparent_70%)] animate-pulse"></div>
      
      {/* Central Glowing Blur */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-blue-100/30 dark:bg-blue-900/10 rounded-full blur-[120px] animate-pulse transition-colors duration-500"></div>

      {/* Abstract Hexagon Pattern (Subtle) */}
      <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.01]" 
           style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/carbon-fibre.png")' }}>
      </div>

      {/* Floating Particles - Only rendered after mount to prevent SSR mismatch */}
      <div className="absolute inset-0 pointer-events-none">
        {mounted && particles.map((style, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-blue-400/10 dark:bg-blue-500/5 blur-xl animate-float transition-colors duration-500"
            style={style}
          ></div>
        ))}
      </div>

      <style jsx global>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) translateX(0) scale(1); }
          33% { transform: translateY(-20px) translateX(10px) scale(1.05); }
          66% { transform: translateY(10px) translateX(-15px) scale(0.95); }
        }
        .animate-float {
          animation: float linear infinite;
        }
      `}</style>
    </div>
  );
}
