import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function Preloader() {
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Progress counter animation
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        // Increment by random values to make it feel natural
        const next = prev + Math.floor(Math.random() * 15) + 5;
        return next > 100 ? 100 : next;
      });
    }, 120);

    // Fade out load state after 1.8s
    const timeout = setTimeout(() => {
      setLoading(false);
    }, 2000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, []);

  return (
    <AnimatePresence>
      {loading && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ 
            opacity: 0,
            y: -40,
            transition: { duration: 0.8, ease: [0.76, 0, 0.24, 1] } 
          }}
          className="fixed inset-0 z-[9999] bg-[#080809] flex flex-col items-center justify-center text-[#F0EDE6]"
        >
          {/* Background grain */}
          <div className="absolute inset-0 pointer-events-none opacity-[0.03] mix-blend-overlay" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")", backgroundSize: "200px" }} />

          <div className="relative flex flex-col items-center gap-6 max-w-xs w-full px-6">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="flex items-center gap-2"
            >
              <span className="font-display text-4xl font-bold tracking-tight text-white">RepOne</span>
              <span className="text-[#BEFF00] text-[8px] uppercase tracking-widest px-1.5 py-0.5 bg-[#BEFF00]/10 border border-[#BEFF00]/25 rounded font-sans font-bold">DEMO</span>
            </motion.div>

            {/* Circular Indicator */}
            <div className="relative w-24 h-24 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  className="stroke-white/5"
                  strokeWidth="3"
                  fill="transparent"
                />
                <motion.circle
                  cx="50"
                  cy="50"
                  r="42"
                  className="stroke-[#BEFF00]"
                  strokeWidth="3"
                  fill="transparent"
                  strokeDasharray="264"
                  strokeDashoffset={264 - (264 * progress) / 100}
                  transition={{ ease: "easeOut" }}
                />
              </svg>
              <div className="absolute font-display text-lg font-bold text-white">
                {progress}%
              </div>
            </div>

            <div className="space-y-1 text-center">
              <span className="text-[9px] uppercase tracking-[0.25em] text-[#BEFF00]/80 font-semibold font-sans block animate-pulse">
                Powering XYZ Fitness
              </span>
              <span className="text-[10px] text-[#F0EDE6]/30 font-sans block">
                Loading sandbox environment...
              </span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
