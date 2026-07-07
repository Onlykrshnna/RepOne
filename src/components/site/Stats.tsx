import { Reveal } from "./Reveal";

const STATS = [
  { val: "100%", lbl: "ATTENDANCE IN 2 SECONDS" },
  { val: "24×7", lbl: "ONLINE MEMBERSHIP" },
  { val: "REAL TIME", lbl: "PAYMENT APPROVAL" },
  { val: "INSTANT", lbl: "DASHBOARD UPDATES" },
  { val: "0%", lbl: "MANUAL PAPERWORK" },
];

export function Stats() {
  return (
    <section className="py-24 md:py-36 bg-[#BEFF00] text-[#080809] selection:bg-[#080809] selection:text-[#BEFF00]">
      <div className="mx-auto max-w-[1440px] px-6 md:px-12 grid grid-cols-2 md:grid-cols-5 gap-12 md:gap-8">
        {STATS.map((s, i) => (
          <Reveal key={s.lbl} delay={i * 100}>
            <div className="flex flex-col border-t-2 border-[#080809]/20 pt-6">
              <span className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-medium tracking-tight mb-3">
                {s.val}
              </span>
              <span className="font-sans text-[10px] font-bold tracking-[0.15em] uppercase opacity-75">
                {s.lbl}
              </span>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
