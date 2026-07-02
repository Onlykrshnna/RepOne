import { useEffect, useRef, useState } from "react";
import strength from "@/assets/program-strength.jpg";
import hiit from "@/assets/program-hiit.jpg";
import recovery from "@/assets/program-recovery.jpg";
import pt from "@/assets/program-pt.jpg";
import { Reveal } from "./Reveal";
import { cn } from "@/lib/utils";

const programs = [
  {
    n: "01",
    name: "Strength",
    tag: "Barbell · Kettlebell · Structural",
    copy: "Progressive periodization built around your lifts. Twelve-week arcs, weekly reads.",
    img: strength,
  },
  {
    n: "02",
    name: "Conditioning",
    tag: "HIIT · Zone 2 · Interval",
    copy: "Precisely dosed intensity. Heart-rate governed sessions in small groups of six.",
    img: hiit,
  },
  {
    n: "03",
    name: "Recovery",
    tag: "Sauna · Ice · Mobility",
    copy: "A full recovery suite. Contrast therapy, guided mobility, sleep and nutrition coaching.",
    img: recovery,
  },
  {
    n: "04",
    name: "Private Coaching",
    tag: "1:1 · Assessment · Programming",
    copy: "A named coach, quarterly assessments, and a plan that adapts to your life outside.",
    img: pt,
  },
];

export function Programs() {
  const [active, setActive] = useState(0);
  const imgRefs = useRef<(HTMLImageElement | null)[]>([]);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      imgRefs.current.forEach((img) => {
        if (!img) return;
        const rect = img.getBoundingClientRect();
        const offset = (rect.top + window.scrollY - y - window.innerHeight / 2) * 0.08;
        img.style.transform = `translateY(${offset}px) scale(1.15)`;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <section id="programs" className="relative py-32 md:py-48 px-6 md:px-12 bg-ink">
      <div className="mx-auto max-w-[1440px]">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8 mb-16 md:mb-24">
          <div>
            <Reveal>
              <p className="eyebrow mb-6"><span className="hairline" />Programs</p>
            </Reveal>
            <Reveal delay={100}>
              <h2 className="font-display text-5xl md:text-7xl text-bone max-w-xl">
                Four disciplines. <span className="italic text-gold">One standard.</span>
              </h2>
            </Reveal>
          </div>
          <Reveal delay={200}>
            <p className="text-bone/60 text-sm max-w-xs">
              Every program is coached in person by a full-time member of our team. No apps, no
              queues, no drop-ins.
            </p>
          </Reveal>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {programs.map((p, i) => (
            <Reveal key={p.name} delay={i * 120}>
              <a
                href="#book"
                className={cn(
                  "group block relative overflow-hidden bg-card aspect-[3/4]",
                  "transition-all duration-700"
                )}
                onMouseEnter={() => setActive(i)}
              >
                <div className="absolute inset-0 overflow-hidden">
                  <img
                    ref={(el) => { imgRefs.current[i] = el; }}
                    src={p.img}
                    alt={p.name}
                    width={1024}
                    height={1280}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.05]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-transparent" />
                </div>

                <div className="relative h-full p-6 md:p-7 flex flex-col justify-between">
                  <div className="flex items-start justify-between">
                    <span className="font-display text-xl text-gold">{p.n}</span>
                    <span className="text-[10px] tracking-[0.28em] uppercase text-bone/50 group-hover:text-gold transition-colors">
                      Enter →
                    </span>
                  </div>
                  <div>
                    <h3 className="font-display text-3xl md:text-4xl text-bone leading-none">{p.name}</h3>
                    <p className="eyebrow mt-3 text-bone/60">{p.tag}</p>
                    <div className="grid transition-all duration-700 ease-out grid-rows-[0fr] group-hover:grid-rows-[1fr] opacity-0 group-hover:opacity-100 mt-0 group-hover:mt-5">
                      <p className="overflow-hidden text-[13px] leading-relaxed text-bone/70">
                        {p.copy}
                      </p>
                    </div>
                  </div>
                </div>
              </a>
            </Reveal>
          ))}
        </div>

        <div className="sr-only" aria-live="polite">{programs[active].name}</div>
      </div>
    </section>
  );
}
