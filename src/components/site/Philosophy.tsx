import philosophyImg from "@/assets/philosophy.jpg";
import { Reveal } from "./Reveal";

export function Philosophy() {
  return (
    <section id="philosophy" className="relative py-32 md:py-48 px-6 md:px-12">
      <div className="mx-auto max-w-[1440px] grid md:grid-cols-12 gap-12 md:gap-16 items-center">
        <div className="md:col-span-5 md:col-start-1">
          <Reveal className="overflow-hidden">
            <img
              src={philosophyImg}
              alt="A quiet moment inside the Atlas training floor"
              width={1280}
              height={1600}
              loading="lazy"
              className="w-full h-auto object-cover aspect-[4/5]"
            />
          </Reveal>
        </div>

        <div className="md:col-span-6 md:col-start-7">
          <Reveal>
            <p className="eyebrow mb-8">
              <span className="hairline" />
              Our Philosophy
            </p>
          </Reveal>

          <Reveal delay={100}>
            <h2 className="font-display text-4xl md:text-6xl lg:text-7xl text-bone">
              Strength is a
              <span className="italic text-gold"> quiet </span>
              practice.
            </h2>
          </Reveal>

          <Reveal delay={250} className="mt-10 space-y-6 text-bone/70 text-[15px] leading-[1.75] max-w-lg">
            <p>
              We built Atlas for the members no other gym is built for. No music
              chosen for a feed. No coach chasing volume. No sales floor.
            </p>
            <p>
              A hundred people a day, coached by name. Programming that respects
              your history and your calendar. Recovery treated as training, not
              decoration.
            </p>
          </Reveal>

          <Reveal delay={400} className="mt-12 grid grid-cols-2 gap-8 max-w-md">
            <div className="border-t border-white/10 pt-5">
              <div className="font-display text-4xl text-gold">01</div>
              <p className="eyebrow mt-3 text-bone/70">Coached, not watched</p>
            </div>
            <div className="border-t border-white/10 pt-5">
              <div className="font-display text-4xl text-gold">02</div>
              <p className="eyebrow mt-3 text-bone/70">Private, not exclusive</p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
