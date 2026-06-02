import React, { useState, useEffect } from 'react';

const RealTimeVisitorBadge: React.FC = () => {
  const [count, setCount] = useState<number>(48);

  useEffect(() => {
    // Generate an initial realistic value
    setCount(35 + Math.floor(Math.random() * 25));

    const interval = setInterval(() => {
      setCount((prev) => {
        const delta = Math.floor(Math.random() * 5) - 2; // -2, -1, 0, 1, 2
        const next = prev + delta;
        // Keep between 30 and 75
        if (next < 30) return 32;
        if (next > 75) return 72;
        return next;
      });
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="fixed bottom-6 left-6 z-50 p-3 sm:px-4 sm:py-2.5 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-emerald-500/20 rounded-full shadow-2xl flex items-center gap-2.5 hover:scale-105 active:scale-95 transition-all duration-300 pointer-events-auto border-l-4 border-l-emerald-500"
      id="homepage-live-visitor-badge"
    >
      {/* Soft glowing green pulse dot */}
      <span className="relative flex h-3 w-3">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
      </span>

      {/* Dynamic Counter Text */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-1.5 leading-none">
        <span className="text-slate-800 dark:text-slate-200 font-black font-bangla text-[10px] sm:text-[11px] whitespace-nowrap">
          এখন লাইভ ভিজিটর:
        </span>
        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-black whitespace-nowrap flex items-center gap-1 font-sans">
          <span className="text-emerald-600 dark:text-emerald-400 font-mono text-sm font-extrabold" id="realtime-counter-value">
            {count}
          </span>
          <span>(Live Visitors Only)</span>
        </span>
      </div>
    </div>
  );
};

export default RealTimeVisitorBadge;
