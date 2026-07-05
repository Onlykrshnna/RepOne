import { Reveal } from "./Reveal";
import { trainers } from "@/constants";

export function Trainers() {
  return (
    <section id="trainers" className="relative py-32 md:py-48 bg-[#080809] overflow-hidden">
      <div className="absolute top-1/4 -left-10 select-none pointer-events-none overflow-hidden" aria-hidden>
        <span className="font-display leading-none text-[#141418] font-bold" style={{ fontSize: "28vw", letterSpacing: "-0.05em" }}>03</span>
      </div>
      
      <div className="relative z-10 mx-auto max-w-[1440px] px-6 md:px-12">
        <Reveal>
          <div className="flex items-center gap-4 mb-16 md:mb-24">
            <span className="font-display text-xl text-[#BEFF00]">03</span>
            <span className="block h-[1px] w-10 bg-[#F0EDE6]/15" />
            <span className="text-[#F0EDE6]/35" style={{ fontFamily: "Inter", fontSize: "10px", letterSpacing: "0.26em", textTransform: "uppercase" }}>The Team</span>
          </div>
        </Reveal>

        <div className="flex flex-col">
          {trainers.map((t, i) => (
            <Reveal key={t.name} delay={i * 100}>
              <div className="group relative border-t border-[#F0EDE6]/10 py-10 md:py-16 flex flex-col md:flex-row md:items-center justify-between gap-6 cursor-crosshair">
                <div className="relative z-10 flex flex-col">
                  <h3 className="font-display text-[#F0EDE6] text-5xl md:text-8xl tracking-tight transition-colors duration-500 group-hover:text-[#BEFF00] mix-blend-difference">
                    {t.name}
                  </h3>
                  <span className="text-[#F0EDE6]/50 mt-4 font-sans text-sm tracking-widest uppercase transition-opacity duration-300 group-hover:opacity-100 mix-blend-difference">
                    {t.role}
                  </span>
                </div>
                
                {/* Hover Image Reveal */}
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-64 md:w-96 aspect-[3/4] opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] pointer-events-none overflow-hidden origin-right">
                  <img src={t.img} alt={t.name} className="w-full h-full object-cover grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-1000" />
                  <div className="absolute inset-0 bg-[#BEFF00]/10 mix-blend-overlay opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </div>
              </div>
            </Reveal>
          ))}
          <div className="border-t border-[#F0EDE6]/10" />
        </div>
      </div>
    </section>
  );
}
