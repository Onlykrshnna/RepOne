import { Reveal } from "./Reveal";
import { MagneticButton } from "./MagneticButton";

export function CTASection() {
  return (
    <section id="book" className="relative py-40 md:py-64 px-6 md:px-12 border-t border-white/5 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(201,169,97,0.15),transparent_60%)]" />
      <div className="relative mx-auto max-w-[1440px] text-center">
        <Reveal>
          <p className="eyebrow mb-8">Begin</p>
        </Reveal>
        <Reveal delay={100}>
          <h2 className="font-display text-6xl md:text-8xl lg:text-[10rem] text-bone leading-[0.95]">
            The floor is
            <br />
            <span className="italic text-gold">open to you.</span>
          </h2>
        </Reveal>
        <Reveal delay={250} className="mt-10 text-bone/60 max-w-md mx-auto text-[15px]">
          Book a private tour. Meet the coaches. Train a session as our guest — before you decide.
        </Reveal>
        <Reveal delay={400} className="mt-14">
          <MagneticButton href="mailto:tour@atlas.club">
            Request a Private Tour
            <span aria-hidden>→</span>
          </MagneticButton>
        </Reveal>
      </div>
    </section>
  );
}
