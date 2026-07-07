import { useState } from "react";
import { Reveal } from "./Reveal";
import { Check } from "lucide-react";

export function Facility() {
  const brands = [
    { name: "XYZ Fitness", color: "#BEFF00", domain: "xyzfitness.com", bg: "#0C0C0E" },
    { name: "Iron House", color: "#FF5733", domain: "ironhousegym.co", bg: "#150C0C" },
    { name: "Power Gym", color: "#00E5FF", domain: "powergym.in", bg: "#0C1415" },
    { name: "Titan Strength", color: "#FFC300", domain: "titanstrength.fit", bg: "#15130C" },
    { name: "Elite Club", color: "#E040FB", domain: "eliteclub.co", bg: "#140C15" }
  ];

  const [activeBrand, setActiveBrand] = useState(brands[0]);

  return (
    <section id="brand" className="relative py-32 md:py-48 bg-[#F8F7F4] dark:bg-[#0A0A0C] overflow-hidden">
      <div className="absolute top-0 left-0 select-none pointer-events-none overflow-hidden" aria-hidden>
        <span className="font-display leading-none text-[#E8E5DF] dark:text-[#1A1A1E] font-bold" style={{ fontSize: "28vw", letterSpacing: "-0.05em" }}>04</span>
      </div>

      <div className="mx-auto max-w-[1440px] px-6 md:px-12 relative z-10">
        <Reveal>
          <div className="flex items-center gap-4 mb-20 md:mb-32">
            <span className="font-display text-xl text-[#BEFF00]">04</span>
            <span className="block h-[1px] w-10 bg-[#080809]/20 dark:bg-[#F0EDE6]/15" />
            <span className="text-[#080809]/50 dark:text-[#F0EDE6]/35" style={{ fontFamily: "Inter", fontSize: "10px", letterSpacing: "0.26em", textTransform: "uppercase" }}>Adaptability</span>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Brand customizer preview container */}
          <div className="lg:col-span-7 flex flex-col justify-center items-center">
            <Reveal className="w-full">
              <div 
                className="w-full rounded-2xl p-8 transition-all duration-700 border border-black/5 dark:border-white/5 relative overflow-hidden shadow-2xl"
                style={{ backgroundColor: activeBrand.bg }}
              >
                {/* Simulated browser header */}
                <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-8">
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
                  </div>
                  <span className="text-[10px] text-white/30 font-sans tracking-wide">https://{activeBrand.domain}</span>
                  <div className="w-4" />
                </div>

                {/* Simulated Web UI page */}
                <div className="space-y-6 text-left">
                  <div className="flex justify-between items-center">
                    <span 
                      className="font-display text-2xl font-bold tracking-tight transition-colors duration-500"
                      style={{ color: activeBrand.color }}
                    >
                      {activeBrand.name.toUpperCase()}
                    </span>
                    <div className="flex gap-4 text-[10px] uppercase tracking-wider text-white/40 font-semibold font-sans">
                      <span>Home</span>
                      <span>Pricing</span>
                      <span>App</span>
                    </div>
                  </div>

                  <div className="py-8 border-t border-b border-white/[0.06]">
                    <h3 className="font-display text-3xl md:text-4xl text-white tracking-tight leading-none mb-4">
                      Build your body. <br />
                      <span className="italic transition-colors duration-500" style={{ color: activeBrand.color }}>No compromises.</span>
                    </h3>
                    <p className="text-white/40 text-xs font-sans max-w-sm leading-relaxed">
                      Experience premium coached workouts and structural recovery designed to transform your physics.
                    </p>
                  </div>

                  {/* Actions preview */}
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] text-white/30 uppercase tracking-widest font-sans font-bold">100% BRAND CUSTOMIZED</span>
                    <button 
                      className="px-6 py-3 font-semibold text-[10px] uppercase tracking-wider transition-all duration-500 rounded font-sans"
                      style={{ backgroundColor: activeBrand.color, color: "#080809" }}
                    >
                      Join Membership
                    </button>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
          
          {/* Description & Switch controls */}
          <div className="lg:col-span-5 flex flex-col justify-center text-left">
            <Reveal>
              <h3 className="font-display text-[#080809] dark:text-[#F0EDE6] text-4xl md:text-5xl tracking-tight mb-6 leading-tight">
                Your Brand. <br />
                <span className="italic text-[#BEFF00]">Your Identity.</span>
              </h3>
            </Reveal>
            
            <Reveal delay={80}>
              <p className="text-[#080809]/60 dark:text-[#F0EDE6]/50 mb-8 max-w-md" style={{ fontFamily: "Inter", fontSize: "14px", lineHeight: "1.7" }}>
                RepOne isn't another generic gym directory. It is white-label software that completely adapts to <strong>YOUR</strong> gym, matching your branding from head to toe.
              </p>
            </Reveal>

            {/* Brand switcher buttons */}
            <Reveal delay={120} className="mb-8">
              <span className="text-[9px] uppercase tracking-widest text-[#080809]/40 dark:text-[#F0EDE6]/30 font-bold block mb-4">Select Gym Style Preview</span>
              <div className="flex flex-wrap gap-2">
                {brands.map((b) => (
                  <button
                    key={b.name}
                    onClick={() => setActiveBrand(b)}
                    className={`px-4 py-2 text-xs font-sans uppercase tracking-wider transition-all rounded border ${
                      activeBrand.name === b.name
                        ? "bg-[#080809] text-[#BEFF00] dark:bg-white dark:text-[#080809] border-transparent font-semibold"
                        : "bg-transparent text-[#080809]/60 dark:text-[#F0EDE6]/60 border-black/10 dark:border-white/10 hover:border-black/30 dark:hover:border-white/30"
                    }`}
                  >
                    {b.name}
                  </button>
                ))}
              </div>
            </Reveal>

            {/* Feature bullets */}
            <Reveal delay={160}>
              <div className="grid grid-cols-2 gap-4 border-t border-[#080809]/10 dark:border-[#F0EDE6]/10 pt-6">
                {[
                  { title: "Own Logo", desc: "Your branding, front and center." },
                  { title: "Own Colors", desc: "Matches your gym theme UI." },
                  { title: "Own Domain", desc: "Run under your website url." },
                  { title: "Own Branding", desc: "No watermarks or overlays." }
                ].map((item) => (
                  <div key={item.title} className="flex gap-2">
                    <Check className="w-4 h-4 text-[#BEFF00] shrink-0 mt-0.5" />
                    <div>
                      <h5 className="font-semibold text-sm text-[#080809] dark:text-[#F0EDE6] leading-none mb-1">{item.title}</h5>
                      <span className="text-[10px] text-[#080809]/40 dark:text-[#F0EDE6]/40 font-sans">{item.desc}</span>
                    </div>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
