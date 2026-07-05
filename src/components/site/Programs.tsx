import { useState } from "react";
import { Reveal } from "./Reveal";
import { programs } from "@/constants";

export function Programs() {
  return (
    <section id="programs" className="relative py-32 md:py-48 bg-[#0C0C0E] overflow-hidden">
      <div className="absolute top-8 right-0 select-none pointer-events-none overflow-hidden" aria-hidden>
        <span className="font-display leading-none text-[#141418] font-bold" style={{ fontSize: "28vw", letterSpacing: "-0.05em" }}>02</span>
      </div>
      <div className="relative z-10 mx-auto max-w-[1440px] px-6 md:px-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-20 md:mb-28">
          <div>
            <Reveal>
              <div className="flex items-center gap-4 mb-8">
                <span className="font-display text-xl text-[#BEFF00]">02</span>
                <span className="block h-[1px] w-10 bg-[#F0EDE6]/15" />
                <span className="text-[#F0EDE6]/35" style={{ fontFamily: "Inter", fontSize: "10px", letterSpacing: "0.26em", textTransform: "uppercase" }}>Programs</span>
              </div>
            </Reveal>
            <Reveal delay={80}>
              <h2 className="font-display text-[#F0EDE6]" style={{ fontSize: "clamp(2.4rem,5.5vw,6rem)", lineHeight: "0.94", letterSpacing: "-0.02em" }}>
                Four disciplines.<br /><span className="italic text-[#BEFF00]">One standard.</span>
              </h2>
            </Reveal>
          </div>
          <Reveal delay={160}>
            <p className="text-[#F0EDE6]/40 max-w-xs" style={{ fontFamily: "Inter", fontSize: "14px", lineHeight: "1.75" }}>
              Every program is coached in person. No apps, no queues, no drop-ins.
            </p>
          </Reveal>
        </div>

        <div>
          {programs.map((p, i) => (
            <Reveal key={p.name} delay={i * 55}>
              <a href="#book" className="group relative flex items-baseline gap-4 md:gap-8 border-t border-[#F0EDE6]/8 py-7 md:py-9 overflow-hidden hover:border-[#BEFF00]/30 transition-colors duration-500">
                <div className="absolute inset-0 bg-[#BEFF00]/[0.025] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="hidden md:block absolute right-0 top-0 h-full w-56 overflow-hidden opacity-0 group-hover:opacity-100 transition-all duration-700">
                  <img src={p.img} alt="" aria-hidden className="h-full w-full object-cover scale-110 group-hover:scale-100 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-[#0C0C0E]/65" />
                </div>
                <span className="font-display text-2xl md:text-4xl text-[#BEFF00] opacity-60 group-hover:opacity-100 transition-opacity duration-300 flex-shrink-0">{p.n}</span>
                <span className="font-display text-3xl md:text-5xl text-[#F0EDE6] group-hover:translate-x-2 transition-transform duration-500 flex-shrink-0" style={{ letterSpacing: "-0.02em" }}>{p.name}</span>
                <span className="hidden md:block flex-1 h-[1px] bg-[#F0EDE6]/10 self-center" />
                <span className="hidden md:block text-[#F0EDE6]/35 group-hover:text-[#F0EDE6]/65 transition-colors duration-300 flex-shrink-0" style={{ fontFamily: "Inter", fontSize: "11px", letterSpacing: "0.22em", textTransform: "uppercase" }}>{p.tag}</span>
                <span className="ml-auto text-[#BEFF00] opacity-0 group-hover:opacity-100 translate-x-3 group-hover:translate-x-0 transition-all duration-300 flex-shrink-0">&#8594;</span>
              </a>
            </Reveal>
          ))}
          <div className="border-t border-[#F0EDE6]/8" />
        </div>
      </div>
    </section>
  );
}