import { Reveal } from "./Reveal";

export function CTASection() {
  return (
    <section id="book" className="relative min-h-[90svh] flex flex-col items-center justify-center py-32 bg-[#BEFF00] text-[#080809] selection:bg-[#080809] selection:text-[#BEFF00] overflow-hidden">
      {/* Background radial lines */}
      <div className="absolute inset-0 pointer-events-none opacity-10" style={{ backgroundImage: "repeating-linear-gradient(45deg, #080809 0, #080809 1px, transparent 0, transparent 50%)", backgroundSize: "30px 30px" }} />
      
      <div className="relative z-10 mx-auto max-w-5xl px-6 md:px-12 text-center flex flex-col items-center">
        <Reveal>
          <span className="inline-block px-4 py-2 border border-[#080809]/20 rounded-full text-[#080809]" style={{ fontFamily: "Inter", fontSize: "10px", letterSpacing: "0.26em", textTransform: "uppercase" }}>
            Build With Web Forge
          </span>
        </Reveal>
        
        <Reveal delay={100} className="mt-12 md:mt-16">
          <h2 className="font-display text-[clamp(3.5rem,8vw,9rem)] leading-[0.85] tracking-tight">
            Ready to <br /><span className="italic">scale?</span>
          </h2>
        </Reveal>
        
        <Reveal delay={200} className="mt-16 md:mt-24">
          <a href="mailto:hello@webforge.com" className="group relative inline-flex items-center justify-center gap-4 bg-[#080809] text-[#BEFF00] px-10 py-6 md:px-16 md:py-8 overflow-hidden">
            <div className="absolute inset-0 bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]" />
            <span className="relative z-10 group-hover:text-[#080809] transition-colors duration-500" style={{ fontFamily: "Inter", fontSize: "14px", letterSpacing: "0.26em", textTransform: "uppercase", fontWeight: 600 }}>
              Start Your Project
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
