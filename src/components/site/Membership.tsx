import { Reveal } from "./Reveal";
import { Check } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth-context";

const TIERS = [
  {
    name: "Basic",
    price: "₹1999",
    period: "Month",
    desc: "Perfect for casual gym goers looking to stay active.",
    features: ["Access to gym floor", "Standard locker", "1 Trainer consult", "Free WiFi"],
    isFeatured: false,
  },
  {
    name: "Elite",
    price: "₹2999",
    period: "Month",
    desc: "Our most popular option for dedicated enthusiasts.",
    features: ["24/7 Gym access", "Unlimited group classes", "Free sauna access", "4 Trainer consults"],
    isFeatured: true,
  },
  {
    name: "VIP",
    price: "₹4999",
    period: "Month",
    desc: "All-inclusive premium experience with absolute freedom.",
    features: ["All Elite features", "Dedicated Trainer", "VIP lounge access", "Free drinks"],
    isFeatured: false,
  },
];

export function Membership() {
  const { session, isLoading } = useAuth();

  return (
    <section id="membership" className="relative py-32 md:py-48 bg-[#0C0C0E] overflow-hidden">
      <div className="absolute top-1/4 -right-10 select-none pointer-events-none overflow-hidden" aria-hidden>
        <span className="font-display leading-none text-[#141418] font-bold" style={{ fontSize: "28vw", letterSpacing: "-0.05em" }}>05</span>
      </div>

      <div className="relative z-10 mx-auto max-w-[1440px] px-6 md:px-12">
        <Reveal>
          <div className="flex items-center gap-4 mb-16 md:mb-24">
            <span className="font-display text-xl text-[#BEFF00]">05</span>
            <span className="block h-[1px] w-10 bg-[#F0EDE6]/15" />
            <span className="text-[#F0EDE6]/35" style={{ fontFamily: "Inter", fontSize: "10px", letterSpacing: "0.26em", textTransform: "uppercase" }}>Membership</span>
          </div>
        </Reveal>

        <div className="flex flex-col gap-12 items-center text-center">
          <div className="max-w-2xl">
            <Reveal>
              <h2 className="font-display text-[#F0EDE6]" style={{ fontSize: "clamp(2.4rem,4vw,4.5rem)", lineHeight: "1", letterSpacing: "-0.02em" }}>
                Built for <br /><span className="italic text-[#BEFF00]">results.</span>
              </h2>
              <p className="mt-6 text-[#F0EDE6]/40 text-center mx-auto" style={{ fontFamily: "Inter", fontSize: "14px", lineHeight: "1.7" }}>
                No hidden fees. No usage caps. We provide the infrastructure you need to reach your fitness goals.
              </p>
            </Reveal>
          </div>

          <div className="grid md:grid-cols-3 gap-6 w-full mt-4">
            {TIERS.map((tier, i) => (
              <Reveal key={tier.name} delay={i * 100}>
                <div className={`h-full flex flex-col p-6 xl:p-8 transition-colors duration-300 text-left ${tier.isFeatured ? "bg-[#BEFF00] text-[#080809]" : "bg-[#141418] text-[#F0EDE6] border border-[#F0EDE6]/10"}`}>
                  <h3 className="font-display text-2xl tracking-tight mb-2">{tier.name}</h3>
                  <div className="flex items-baseline gap-1 mb-4 whitespace-nowrap">
                    <span className="font-display text-3xl xl:text-4xl tracking-tight">{tier.price}</span>
                    <span className="opacity-50 text-sm">/{tier.period}</span>
                  </div>
                  <p className={`mb-6 ${tier.isFeatured ? "opacity-80" : "opacity-40"}`} style={{ fontFamily: "Inter", fontSize: "12px", lineHeight: "1.5" }}>
                    {tier.desc}
                  </p>
                  
                  <div className="mt-auto">
                    <ul className="space-y-3 mb-8">
                      {tier.features.map(f => (
                        <li key={f} className="flex items-center gap-2">
                          <Check className={`w-4 h-4 shrink-0 ${tier.isFeatured ? "text-[#080809]" : "text-[#BEFF00]"}`} />
                          <span style={{ fontFamily: "Inter", fontSize: "11px" }}>{f}</span>
                        </li>
                      ))}
                    </ul>
                    {!isLoading && session ? (
                      <Link to="/dashboard" className={`block w-full text-center py-4 transition-colors duration-300 ${tier.isFeatured ? "bg-[#080809] text-[#BEFF00] hover:bg-white hover:text-[#080809]" : "bg-[#F0EDE6]/10 text-[#F0EDE6] hover:bg-[#F0EDE6] hover:text-[#080809]"}`} style={{ fontFamily: "Inter", fontSize: "11px", letterSpacing: "0.26em", textTransform: "uppercase", fontWeight: 500 }}>
                        Go to Dashboard
                      </Link>
                    ) : (
                      <Link to="/signup" className={`block w-full text-center py-4 transition-colors duration-300 ${tier.isFeatured ? "bg-[#080809] text-[#BEFF00] hover:bg-white hover:text-[#080809]" : "bg-[#F0EDE6]/10 text-[#F0EDE6] hover:bg-[#F0EDE6] hover:text-[#080809]"}`} style={{ fontFamily: "Inter", fontSize: "11px", letterSpacing: "0.26em", textTransform: "uppercase", fontWeight: 500 }}>
                        Join Now
                      </Link>
                    )}
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
