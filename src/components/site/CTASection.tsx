import { Reveal } from "./Reveal";

export function CTASection() {
  return (
    <section id="book" className="relative min-h-[90svh] flex flex-col items-center justify-center py-32 bg-[#BEFF00] text-[#080809] selection:bg-[#080809] selection:text-[#BEFF00] overflow-hidden">
      {/* Background radial lines */}
      <div className="absolute inset-0 pointer-events-none opacity-10" style={{ backgroundImage: "repeating-linear-gradient(45deg, #080809 0, #080809 1px, transparent 0, transparent 50%)", backgroundSize: "30px 30px" }} />
      
      <div className="relative z-10 mx-auto max-w-5xl px-6 md:px-12 text-center flex flex-col items-center">
        <Reveal>
          <span className="inline-block px-4 py-2 border border-[#080809]/20 rounded-full text-[#080809]" style={{ fontFamily: "Inter", fontSize: "10px", letterSpacing: "0.26em", textTransform: "uppercase" }}>
            POWERED BY WEBFORGE
          </span>
        </Reveal>
        
        <Reveal delay={100} className="mt-12 md:mt-16">
          <h2 className="font-display text-[clamp(2.5rem,6vw,7rem)] leading-[0.9] tracking-tight uppercase max-w-4xl">
            YOUR GYM <br /><span className="italic">DESERVES BETTER</span>
          </h2>
          <p className="mt-6 text-[#080809]/60 max-w-lg mx-auto" style={{ fontFamily: "Inter", fontSize: "15px", lineHeight: "1.6" }}>
            Ditch the spreadsheets. Elevate your client experience and automate your operations with RepOne today.
          </p>
        </Reveal>
        
        <Reveal delay={200} className="mt-12 md:mt-16">
          <a href="mailto:demo@repone.co" className="group relative inline-flex items-center justify-center gap-4 bg-[#080809] text-[#BEFF00] px-10 py-6 md:px-16 md:py-7 overflow-hidden">
            <div className="absolute inset-0 bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]" />
            <span className="relative z-10 group-hover:text-[#080809] transition-colors duration-500" style={{ fontFamily: "Inter", fontSize: "13px", letterSpacing: "0.26em", textTransform: "uppercase", fontWeight: 600 }}>
              Book a Live Demo
            </span>
            <span className="relative z-10 group-hover:text-[#080809] transition-colors duration-500 group-hover:translate-x-2 ease-[cubic-bezier(0.16,1,0.3,1)]">
              &rarr;
            </span>
          </a>
        </Reveal>
      </div>
    </section>
  );
}
