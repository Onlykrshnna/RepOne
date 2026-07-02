import t1 from "@/assets/trainer-1.jpg";
import t2 from "@/assets/trainer-2.jpg";
import t3 from "@/assets/trainer-3.jpg";
import t4 from "@/assets/trainer-4.jpg";
import { Reveal } from "./Reveal";

const trainers = [
  { name: "James Whitaker", role: "Head of Strength", img: t1 },
  { name: "Sofia Marchetti", role: "Conditioning Lead", img: t2 },
  { name: "Marcus Adeyemi", role: "Performance Coach", img: t3 },
  { name: "Aiko Tanaka", role: "Recovery & Mobility", img: t4 },
];

export function Trainers() {
  return (
    <section id="trainers" className="relative py-32 md:py-48 px-6 md:px-12 border-t border-white/5">
      <div className="mx-auto max-w-[1440px]">
        <div className="grid md:grid-cols-12 gap-8 mb-16 md:mb-24">
          <div className="md:col-span-5">
            <Reveal>
              <p className="eyebrow mb-6"><span className="hairline" />The Team</p>
            </Reveal>
            <Reveal delay={100}>
              <h2 className="font-display text-5xl md:text-7xl text-bone">
                Coached by <span className="italic text-gold">name.</span>
              </h2>
            </Reveal>
          </div>
          <Reveal delay={200} className="md:col-span-5 md:col-start-8 flex items-end">
            <p className="text-bone/60 text-sm max-w-sm">
              Every coach on our floor holds a minimum of eight years of practice and a
              graduate-level qualification. Our client ratio never exceeds 1:6.
            </p>
          </Reveal>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {trainers.map((t, i) => (
            <Reveal key={t.name} delay={i * 100}>
              <div className="group relative overflow-hidden aspect-[4/5] bg-card">
                <img
                  src={t.img}
                  alt={t.name}
                  width={800}
                  height={1024}
                  loading="lazy"
                  className="w-full h-full object-cover grayscale contrast-110 transition-all duration-[900ms] ease-out group-hover:grayscale-0 group-hover:scale-[1.03]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/20 to-transparent opacity-80 group-hover:opacity-60 transition-opacity duration-500" />
                <div className="absolute inset-x-0 bottom-0 p-5 md:p-6">
                  <div className="translate-y-4 group-hover:translate-y-0 transition-transform duration-500 ease-out">
                    <h3 className="font-display text-2xl md:text-3xl text-bone leading-tight">{t.name}</h3>
                    <p className="eyebrow mt-2 text-gold/90">{t.role}</p>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
