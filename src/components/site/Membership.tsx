import { Reveal } from "./Reveal";
import { Check } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth-context";
import { tiers } from "@/constants";

export function Membership() {
  const { session, isLoading } = useAuth();

  return (
    <section id="packages" className="relative py-32 md:py-48 bg-[#0C0C0E] overflow-hidden">
      <div className="absolute top-1/4 -right-10 select-none pointer-events-none overflow-hidden" aria-hidden>
        <span className="font-display leading-none text-[#141418] font-bold" style={{ fontSize: "28vw", letterSpacing: "-0.05em" }}>05</span>
      </div>

      <div className="relative z-10 mx-auto max-w-[1440px] px-6 md:px-12">
        <Reveal>
          <div className="flex items-center gap-4 mb-16 md:mb-24">
            <span className="font-display text-xl text-[#BEFF00]">05</span>
            <span className="block h-[1px] w-10 bg-[#F0EDE6]/15" />
            <span className="text-[#F0EDE6]/35" style={{ fontFamily: "Inter", fontSize: "10px", letterSpacing: "0.26em", textTransform: "uppercase" }}>Packages</span>
          </div>
        </Reveal>

        <div className="flex flex-col gap-12 items-center text-center">
          <div className="max-w-2xl">
            <Reveal>
              <h2 className="font-display text-[#F0EDE6]" style={{ fontSize: "clamp(2.4rem,4vw,4.5rem)", lineHeight: "1", letterSpacing: "-0.02em" }}>
                RepOne <br /><span className="italic text-[#BEFF00]">Packages.</span>
              </h2>
              <p className="mt-6 text-[#F0EDE6]/40 text-center mx-auto" style={{ fontFamily: "Inter", fontSize: "14px", lineHeight: "1.7" }}>
                Transparent pricing built for gyms of all sizes. Scale your software capacity as your member count grows.
              </p>
            </Reveal>
          </div>

          <div className="grid md:grid-cols-3 gap-6 w-full mt-4">
            {tiers.map((tier, i) => {
              const isFeatured = tier.featured;
              return (
                <Reveal key={tier.name} delay={i * 100}>
                  <div className={`h-full flex flex-col p-6 xl:p-8 transition-colors duration-300 text-left rounded ${isFeatured ? "bg-[#BEFF00] text-[#080809]" : "bg-[#141418] text-[#F0EDE6] border border-[#F0EDE6]/10"}`}>
                    <h3 className="font-display text-2xl tracking-tight mb-2">{tier.name}</h3>
                    <div className="flex items-baseline gap-1 mb-6 whitespace-nowrap">
                      <span className="font-display text-3xl xl:text-4xl tracking-tight">{tier.price}</span>
                      {tier.period && (
                        <span className={`text-xs uppercase font-sans ${isFeatured ? "text-[#080809]/60" : "text-[#F0EDE6]/40"}`}>/{tier.period}</span>
                      )}
                    </div>
                    
                    <div className="mt-auto">
                      <ul className="space-y-4 mb-8">
                        {tier.features.map(f => (
                          <li key={f} className="flex items-center gap-3">
                            <Check className={`w-4 h-4 shrink-0 ${isFeatured ? "text-[#080809]" : "text-[#BEFF00]"}`} />
                            <span className="font-sans text-[13px]">{f}</span>
                          </li>
                        ))}
                      </ul>
                      
                      {tier.name === "Enterprise" ? (
                        <a href="#book" className={`block w-full text-center py-4 transition-colors duration-300 font-bold ${isFeatured ? "bg-[#080809] text-[#BEFF00] hover:bg-white hover:text-[#080809]" : "bg-[#F0EDE6]/10 text-[#F0EDE6] hover:bg-[#F0EDE6] hover:text-[#080809]"}`} style={{ fontFamily: "Inter", fontSize: "11px", letterSpacing: "0.26em", textTransform: "uppercase" }}>
                          {tier.cta}
                        </a>
                      ) : (
                        <Link to="/signup" className={`block w-full text-center py-4 transition-colors duration-300 font-bold ${isFeatured ? "bg-[#080809] text-[#BEFF00] hover:bg-white hover:text-[#080809]" : "bg-[#F0EDE6]/10 text-[#F0EDE6] hover:bg-[#F0EDE6] hover:text-[#080809]"}`} style={{ fontFamily: "Inter", fontSize: "11px", letterSpacing: "0.26em", textTransform: "uppercase" }}>
                          {tier.cta}
                        </Link>
                      )}
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
