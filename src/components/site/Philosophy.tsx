import { Reveal } from "./Reveal";
import { UserCheck, Laptop, TrendingUp } from "lucide-react";

export function Philosophy() {
  const pillars = [
    {
      title: "Member Experience",
      icon: <UserCheck className="w-8 h-8 text-[#BEFF00]" />,
      desc: "Delight your clients with modern, seamless interfaces designed to run on any device.",
      features: [
        "Online registration & login",
        "Direct membership purchase",
        "Instant QR code attendance",
        "Progress & workout tracking",
        "Automated push notifications",
      ]
    },
    {
      title: "Gym Management",
      icon: <Laptop className="w-8 h-8 text-[#BEFF00]" />,
      desc: "Put your administrative workflows on autopilot and free up your time.",
      features: [
        "Real-time attendance logs",
        "Automated revenue collection",
        "Trainer scheduling & portals",
        "Dynamic class capacity limits",
        "Payment verification pipeline",
        "Instant guest passes check-in",
      ]
    },
    {
      title: "Business Growth",
      icon: <TrendingUp className="w-8 h-8 text-[#BEFF00]" />,
      desc: "Equip your brand with marketing tools to attract, convert, and retain members.",
      features: [
        "Premium public gym website",
        "Optimized SEO configurations",
        "Live reports & analytics",
        "Integrated member CRM",
        "Marketing & referral tools",
        "Automated lead generation",
      ]
    }
  ];

  return (
    <section id="why-repone" className="relative py-32 md:py-48 bg-[#F8F7F4] dark:bg-[#0E0E10] overflow-hidden">
      <div className="absolute top-0 left-0 select-none pointer-events-none overflow-hidden" aria-hidden>
        <span className="font-display leading-none text-[#E8E5DF] dark:text-[#1A1A1E] font-bold" style={{ fontSize: "28vw", letterSpacing: "-0.05em" }}>01</span>
      </div>
      
      <div className="relative z-10 mx-auto max-w-[1440px] px-6 md:px-12">
        <Reveal>
          <div className="flex items-center gap-4 mb-10">
            <span className="font-display text-xl text-[#BEFF00]">01</span>
            <span className="block h-[1px] w-10 bg-[#0E0E10]/18 dark:bg-[#F0EDE6]/15" />
            <span className="text-[#0E0E10]/45 dark:text-[#F0EDE6]/35" style={{ fontFamily: "Inter", fontSize: "10px", letterSpacing: "0.26em", textTransform: "uppercase" }}>Why RepOne</span>
          </div>
        </Reveal>

        <div className="max-w-3xl mb-20 md:mb-28">
          <Reveal delay={80}>
            <h2 className="font-display text-[#0E0E10] dark:text-[#F0EDE6]" style={{ fontSize: "clamp(2.4rem,5vw,5.5rem)", lineHeight: "0.94", letterSpacing: "-0.02em" }}>
              Built For <br />
              <span className="italic text-[#BEFF00]">Modern Gyms.</span>
            </h2>
          </Reveal>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 mt-12">
          {pillars.map((pillar, i) => (
            <Reveal key={pillar.title} delay={120 + i * 80}>
              <div className="h-full bg-white dark:bg-[#141418] border border-[#0E0E10]/5 dark:border-[#F0EDE6]/5 p-8 xl:p-10 flex flex-col transition-all duration-300 hover:border-[#BEFF00]/30 shadow-sm rounded">
                <div className="mb-6 w-14 h-14 bg-[#080809] flex items-center justify-center rounded">
                  {pillar.icon}
                </div>
                <h3 className="font-display text-2xl text-[#0E0E10] dark:text-[#F0EDE6] tracking-tight mb-4">{pillar.title}</h3>
                <p className="text-[#0E0E10]/60 dark:text-[#F0EDE6]/50 mb-8 text-[14px]" style={{ fontFamily: "Inter", lineHeight: "1.6" }}>
                  {pillar.desc}
                </p>
                <div className="mt-auto border-t border-[#0E0E10]/10 dark:border-[#F0EDE6]/10 pt-6">
                  <ul className="space-y-3">
                    {pillar.features.map((feat) => (
                      <li key={feat} className="flex items-center gap-3">
                        <span className="w-1.5 h-1.5 bg-[#BEFF00] rounded-full shrink-0" />
                        <span className="text-[#0E0E10]/70 dark:text-[#F0EDE6]/70 text-[13px]" style={{ fontFamily: "Inter" }}>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}