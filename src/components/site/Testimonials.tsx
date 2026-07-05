import { useState, useEffect } from "react";
import { Reveal } from "./Reveal";

const TESTIMONIALS = [
  { text: "Web Forge stripped away the noise. It's just clean code, and engineering that scales.", author: "James M.", role: "CTO, TechCorp" },
  { text: "The architecture respects our goals. Our platform is faster at 100k users than it was at 1k.", author: "Sarah T.", role: "Product Lead" },
  { text: "No bloated templates. Just pixel-perfect execution that actually changes how users interact.", author: "David L.", role: "Founder, Startup Inc" },
];

export function Testimonials() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setActive((prev) => (prev + 1) % TESTIMONIALS.length), 5000);
    return () => clearInterval(t);
  }, []);

  return (
    <section className="py-32 md:py-48 bg-[#F8F7F4] dark:bg-[#0A0A0C] border-t border-[#080809]/5 dark:border-[#F0EDE6]/5">
      <div className="mx-auto max-w-[1440px] px-6 md:px-12 flex flex-col items-center text-center">
        <Reveal>
          <div className="relative max-w-6xl w-full min-h-[20rem] flex flex-col items-center justify-center px-4">
            <span className="absolute top-0 md:-top-10 text-[#BEFF00] font-display opacity-20 select-none z-0" style={{ fontSize: "16rem", lineHeight: "1" }}>"</span>
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className={`absolute inset-0 flex flex-col items-center justify-center transition-all duration-1000 z-10 w-full px-2 sm:px-10 ${i === active ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 translate-y-4 pointer-events-none"}`}>
                <p className="font-display text-[#080809] dark:text-[#F0EDE6] max-w-4xl" style={{ fontSize: "clamp(1.75rem,3.5vw,3rem)", lineHeight: "1.2", letterSpacing: "-0.01em" }}>
                  {t.text}
                </p>
                <div className="mt-8 flex flex-col items-center gap-1">
                  <span className="text-[#080809] dark:text-[#F0EDE6] font-medium" style={{ fontFamily: "Inter", fontSize: "14px", letterSpacing: "0.1em", textTransform: "uppercase" }}>{t.author}</span>
                  <span className="text-[#080809]/40 dark:text-[#F0EDE6]/30" style={{ fontFamily: "Inter", fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase" }}>{t.role}</span>
                </div>
              </div>
            ))}
          </div>
        </Reveal>
        
        <Reveal delay={200}>
          <div className="flex gap-3 mt-16 md:mt-12">
            {TESTIMONIALS.map((_, i) => (
              <button key={i} onClick={() => setActive(i)} className="w-12 h-12 flex items-center justify-center group" aria-label={`View testimonial ${i + 1}`}>
                <span className={`block h-[2px] transition-all duration-500 ${i === active ? "w-8 bg-[#BEFF00]" : "w-2 bg-[#080809]/10 dark:bg-[#F0EDE6]/10 group-hover:bg-[#BEFF00]/50 group-hover:w-4"}`} />
              </button>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
