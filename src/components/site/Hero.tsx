import { useEffect, useState } from "react";
import heroImg from "@/assets/hero.jpg";
import { MagneticButton } from "./MagneticButton";

export function Hero() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const t = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(t);
  }, []);

  const line = (text: string, delay: number) => (
    <span
      className="block reveal"
      style={{
        transitionDelay: `${delay}ms`,
        transitionDuration: "1400ms",
      }}
      data-in={mounted || undefined}
    >
      {text}
    </span>
  );

  return (
    <section id="top" className="relative h-[100svh] w-full overflow-hidden grain">
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center scale-105"
        style={{ backgroundImage: `url(${heroImg})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-ink/70 via-ink/50 to-ink" />
      <div className="absolute inset-0 bg-gradient-to-r from-ink/80 via-transparent to-transparent" />

      {/* Top eyebrow */}
      <div
        className={`absolute top-32 left-6 md:left-12 eyebrow text-bone/60 transition-all duration-1000 ${
          mounted ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"
        }`}
        style={{ transitionDelay: "200ms" }}
      >
        <span className="hairline" />
        A Private Strength Club · London
      </div>

      {/* Headline */}
      <div className="relative z-10 h-full flex flex-col justify-end pb-28 md:pb-32 px-6 md:px-12 max-w-[1440px] mx-auto">
        <h1 className="font-display text-[15vw] md:text-[9.5vw] leading-[0.9] text-bone">
          {line("Train like it's", 400)}
          {line("the only thing", 650)}
          <span
            className="block reveal italic text-gold/95"
            style={{ transitionDelay: "900ms", transitionDuration: "1400ms" }}
            data-in={mounted || undefined}
          >
            that matters.
          </span>
        </h1>

        <div
          className={`mt-10 md:mt-14 flex flex-col md:flex-row md:items-end md:justify-between gap-8 transition-all duration-1000 ${
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
          style={{ transitionDelay: "1300ms" }}
        >
          <p className="max-w-md text-bone/70 text-[15px] leading-relaxed">
            A membership built for the disciplined few. Coached strength, refined
            recovery, no mirrors for show.
          </p>
          <MagneticButton href="#book">
            Book a Private Tour
            <span aria-hidden>→</span>
          </MagneticButton>
        </div>
      </div>

      {/* Scroll indicator */}
      <div
        className={`absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 transition-opacity duration-1000 ${
          mounted ? "opacity-60" : "opacity-0"
        }`}
        style={{ transitionDelay: "1600ms" }}
      >
        <span className="eyebrow text-[10px] text-bone/50">Scroll</span>
        <div className="relative h-14 w-[1px] overflow-hidden bg-bone/15">
          <div
            className="absolute top-0 left-0 h-1/2 w-full bg-gold"
            style={{ animation: "scrollpulse 2.4s ease-in-out infinite" }}
          />
        </div>
      </div>

      <style>{`
        @keyframes scrollpulse {
          0% { transform: translateY(-100%); }
          70% { transform: translateY(200%); }
          100% { transform: translateY(200%); }
        }
        .reveal[data-in] {
          opacity: 1;
          filter: blur(0);
          transform: translateY(0);
        }
      `}</style>
    </section>
  );
}
