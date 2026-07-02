import { useEffect, useState } from "react";
import { useReveal } from "@/hooks/use-reveal";

const stats = [
  { end: 1240, label: "Members trained", suffix: "" },
  { end: 11, label: "Years on the floor", suffix: "" },
  { end: 42, label: "Weekly coached sessions", suffix: "" },
  { end: 96, label: "Member retention", suffix: "%" },
];

function Counter({ end, suffix }: { end: number; suffix: string }) {
  const { ref, inView } = useReveal<HTMLDivElement>();
  const [v, setV] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const dur = 1800;
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      setV(Math.round(end * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, end]);
  return (
    <span ref={ref} className="font-display text-6xl md:text-8xl text-bone">
      {v.toLocaleString()}
      <span className="text-gold">{suffix}</span>
    </span>
  );
}

export function Stats() {
  return (
    <section className="relative py-32 md:py-48 px-6 md:px-12 border-t border-white/5">
      <div className="mx-auto max-w-[1440px]">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-14 md:gap-8">
          {stats.map((s, i) => (
            <div
              key={s.label}
              className={`flex flex-col ${
                i % 2 === 0 ? "md:pt-0" : "md:pt-16"
              }`}
            >
              <Counter end={s.end} suffix={s.suffix} />
              <p className="eyebrow mt-6 text-bone/60 max-w-[180px]">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
