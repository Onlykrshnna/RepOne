import { Reveal } from "./Reveal";

const STATS = [
  { val: "240", lbl: "MEMBER CAP" },
  { val: "06", lbl: "ELITE COACHES" },
  { val: "11", lbl: "YEARS ESTABLISHED" },
  { val: "1:4", lbl: "COACH TO MEMBER MAX" },
];

export function Stats() {
  return (
    <section className="py-24 md:py-36 bg-[#BEFF00] text-[#080809] selection:bg-[#080809] selection:text-[#BEFF00]">
      <div className="mx-auto max-w-[1440px] px-6 md:px-12 grid grid-cols-2 md:grid-cols-4 gap-12 md:gap-8">
        {STATS.map((s, i) => (
          <Reveal key={s.lbl} delay={i * 100}>
            <div className="flex flex-col border-t-2 border-[#080809]/20 pt-6">
              <span className="font-display text-5xl md:text-7xl font-medium tracking-tight mb-3">
                {s.val}
              </span>
              <span className="font-sans text-[11px] font-bold tracking-[0.2em] uppercase opacity-60">
                {s.lbl}
              </span>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
