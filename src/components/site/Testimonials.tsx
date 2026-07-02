import { useEffect, useState } from "react";
import { Reveal } from "./Reveal";

const quotes = [
  {
    q: "The first gym I've belonged to that treats coaching as a craft. Two years in, my body reads younger than it did at thirty.",
    name: "Elena R.",
    detail: "Member since 2022 · Down 14 kg, up 40 kg on the deadlift",
  },
  {
    q: "It's the quietest room in London and the hardest hour of my week. Both, by design.",
    name: "David M.",
    detail: "Member since 2019 · First unassisted pull-up at 47",
  },
  {
    q: "James rebuilt me around an old back injury without ever making it the subject of a session. That's the whole difference.",
    name: "Priya S.",
    detail: "Member since 2020 · Half-marathon PR, injury-free",
  },
];

export function Testimonials() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((x) => (x + 1) % quotes.length), 6500);
    return () => clearInterval(t);
  }, []);

  return (
    <section className="relative py-32 md:py-48 px-6 md:px-12 border-t border-white/5">
      <div className="mx-auto max-w-5xl text-center">
        <Reveal>
          <p className="eyebrow mb-10">Members</p>
        </Reveal>

        <div className="relative min-h-[280px] md:min-h-[340px]">
          {quotes.map((q, idx) => (
            <blockquote
              key={idx}
              className={`absolute inset-0 transition-all duration-1000 ease-out ${
                i === idx ? "opacity-100 blur-0" : "opacity-0 blur-sm pointer-events-none"
              }`}
            >
              <p className="font-display text-3xl md:text-5xl lg:text-6xl text-bone leading-[1.15]">
                <span className="text-gold">“</span>
                {q.q}
                <span className="text-gold">”</span>
              </p>
              <footer className="mt-12">
                <div className="eyebrow text-bone">{q.name}</div>
                <div className="mt-2 text-bone/50 text-xs">{q.detail}</div>
              </footer>
            </blockquote>
          ))}
        </div>

        <div className="mt-16 flex justify-center gap-3">
          {quotes.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setI(idx)}
              aria-label={`Testimonial ${idx + 1}`}
              className={`h-[1px] transition-all duration-500 ${
                i === idx ? "w-12 bg-gold" : "w-6 bg-bone/20"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
