import { useEffect, useRef } from "react";
import g1 from "@/assets/gallery-1.jpg";
import g2 from "@/assets/gallery-2.jpg";
import g3 from "@/assets/gallery-3.jpg";
import { Reveal } from "./Reveal";

const shots = [
  { img: g1, caption: "The Floor · 6,400 sq ft", h: 1024, w: 1600 },
  { img: g2, caption: "The Iron · Walnut & Steel", h: 1280, w: 1024 },
  { img: g3, caption: "The Sanctuary · Sauna & Plunge", h: 1024, w: 1280 },
];

export function Facility() {
  const refs = useRef<(HTMLImageElement | null)[]>([]);

  useEffect(() => {
    const onScroll = () => {
      refs.current.forEach((img, i) => {
        if (!img) return;
        const rect = img.getBoundingClientRect();
        const centered = rect.top + rect.height / 2 - window.innerHeight / 2;
        const speed = i % 2 === 0 ? -0.08 : 0.05;
        img.style.transform = `translateY(${centered * speed}px) scale(1.12)`;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <section id="facility" className="relative py-32 md:py-48 border-t border-white/5">
      <div className="px-6 md:px-12 mb-16 md:mb-24">
        <div className="mx-auto max-w-[1440px] flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div>
            <Reveal>
              <p className="eyebrow mb-6"><span className="hairline" />The Facility</p>
            </Reveal>
            <Reveal delay={100}>
              <h2 className="font-display text-5xl md:text-7xl text-bone max-w-2xl">
                A room built to <span className="italic text-gold">disappear.</span>
              </h2>
            </Reveal>
          </div>
          <Reveal delay={200}>
            <p className="text-bone/60 text-sm max-w-xs">
              Custom fabricated equipment. Warm concrete. Music sourced from vinyl.
              No televisions. No windows onto a street.
            </p>
          </Reveal>
        </div>
      </div>

      <div className="space-y-16 md:space-y-32">
        {shots.map((s, i) => (
          <Reveal
            key={i}
            className={`px-6 md:px-12 ${
              i === 0 ? "" : i === 1 ? "md:pl-[20%] md:pr-[8%]" : "md:pl-[8%] md:pr-[24%]"
            }`}
          >
            <figure className="relative overflow-hidden">
              <div className="overflow-hidden aspect-[16/9]">
                <img
                  ref={(el) => { refs.current[i] = el; }}
                  src={s.img}
                  alt={s.caption}
                  width={s.w}
                  height={s.h}
                  loading="lazy"
                  className="w-full h-full object-cover will-change-transform"
                />
              </div>
              <figcaption className="mt-4 flex items-center justify-between text-bone/50">
                <span className="eyebrow">{s.caption}</span>
                <span className="eyebrow text-bone/30">0{i + 1} / 03</span>
              </figcaption>
            </figure>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
