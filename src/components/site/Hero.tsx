import { useState, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { motion, useScroll, useTransform } from "framer-motion";
import { Sparkles, ArrowRight, ArrowDown, Activity, Users, QrCode, ArrowUpRight } from "lucide-react";
import { useAuth } from "../../lib/auth-context";

export function Hero() {
  const [mounted, setMounted] = useState(false);
  const { session } = useAuth();
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 1000], [0, 200]);
  const y2 = useTransform(scrollY, [0, 1000], [0, -100]);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <section className="relative min-h-[100svh] w-full overflow-hidden bg-[#080809] text-[#F0EDE6] font-sans selection:bg-[#BEFF00] selection:text-[#080809] flex flex-col items-center pt-20 md:pt-28">
      
      {/* Background Elements */}
      <div className="absolute inset-0 pointer-events-none z-0">
        {/* Subtle grid */}
        <div 
          className="absolute inset-0 opacity-[0.03]" 
          style={{ 
            backgroundImage: "linear-gradient(#BEFF00 1px, transparent 1px), linear-gradient(90deg, #BEFF00 1px, transparent 1px)", 
            backgroundSize: "60px 60px" 
          }} 
        />
        
        {/* Radial Center Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] max-w-[800px] max-h-[800px] bg-[#BEFF00]/5 rounded-full blur-[120px]" />
        
        {/* Animated Floating Diamonds (replacing the orange 3D rocks) */}
        <motion.div style={{ y: y1 }} className="absolute top-[30%] left-[10%] md:left-[20%] w-16 h-16 bg-[#BEFF00]/20 rotate-45 blur-[2px] rounded-lg shadow-[0_0_50px_rgba(190,255,0,0.4)]" />
        <motion.div style={{ y: y2 }} className="absolute bottom-[20%] right-[10%] md:right-[20%] w-24 h-24 bg-[#BEFF00]/15 rotate-12 blur-[4px] rounded-2xl shadow-[0_0_80px_rgba(190,255,0,0.3)]" />
      </div>

      {/* Main Content Wrapper */}
      <div className="relative z-10 w-full max-w-[1440px] px-6 md:px-12 pt-8 flex flex-col min-h-screen">
        

        {/* Hero Central Content */}
        <div className="flex-1 flex flex-col items-center justify-center text-center w-full max-w-4xl mx-auto z-20 mt-[-40px]">
          
          {/* Floating Pill Badge */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: mounted ? 1 : 0, y: mounted ? 0 : 20 }}
            className="flex items-center gap-3 bg-[#111113]/80 backdrop-blur-md border border-[#F0EDE6]/10 rounded-full p-1.5 pr-4 mb-4"
          >
            <span className="bg-[#2A2A2D] text-[#F0EDE6] text-[10px] uppercase tracking-wider px-3 py-1.5 rounded-full font-semibold">
              Gym Platform
            </span>
            <a href="#features" className="text-xs text-[#F0EDE6]/70 flex items-center gap-1 hover:text-[#BEFF00] transition-colors cursor-pointer group/link">
              See how it works <ArrowRight className="w-3 h-3 transition-transform group-hover/link:translate-x-1" />
            </a>
          </motion.div>

          {/* Headline */}
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: mounted ? 1 : 0, y: mounted ? 0 : 20 }}
            transition={{ delay: 0.1 }}
            className="text-[clamp(1.75rem,5vw,3.5rem)] leading-[1.05] md:leading-[1.1] font-display tracking-tight text-[#F0EDE6] mb-4"
          >
            A <span className="text-[#BEFF00]">beautifully designed</span>, intuitive gym <br className="hidden md:block" />
            experience that <span className="text-[#BEFF00]">puts you in control</span>
          </motion.h1>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: mounted ? 1 : 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-2 text-xs text-[#F0EDE6]/50 uppercase tracking-widest mb-6"
          >
            <span className="w-4 h-4 bg-[#2A2A2D] rounded flex items-center justify-center">✦</span>
            Our distinctive expertise
          </motion.div>

          {/* Functional Dashboard Representation */}
          <div className="relative w-full max-w-[400px] md:max-w-[500px] mx-auto mb-8 md:mb-12 mt-6 md:mt-8 perspective-1000 group">
            
            {/* Background Glow */}
            <div className="absolute inset-0 bg-[#BEFF00]/5 blur-3xl rounded-3xl" />
            
            {/* Horizontal Fanning Decorative Stacked Cards */}
            
            {/* Left Background Card (Analytics Mock) */}
            <div className="absolute inset-0 bg-[#0F0F11] border border-[#F0EDE6]/10 rounded-2xl -translate-x-[4%] rotate-[-3deg] md:-translate-x-[8%] md:rotate-[-5deg] scale-[0.9] opacity-60 shadow-2xl transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-x-[8%] group-hover:rotate-[-6deg] md:group-hover:-translate-x-[16%] md:group-hover:rotate-[-8deg] overflow-hidden flex flex-col p-4 md:p-6 origin-bottom-left">
              <div className="w-1/2 h-3 md:h-4 bg-[#2A2A2D]/50 rounded-full mb-6" />
              <div className="flex-1 bg-[#1A1A1D]/50 rounded-xl border border-[#F0EDE6]/5 p-3 flex items-end gap-2">
                <div className="w-full bg-[#BEFF00]/20 rounded-t h-[40%]" />
                <div className="w-full bg-[#BEFF00]/40 rounded-t h-[60%]" />
                <div className="w-full bg-[#BEFF00]/60 rounded-t h-[80%]" />
                <div className="w-full bg-[#BEFF00]/80 rounded-t h-[50%]" />
              </div>
            </div>

            {/* Right Background Card (Members Mock) */}
            <div className="absolute inset-0 bg-[#0F0F11] border border-[#F0EDE6]/10 rounded-2xl translate-x-[4%] rotate-[3deg] md:translate-x-[8%] md:rotate-[5deg] scale-[0.9] opacity-60 shadow-2xl transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-[8%] group-hover:rotate-[6deg] md:group-hover:translate-x-[16%] md:group-hover:rotate-[8deg] overflow-hidden flex flex-col p-4 md:p-6 origin-bottom-right">
              <div className="w-1/3 h-3 md:h-4 bg-[#2A2A2D]/50 rounded-full mb-6 ml-auto" />
              <div className="flex flex-col gap-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="flex gap-3 items-center bg-[#1A1A1D]/50 p-2 rounded-lg border border-[#F0EDE6]/5">
                    <div className="w-6 h-6 md:w-8 md:h-8 bg-[#2A2A2D]/80 rounded-full shrink-0" />
                    <div className="flex flex-col gap-1.5 w-full">
                      <div className="h-1.5 md:h-2 bg-[#2A2A2D]/80 rounded-full w-3/4" />
                      <div className="h-1.5 md:h-2 bg-[#2A2A2D]/40 rounded-full w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Main Dashboard Panel */}
            <motion.div 
              initial={{ y: 50, opacity: 0, rotateX: 10 }}
              animate={mounted ? { y: 0, opacity: 1, rotateX: 0 } : { y: 50, opacity: 0, rotateX: 10 }}
              transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
              className="relative w-full bg-[#0F0F11]/90 backdrop-blur-xl border border-[#F0EDE6]/10 rounded-2xl shadow-[0_30px_60px_rgba(0,0,0,0.6)] p-4 md:p-5 overflow-hidden flex flex-col gap-4 transform-gpu hover:-translate-y-2 transition-transform duration-500"
            >
              {/* Top Bar */}
              <div className="flex items-center justify-between border-b border-[#F0EDE6]/5 pb-3 md:pb-4">
                <div className="flex items-center gap-2 md:gap-3">
                  <div className="w-7 h-7 md:w-8 h-8 rounded-full bg-[#BEFF00]/10 flex items-center justify-center shrink-0">
                    <Activity className="w-3.5 h-3.5 md:w-4 md:h-4 text-[#BEFF00]" />
                  </div>
                  <div className="text-left">
                    <div className="text-[11px] md:text-xs font-semibold text-[#F0EDE6]">Live Gym Activity</div>
                    <div className="text-[9px] md:text-[10px] text-[#F0EDE6]/50">RepOne Platform</div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 px-2 md:px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[8px] md:text-[9px] uppercase tracking-wider font-bold whitespace-nowrap">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="hidden sm:inline">System </span>Online
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-3 md:gap-4">
                <div className="bg-[#1A1A1D]/50 rounded-xl p-3 md:p-4 border border-[#F0EDE6]/5 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <Users className="w-3.5 h-3.5 md:w-4 md:h-4 text-[#F0EDE6]/40" />
                    <ArrowUpRight className="w-3 h-3 text-[#BEFF00]" />
                  </div>
                  <div>
                    <div className="text-xl md:text-2xl font-display text-[#F0EDE6]">1,248</div>
                    <div className="text-[8px] md:text-[10px] text-[#F0EDE6]/40 uppercase tracking-widest mt-0.5 md:mt-1">Active Members</div>
                  </div>
                </div>

                <div className="bg-[#1A1A1D]/50 rounded-xl p-3 md:p-4 border border-[#F0EDE6]/5 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <QrCode className="w-3.5 h-3.5 md:w-4 md:h-4 text-[#F0EDE6]/40" />
                    <ArrowUpRight className="w-3 h-3 text-[#BEFF00]" />
                  </div>
                  <div>
                    <div className="text-xl md:text-2xl font-display text-[#F0EDE6]">342</div>
                    <div className="text-[8px] md:text-[10px] text-[#F0EDE6]/40 uppercase tracking-widest mt-0.5 md:mt-1">Scans Today</div>
                  </div>
                </div>
              </div>

              {/* Recent Activity Bar */}
              <div className="mt-2 md:mt-auto bg-[#1A1A1D] rounded-lg p-2.5 md:p-3 border border-[#F0EDE6]/5 flex items-center gap-2.5 md:gap-3">
                <div className="w-7 h-7 md:w-8 md:h-8 rounded bg-[#2A2A2D] flex items-center justify-center shrink-0">
                  <span className="text-[#F0EDE6] text-[10px] md:text-xs font-bold">JD</span>
                </div>
                <div className="flex-1 text-left min-w-0">
                  <div className="text-[10px] md:text-xs text-[#F0EDE6] truncate">John Doe <span className="text-[#F0EDE6]/40">checked in</span></div>
                  <div className="text-[8.5px] md:text-[10px] text-[#BEFF00] truncate">Pro Membership • Just now</div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* CTAs under the card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: mounted ? 1 : 0, y: mounted ? 0 : 20 }}
            transition={{ delay: 0.6 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3 md:gap-4 z-20 w-full px-4 md:px-0"
          >
            {session ? (
              <Link to="/dashboard" className="w-full sm:w-auto text-center bg-gradient-to-r from-[#BEFF00] to-[#9acc00] text-[#080809] px-6 md:px-8 py-3 md:py-3.5 rounded-full font-bold text-xs md:text-sm hover:shadow-[0_0_25px_rgba(190,255,0,0.4)] transition-all">
                Go to Dashboard
              </Link>
            ) : (
              <Link to="/signup" className="w-full sm:w-auto text-center bg-gradient-to-r from-[#BEFF00] to-[#9acc00] text-[#080809] px-6 md:px-8 py-3 md:py-3.5 rounded-full font-bold text-xs md:text-sm hover:shadow-[0_0_25px_rgba(190,255,0,0.4)] transition-all">
                Become a Member
              </Link>
            )}
            <a href="#demo" className="w-full sm:w-auto text-center bg-[#1A1A1D]/80 backdrop-blur border border-[#F0EDE6]/10 text-[#F0EDE6] px-6 md:px-8 py-3 md:py-3.5 rounded-full font-bold text-xs md:text-sm hover:bg-[#2A2A2D] transition-colors">
              Book a Demo
            </a>
          </motion.div>

        </div>

        {/* Footer Area */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: mounted ? 1 : 0 }}
          transition={{ delay: 0.8 }}
          className="w-full pb-4 pt-6 mt-auto flex flex-col md:flex-row items-center md:items-end justify-between gap-4 text-center md:text-left text-[10px] uppercase tracking-widest text-[#F0EDE6]/50"
        >
          <div className="max-w-[280px] leading-relaxed">
            Manage your gym effortlessly with a sleek, user-friendly app designed for modern facilities, offering seamless scheduling, and real-time insights.
          </div>
          
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-2">
              (SCROLL DOWN)
              <ArrowDown className="w-3 h-3" />
            </span>
            <span className="hidden md:inline">✦</span>
            <span className="hidden md:inline">(TO DISCOVER MORE)</span>
          </div>
        </motion.div>

      </div>
      
      {/* Include the global framer motion perspective utility if needed */}
      <style>{`
        .perspective-1000 {
          perspective: 1000px;
        }
      `}</style>
    </section>
  );
}