import { Reveal } from "./Reveal";
import { cn } from "@/lib/utils";

const tiers = [
  {
    name: "Foundation",
    price: "180",
    period: "/ month",
    features: [
      "Access to open training floor",
      "Two coached group sessions weekly",
      "Recovery suite",
      "Member events",
    ],
    cta: "Apply",
  },
  {
    name: "Signature",
    price: "340",
    period: "/ month",
    featured: true,
    features: [
      "Everything in Foundation",
      "Unlimited coached group sessions",
      "Quarterly performance assessment",
      "Guest privileges · 2 per month",
    ],
    cta: "Apply",
  },
  {
    name: "Private",
    price: "On request",
    period: "",
    features: [
      "Everything in Signature",
      "Named private coach · weekly",
      "Custom programming & nutrition",
      "Concierge scheduling",
    ],
    cta: "Enquire",
  },
];

export function Membership() {
  return (
    <section id="membership" className="relative py-32 md:py-48 px-6 md:px-12 border-t border-white/5">
      <div className="mx-auto max-w-[1440px]">
        <div className="text-center max-w-3xl mx-auto mb-20 md:mb-28">
          <Reveal>
            <p className="eyebrow mb-6">Membership</p>
          </Reveal>
          <Reveal delay={100}>
            <h2 className="font-display text-5xl md:text-7xl text-bone">
              A short list, <span className="italic text-gold">by design.</span>
            </h2>
          </Reveal>
          <Reveal delay={200}>
            <p className="mt-8 text-bone/60 text-sm max-w-lg mx-auto">
              We keep membership capped at 240. Applications open twice a year. Every tier
              includes a personal onboarding week.
            </p>
          </Reveal>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {tiers.map((t, i) => (
            <Reveal key={t.name} delay={i * 120}>
              <div
                className={cn(
                  "relative p-8 md:p-10 h-full transition-all duration-700 border",
                  t.featured
                    ? "border-gold/40 bg-gradient-to-b from-gold/[0.06] to-transparent hover:-translate-y-1 hover:border-gold/70 hover:shadow-[0_0_60px_-15px_rgba(201,169,97,0.35)]"
                    : "border-white/8 hover:border-white/20"
                )}
              >
                {t.featured && (
                  <span className="absolute top-6 right-6 eyebrow text-gold text-[10px]">
                    Most chosen
                  </span>
                )}
                <div className="eyebrow text-bone/60 mb-8">{t.name}</div>
                <div className="flex items-baseline gap-2 mb-10">
                  {t.price === "On request" ? (
                    <span className="font-display text-3xl md:text-4xl text-bone">On request</span>
                  ) : (
                    <>
                      <span className="text-bone/50 text-sm">£</span>
                      <span className="font-display text-6xl md:text-7xl text-bone">{t.price}</span>
                      <span className="text-bone/50 text-sm ml-1">{t.period}</span>
                    </>
                  )}
                </div>

                <ul className="space-y-4 mb-12">
                  {t.features.map((f) => (
                    <li key={f} className="flex items-start gap-3 text-bone/75 text-[14px] leading-relaxed">
                      <span className="mt-2 h-[1px] w-4 bg-gold shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>

                <a
                  href="#book"
                  className={cn(
                    "block text-center py-4 text-[11px] tracking-[0.28em] uppercase transition-all duration-500",
                    t.featured
                      ? "bg-gold text-ink hover:bg-bone"
                      : "border border-bone/20 text-bone hover:border-gold hover:text-gold"
                  )}
                >
                  {t.cta}
                </a>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
