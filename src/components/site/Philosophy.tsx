import philosophyImg from "@/assets/philosophy.jpg";
import { Reveal } from "./Reveal";
import { useScroll, useTransform, motion } from "framer-motion";
import { useRef } from "react";

export function Philosophy() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });
  const y = useTransform(scrollYProgress, [0, 1], [-100, 100]);
  return (
    <section id="philosophy" className="relative py-32 md:py-48 bg-[#F8F7F4] dark:bg-[#0E0E10] overflow-hidden">
      <div className="absolute top-0 left-0 select-none pointer-events-none overflow-hidden" aria-hidden>
        <span className="font-display leading-none text-[#E8E5DF] dark:text-[#1A1A1E] font-bold" style={{ fontSize: "28vw", letterSpacing: "-0.05em" }}>01</span>
      </div>
      <div className="relative z-10 mx-auto max-w-[1440px] px-6 md:px-12 grid md:grid-cols-12 gap-12 md:gap-16 items-center">
        <div className="md:col-span-5">
          <Reveal className="overflow-hidden">
            <div ref={ref} className="relative overflow-hidden h-full">
              <div className="absolute top-0 bottom-0 z-10 -left-3 w-0.5 bg-[#BEFF00]" />
              <motion.img style={{ y }} src={philosophyImg} alt="Atlas training floor" width={1280} height={1600} loading="lazy" className="w-full h-[120%] object-cover -mt-[10%]" />
            </div>
          </Reveal>
        </div>
        <div className="md:col-span-6 md:col-start-7">
          <Reveal>
            <div className="flex items-center gap-4 mb-10">
              <span className="font-display text-xl text-[#BEFF00]">01</span>
              <span className="block h-[1px] w-10 bg-[#0E0E10]/18 dark:bg-[#F0EDE6]/15" />
              <span className="text-[#0E0E10]/45 dark:text-[#F0EDE6]/35" style={{ fontFamily: "Inter", fontSize: "10px", letterSpacing: "0.26em", textTransform: "uppercase" }}>Our Philosophy</span>
            </div>
          </Reveal>
          <Reveal delay={80}>
            <h2 className="font-display text-[#0E0E10] dark:text-[#F0EDE6]" style={{ fontSize: "clamp(2.4rem,5vw,5.5rem)", lineHeight: "0.94", letterSpacing: "-0.02em" }}>
              Digital craft is a{" "}
              <span className="italic text-[#BEFF00]">serious</span>{" "}
              practice.
            </h2>
          </Reveal>
          <Reveal delay={180} className="mt-10 space-y-5 max-w-lg">
            <p className="text-[#0E0E10]/60 dark:text-[#F0EDE6]/55" style={{ fontFamily: "Inter", fontSize: "15px", lineHeight: "1.78" }}>
              We built Atlas as a demonstration of what Web Forge can deliver. No off-the-shelf templates. No bloated code. Just clean, scalable architecture and pixel-perfect design.
            </p>
            <p className="text-[#0E0E10]/60 dark:text-[#F0EDE6]/55" style={{ fontFamily: "Inter", fontSize: "15px", lineHeight: "1.78" }}>
              From full e-commerce platforms to bespoke SaaS dashboards, we treat your digital presence as a core business asset, not just a decoration.
            </p>
          </Reveal>
          <Reveal delay={280} className="mt-14 grid grid-cols-2 gap-8 max-w-md">
            {[{ n: "01", label: "Custom Architecture" }, { n: "02", label: "Scalable Systems" }, { n: "03", label: "Seamless UX/UI" }, { n: "04", label: "Reliable Support" }].map((item) => (
              <div key={item.n} className="border-t border-[#0E0E10]/10 dark:border-[#F0EDE6]/10 pt-5">
                <div className="font-display text-3xl text-[#BEFF00]">{item.n}</div>
                <p className="mt-3 text-[#0E0E10]/50 dark:text-[#F0EDE6]/45" style={{ fontFamily: "Inter", fontSize: "10px", letterSpacing: "0.22em", textTransform: "uppercase" }}>{item.label}</p>
              </div>
            ))}
          </Reveal>
        </div>
      </div>
    </section>
  );
}