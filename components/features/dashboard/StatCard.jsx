"use client";

import { useState, useEffect } from "react";

export default function StatCard({ title, value, growth, icon: Icon }) {
  const [displayValue, setDisplayValue] = useState(0);

  // Animated counting effect
  useEffect(() => {
    const target = parseInt(value) || 0;
    const duration = 1200; // slightly slower for premium feel
    const start = 0;
    const increment = target / (duration / 16);
    
    let current = start;
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        setDisplayValue(target);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.floor(current));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [value]);

  return (
    <div className="group relative overflow-hidden rounded-[2rem] p-8 text-white shadow-lg transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl bg-gradient-to-br from-blue-700 via-blue-600 to-blue-500">
      
      {/* Premium glass-morphism background elements */}
      <div className="absolute -right-6 -top-6 h-32 w-32 rounded-full bg-white/10 blur-3xl transition-all duration-700 group-hover:scale-150 group-hover:bg-white/20" />
      <div className="absolute -left-10 -bottom-10 h-32 w-32 rounded-full bg-blue-400/20 blur-3xl" />
      
      <div className="relative z-10 flex flex-col h-full justify-between">
        <div className="flex items-center justify-between mb-8">
          <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-xl border border-white/10 shadow-inner">
            {Icon ? <Icon className="w-6 h-6" /> : (
               <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5V2a1 1 0 112 0v5a1 1 0 01-1 1h-5z" clipRule="evenodd" />
                <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
              </svg>
            )}
          </div>
          
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/20 rounded-xl backdrop-blur-md text-[10px] font-black uppercase tracking-widest border border-white/10">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-200 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-100"></span>
            </span>
            Aktif
          </div>
        </div>

        <div className="mb-6">
          <p className="text-xs font-black text-blue-100/70 uppercase tracking-widest mb-2">
            {title}
          </p>
          <h2 className="text-5xl font-black tracking-tighter">
            {displayValue.toLocaleString()}
          </h2>
        </div>

        <div className="flex items-center gap-3">
          {growth ? (
            <div className="flex items-center gap-1 bg-white/20 text-white px-2.5 py-1 rounded-lg text-[11px] font-black border border-white/10">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
              {growth}
            </div>
          ) : (
             <div className="text-[10px] font-black text-blue-200 uppercase tracking-widest bg-blue-800/40 px-2 py-1 rounded-lg border border-blue-400/20">
                Live Analysis
             </div>
          )}
          <span className="text-[10px] text-blue-100/50 font-black uppercase tracking-tighter opacity-0 group-hover:opacity-100 transition-all duration-300">
            Insight Real-time
          </span>
        </div>
      </div>
    </div>
  );
}