import { useEffect, useState } from "react";
import heroImg from "@/assets/hero.jpg";
import { Link } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth-context";
import { useScroll, useTransform, motion } from "framer-motion";
import { AmbientEmissions } from "./AmbientEmissions";
import { Bell } from "lucide-react";

const WORDS = ["BUILD", "DIGITAL", "EXPERIENCES"];
const LIME_WORD = "THAT PERFORM.";

export function Hero() {
  const [mounted, setMounted] = useState(false);
  const { session, isLoading } = useAuth();
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 1000], [0, 300]);
  const opacity = useTransform(scrollY, [0, 600], [1, 0]);

  useEffect(() => { 
    const t = requestAnimationFrame(() => setMounted(true)); 
    return () => cancelAnimationFrame(t); 
  }, []);

  return (
    <section id="top" className="relative min-h-[100svh] w-full overflow-hidden bg-[#080809] flex flex-col justify-between pt-24 md:pt-32 pb-8 md:pb-12">
      {/* Parallax image with intellectual grid */}
      <motion.div 
        className="absolute inset-[-10%] z-0" 
        style={{ y, opacity }}
      >
        <img src={heroImg} alt="" aria-hidden className="w-full h-full object-cover opacity-30 mix-blend-luminosity" />
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "linear-gradient(#BEFF00 1px, transparent 1px), linear-gradient(90deg, #BEFF00 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
        <div className="absolute inset-0 bg-gradient-to-b from-[#080809]/60 via-[#080809]/80 to-[#080809]" />
      </motion.div>
      
      {/* Ambient Glow */}
      <AmbientEmissions />

      {/* Grain */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.04] mix-blend-overlay z-0" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")", backgroundSize: "200px" }} />

      {/* Top badges (Relative flow) */}
      <div className="relative z-10 px-6 md:px-12 max-w-[1440px] mx-auto w-full flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mt-8">
        <motion.div 
          initial={{ opacity: 0, y: -20 }} 
          animate={{ opacity: mounted ? 1 : 0, y: mounted ? 0 : -20 }} 
          transition={{ duration: 1, delay: 0.2, ease: [0.16,1,0.3,1] }}
          className="flex items-center gap-3"
        >
          <span className="block w-5 h-[1px] bg-[#BEFF00]" />
          <span className="text-[#F0EDE6]/55" style={{ fontFamily: "Inter", fontSize: "10px", letterSpacing: "0.26em", textTransform: "uppercase" }}>A Live Demo &middot; Web Forge</span>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: -20 }} 
          animate={{ opacity: mounted ? 1 : 0, y: mounted ? 0 : -20 }} 
          transition={{ duration: 1, delay: 0.4, ease: [0.16,1,0.3,1] }}
          className="text-left sm:text-right flex items-start sm:items-end flex-col gap-1"
        >
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-[#BEFF00] animate-pulse" />
            <div className="font-display text-[#BEFF00] text-3xl md:text-4xl leading-none">DEMO</div>
          </div>
          <div className="text-[#F0EDE6]/35" style={{ fontFamily: "Inter", fontSize: "9px", letterSpacing: "0.24em", textTransform: "uppercase" }}>Showcase Project</div>
        </motion.div>
      </div>

      {/* Headline (Middle) */}
      <div className="relative z-10 flex-1 flex flex-col justify-start pt-12 md:pt-20 px-6 md:px-12 max-w-[1440px] mx-auto w-full">
        <h1 className="font-display leading-[0.9] tracking-[-0.02em] max-w-5xl text-left">
          {WORDS.map((word, i) => (
            <span key={word} className="block overflow-hidden pb-1 md:pb-2">
              <motion.span 
                className="block text-[#F0EDE6] text-[clamp(2.5rem,7vw,7.5rem)]"
                initial={{ y: "110%", opacity: 0 }}
                animate={mounted ? { y: 0, opacity: 1 } : { y: "110%", opacity: 0 }}
                transition={{ duration: 1.2, delay: 0.3 + i * 0.1, ease: [0.16,1,0.3,1] }}
              >
                {word}
              </motion.span>
            </span>
          ))}
          <span className="block overflow-hidden pb-1 md:pb-2">
            <motion.span 
              className="block italic text-[#BEFF00] text-[clamp(2.5rem,7vw,7.5rem)]"
              initial={{ y: "110%", opacity: 0 }}
              animate={mounted ? { y: 0, opacity: 1 } : { y: "110%", opacity: 0 }}
              transition={{ duration: 1.2, delay: 0.3 + WORDS.length * 0.1, ease: [0.16,1,0.3,1] }}
            >
              {LIME_WORD}
            </motion.span>
          </span>
        </h1>
      </div>

      {/* Bottom section */}
      <div className="relative z-10 px-6 md:px-12 max-w-[1440px] mx-auto w-full pb-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={mounted ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 1, delay: 1, ease: [0.16,1,0.3,1] }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-t border-[#F0EDE6]/10 pt-8"
        >
          <p className="max-w-sm text-[#F0EDE6]/50" style={{ fontFamily: "Inter", fontSize: "14px", lineHeight: "1.6" }}>
            This is a functional gym prototype designed by Web Forge. High-end design, seamless user flows, and real backend logic &mdash; no smoke and mirrors.
          </p>
          
          <div className="flex items-center gap-6">
            <div className="flex flex-col items-center gap-3 mr-8 hidden md:flex">
              <span className="text-[#F0EDE6]/40" style={{ fontFamily: "Inter", fontSize: "9px", letterSpacing: "0.26em", textTransform: "uppercase" }}>Scroll</span>
              <div className="relative h-14 w-[1px] overflow-hidden bg-[#F0EDE6]/15">
                <div className="absolute top-0 left-0 h-1/2 w-full bg-[#BEFF00]" style={{ animation: "scrollpulse 2.4s ease-in-out infinite" }} />
              </div>
            </div>

            {!isLoading && session ? (
              <Link to="/dashboard" className="group relative overflow-hidden inline-flex items-center gap-3 bg-[#BEFF00] text-[#080809] px-8 py-5 hover:bg-white transition-colors duration-300" style={{ fontFamily: "Inter", fontSize: "11px", letterSpacing: "0.26em", textTransform: "uppercase", fontWeight: 500 }}>
                <span className="relative z-10">Explore Dashboard</span>
                <span className="relative z-10 group-hover:translate-x-1 transition-transform duration-300">&rarr;</span>
              </Link>
            ) : (
              <Link to="/signup" className="group relative overflow-hidden inline-flex items-center gap-3 bg-[#BEFF00] text-[#080809] px-8 py-5 hover:bg-white transition-colors duration-300" style={{ fontFamily: "Inter", fontSize: "11px", letterSpacing: "0.26em", textTransform: "uppercase", fontWeight: 500 }}>
                <span className="relative z-10">Explore Demo</span>
                <span className="relative z-10 group-hover:translate-x-1 transition-transform duration-300">&rarr;</span>
              </Link>
            )}
          </div>
        </motion.div>
      </div>

      <style>{`@keyframes scrollpulse{0%{transform:translateY(-100%)}70%{transform:translateY(200%)}100%{transform:translateY(200%)}}`}</style>
    </section>
  );
}