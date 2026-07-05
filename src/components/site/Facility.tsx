import { Reveal } from "./Reveal";
import facility1 from "@/assets/gallery-1.jpg";
import facility2 from "@/assets/gallery-2.jpg";
import facility3 from "@/assets/gallery-3.jpg";

export function Facility() {
  return (
    <section id="facility" className="relative py-32 md:py-48 bg-[#F8F7F4] dark:bg-[#0A0A0C] overflow-hidden">
      <div className="mx-auto max-w-[1440px] px-6 md:px-12">
        <Reveal>
          <div className="flex items-center gap-4 mb-20 md:mb-32">
            <span className="font-display text-xl text-[#BEFF00]">04</span>
            <span className="block h-[1px] w-10 bg-[#080809]/20 dark:bg-[#F0EDE6]/15" />
            <span className="text-[#080809]/50 dark:text-[#F0EDE6]/35" style={{ fontFamily: "Inter", fontSize: "10px", letterSpacing: "0.26em", textTransform: "uppercase" }}>The Facility</span>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-12 items-center">
          {/* Large main image */}
          <div className="md:col-span-7">
            <Reveal className="h-full">
              <div className="relative group overflow-hidden">
                <div className="absolute inset-0 bg-[#BEFF00]/20 mix-blend-overlay opacity-0 group-hover:opacity-100 transition-opacity duration-700 z-10" />
                <img src={facility1} alt="Main training floor" className="w-full h-[60vh] md:h-[80vh] object-cover scale-105 group-hover:scale-100 transition-transform duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)]" />
              </div>
            </Reveal>
          </div>
          
          <div className="md:col-span-5 grid grid-rows-2 gap-6 md:gap-12 h-full">
            {/* Top secondary image + text */}
            <Reveal delay={100} className="h-full flex flex-col justify-end">
              <h3 className="font-display text-[#080809] dark:text-[#F0EDE6] text-3xl md:text-5xl tracking-tight mb-6" style={{ lineHeight: "0.9" }}>
                Engineered for <br /><span className="italic text-[#BEFF00]">performance.</span>
              </h3>
              <p className="text-[#080809]/60 dark:text-[#F0EDE6]/50 mb-8 max-w-sm" style={{ fontFamily: "Inter", fontSize: "14px", lineHeight: "1.7" }}>
                Eleiko plates, competition racks, and tailored recovery suites. Every square inch serves a purpose. No filler.
              </p>
              <div className="relative group overflow-hidden h-48 md:h-64">
                <img src={facility2} alt="Recovery room" className="w-full h-full object-cover scale-105 group-hover:scale-100 transition-transform duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] grayscale group-hover:grayscale-0" />
              </div>
            </Reveal>
            
            {/* Bottom secondary image */}
            <Reveal delay={200} className="h-full">
              <div className="relative group overflow-hidden h-48 md:h-64 mt-auto">
                <img src={facility3} alt="Equipment detail" className="w-full h-full object-cover scale-105 group-hover:scale-100 transition-transform duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] grayscale group-hover:grayscale-0" />
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
