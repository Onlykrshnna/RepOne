import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const LOADING_STEPS = [
  { range: [0, 20], text: "INITIALIZING REPO CONTEXT..." },
  { range: [21, 45], text: "COMPILING WEBFORGE PRESETS..." },
  { range: [46, 70], text: "ESTABLISHING PAYMENT ROUTER..." },
  { range: [71, 90], text: "SYNCING WHITE-LABEL ASSETS..." },
  { range: [91, 100], text: "REPONE CORE ENGAGED." },
];

export function Preloader() {
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [activeLog, setActiveLog] = useState("");

  useEffect(() => {
    // Progress counter animation
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        const next = prev + Math.floor(Math.random() * 10) + 3;
        return next > 100 ? 100 : next;
      });
    }, 80);

    // Fade out load state after progress is 100%
    return () => {
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    const currentStep = LOADING_STEPS.find(
      (step) => progress >= step.range[0] && progress <= step.range[1]
    );
    if (currentStep) {
      setActiveLog(currentStep.text);
    }

    if (progress >= 100) {
      const timeout = setTimeout(() => {
        setLoading(false);
      }, 600);
      return () => clearTimeout(timeout);
    }
  }, [progress]);

  return (
    <AnimatePresence>
      {loading && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{
            opacity: 0,
            transition: { duration: 0.8, ease: [0.76, 0, 0.24, 1] },
          }}
          className="fixed inset-0 z-[9999] bg-[#080809] flex flex-col justify-between p-8 md:p-16 text-[#F0EDE6] select-none"
        >
          {/* Subtle Grid Overlay */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] bg-[size:40px_40px]" />
          
          {/* Neon Scanner Sweep Line */}
          <motion.div
            initial={{ y: "-100%" }}
            animate={{ y: "100%" }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#BEFF00]/20 to-transparent pointer-events-none"
          />

          {/* Top Row: System Status */}
          <div className="relative z-10 flex items-center justify-between w-full">
            <div className="flex items-center gap-3">
              <span className="font-display tracking-tight text-lg text-white font-bold">RepOne</span>
              <span className="text-[#BEFF00] text-[7px] uppercase tracking-widest px-1.5 py-0.5 bg-[#BEFF00]/10 border border-[#BEFF00]/25 rounded font-sans font-bold">SANDBOX DEV</span>
            </div>
            <div className="flex items-center gap-6 font-mono text-[9px] text-[#F0EDE6]/30">
              <span className="hidden sm:inline">DB: CONNECTED</span>
              <span>HOST: LOCALHOST</span>
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#BEFF00] animate-pulse" />
                SYSTEM RUNNING
              </span>
            </div>
          </div>

          {/* Center Space (Empty to keep focus on corners/sides) */}
          <div className="flex-1" />

          {/* Bottom Row: Big Casing Number + Terminal Logs */}
          <div className="relative z-10 w-full flex flex-col md:flex-row md:items-end justify-between gap-8">
            {/* Left Lower Corner: Massive Numerical Loading */}
            <div className="flex flex-col items-start">
              <div className="flex items-baseline gap-1">
                <span className="font-display font-black text-[22vw] sm:text-[16vw] md:text-[14vw] leading-[0.75] tracking-tighter text-[#BEFF00]">
                  {String(progress).padStart(3, "0")}
                </span>
                <span className="font-display text-[6vw] sm:text-[4vw] md:text-[3vw] font-bold text-[#BEFF00]/40">%</span>
              </div>
              <div className="mt-4 flex flex-col gap-1 font-mono text-[10px] tracking-widest text-[#F0EDE6]/40 uppercase">
                <span className="text-[#BEFF00] font-bold">SYSTEM BOOTSTRAP</span>
                <span>STATUS: LOADING ENVIRONMENT</span>
              </div>
            </div>

            {/* Right Lower Corner: Terminal Logging Output */}
            <div className="flex flex-col items-start md:items-end font-mono text-[10px] tracking-wider text-[#F0EDE6]/50">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#BEFF00]" />
                <span className="text-white font-bold">CONSOLE LOGGER</span>
              </div>
              <div className="bg-white/[0.02] border border-white/5 p-4 rounded-md min-w-[280px] text-left md:text-right">
                <span className="text-[#BEFF00] block mb-1">{activeLog}</span>
                <span className="text-white/30 block text-[9px]">STEP PROGRESS: {progress}%</span>
                <span className="text-white/30 block text-[9px]">SYS FREQ: 9800.12MHz</span>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
