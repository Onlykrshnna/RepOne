import { useEffect, useState } from "react";
import heroImg from "@/assets/hero.jpg";
import { Link } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth-context";
import { useScroll, useTransform, motion } from "framer-motion";
import { AmbientEmissions } from "./AmbientEmissions";
import { Bell } from "lucide-react";

const WORDS = ["GROW YOUR GYM.", "AUTOMATE"];
const LIME_WORD = "EVERYTHING.";

export function Hero() {
  const [mounted, setMounted] = useState(false);
  const [showBadge, setShowBadge] = useState(true);
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
        <img src={heroImg} alt="" aria-hidden className="w-full h-full object-cover opacity-25 mix-blend-luminosity" />
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "linear-gradient(#BEFF00 1px, transparent 1px), linear-gradient(90deg, #BEFF00 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
        <div className="absolute inset-0 bg-gradient-to-b from-[#080809]/60 via-[#080809]/80 to-[#080809]" />
      </motion.div>
      
      {/* Ambient Glow */}
      <AmbientEmissions />

      {/* Grain */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.04] mix-blend-overlay z-0" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")", backgroundSize: "200px" }} />

      {/* Top badges (Relative flow showing new brand hierarchy) */}
      <div className="relative z-10 px-6 md:px-12 max-w-[1440px] mx-auto w-full flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mt-8">
        <motion.div 
          initial={{ opacity: 0, y: -20 }} 
          animate={{ opacity: mounted ? 1 : 0, y: mounted ? 0 : -20 }} 
          transition={{ duration: 1, delay: 0.2, ease: [0.16,1,0.3,1] }}
          className="flex flex-col gap-1"
        >
          <div className="flex items-center gap-2">
            <span className="font-display text-[#F0EDE6] text-xl font-bold tracking-tight">RepOne</span>
            <span className="text-[#BEFF00] text-[8px] uppercase tracking-widest px-1.5 py-0.5 bg-[#BEFF00]/10 border border-[#BEFF00]/25 rounded font-sans font-bold">SaaS PLATFORM</span>
          </div>
          <span className="text-[#F0EDE6]/40 uppercase tracking-widest text-[9px]" style={{ fontFamily: "Inter", letterSpacing: "0.2em" }}>Powered by WebForge</span>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: -20 }} 
          animate={{ opacity: mounted ? 1 : 0, y: mounted ? 0 : -20 }} 
          transition={{ duration: 1, delay: 0.4, ease: [0.16,1,0.3,1] }}
          className="text-left sm:text-right flex items-start sm:items-end flex-col gap-1"
        >
          <div className="flex items-center gap-2">
            <span className="text-[#BEFF00] uppercase tracking-widest text-[9px] font-bold" style={{ fontFamily: "Inter", letterSpacing: "0.15em" }}>Demo Gym Website</span>
            <span className="w-2 h-2 rounded-full bg-[#BEFF00] animate-pulse" />
          </div>
          <div className="font-display text-[#F0EDE6] text-2xl md:text-3xl leading-none">XYZ Fitness</div>
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
          className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 border-t border-[#F0EDE6]/10 pt-8"
        >
          <p className="max-w-xl text-[#F0EDE6]/60" style={{ fontFamily: "Inter", fontSize: "14px", lineHeight: "1.7" }}>
            This is a live demo website for <strong className="text-white">XYZ Fitness</strong>. Every feature&mdash;from online memberships and class bookings to QR attendance, admin management dashboard, and payment pipeline&mdash;is powered by <strong className="text-[#BEFF00]">RepOne</strong>.
          </p>
          
          <div className="flex flex-wrap items-center gap-4">
            <Link to="/signup" className="group relative overflow-hidden inline-flex items-center gap-2 bg-[#BEFF00] text-[#080809] px-6 py-4 hover:bg-white transition-colors duration-300" style={{ fontFamily: "Inter", fontSize: "10px", letterSpacing: "0.2em", textTransform: "uppercase", fontWeight: 600 }}>
              <span className="relative z-10">Become a Member</span>
            </Link>
            
            <a href="#book" className="group relative overflow-hidden inline-flex items-center gap-2 border border-[#F0EDE6]/20 text-[#F0EDE6]/80 px-6 py-4 hover:border-[#BEFF00] hover:text-[#BEFF00] transition-colors duration-300" style={{ fontFamily: "Inter", fontSize: "10px", letterSpacing: "0.2em", textTransform: "uppercase", fontWeight: 600 }}>
              <span className="relative z-10">Book a Demo</span>
            </a>
          </div>
        </motion.div>
      </div>

      {/* Floating Demo Badge */}
      {showBadge && (
        <div className="fixed bottom-6 right-6 z-50 max-w-sm bg-[#0C0C0E]/95 border border-[#BEFF00]/30 p-5 shadow-2xl backdrop-blur-md flex flex-col gap-4 text-left rounded" style={{ boxShadow: "0 20px 40px rgba(0,0,0,0.5)" }}>
          <div className="flex items-center justify-between border-b border-[#F0EDE6]/10 pb-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#BEFF00] animate-pulse" />
              <span className="text-[#F0EDE6] font-display text-[11px] uppercase tracking-widest font-bold">RepOne Sandbox Badge</span>
            </div>
            <button onClick={() => setShowBadge(false)} className="text-[#F0EDE6]/40 hover:text-white transition-colors text-sm font-bold px-1">&times;</button>
          </div>
          <p className="text-[#F0EDE6]/70 text-[12px] font-sans leading-relaxed">
            You're viewing a demo website for <strong className="text-[#BEFF00]">XYZ Fitness</strong>. Everything on this website&mdash;including memberships, QR check-in, payments, member portal, and admin dashboard&mdash;is powered by <strong className="text-white">RepOne</strong>.
          </p>
          <div className="flex gap-2">
            <Link to="/signup" className="flex-1 text-center py-2.5 bg-[#BEFF00] text-[#080809] text-[9px] uppercase tracking-wider font-bold hover:bg-white transition-colors" style={{ fontFamily: "Inter" }}>
              Sign Up
            </Link>
            <Link to="/login" className="flex-1 text-center py-2.5 border border-[#F0EDE6]/20 text-[#F0EDE6] text-[9px] uppercase tracking-wider font-bold hover:border-[#BEFF00] hover:text-[#BEFF00] transition-colors" style={{ fontFamily: "Inter" }}>
              Login
            </Link>
          </div>
        </div>
      )}

      <style>{`@keyframes scrollpulse{0%{transform:translateY(-100%)}70%{transform:translateY(200%)}100%{transform:translateY(200%)}}`}</style>
    </section>
  );
}