import { Reveal } from "./Reveal";

export function Footer() {
  return (
    <footer className="relative border-t border-white/5 px-6 md:px-12 py-20">
      <div className="mx-auto max-w-[1440px]">
        <Reveal>
          <div className="grid md:grid-cols-12 gap-12 md:gap-8">
            <div className="md:col-span-4">
              <div className="font-display text-3xl text-bone">ATLAS</div>
              <p className="mt-4 text-bone/50 text-sm max-w-xs leading-relaxed">
                A private strength club for those who train as a practice, not a phase.
              </p>
            </div>

            <div className="md:col-span-2">
              <div className="eyebrow mb-5 text-bone/50">Explore</div>
              <ul className="space-y-3 text-bone/80 text-sm">
                <li><a href="#philosophy" className="hover:text-gold transition-colors">Philosophy</a></li>
                <li><a href="#programs" className="hover:text-gold transition-colors">Programs</a></li>
                <li><a href="#trainers" className="hover:text-gold transition-colors">Trainers</a></li>
                <li><a href="#membership" className="hover:text-gold transition-colors">Membership</a></li>
              </ul>
            </div>

            <div className="md:col-span-2">
              <div className="eyebrow mb-5 text-bone/50">Follow</div>
              <ul className="space-y-3 text-bone/80 text-sm">
                <li><a href="#" className="hover:text-gold transition-colors">Instagram</a></li>
                <li><a href="#" className="hover:text-gold transition-colors">Journal</a></li>
                <li><a href="#" className="hover:text-gold transition-colors">Spotify</a></li>
              </ul>
            </div>

            <div className="md:col-span-4">
              <div className="eyebrow mb-5 text-bone/50">Newsletter</div>
              <form
                onSubmit={(e) => e.preventDefault()}
                className="flex items-center border-b border-bone/15 focus-within:border-gold transition-colors"
              >
                <input
                  type="email"
                  placeholder="your@email.com"
                  className="flex-1 bg-transparent py-3 text-sm text-bone placeholder:text-bone/30 outline-none"
                />
                <button
                  type="submit"
                  className="eyebrow text-gold hover:text-bone transition-colors"
                >
                  Subscribe →
                </button>
              </form>
              <p className="mt-8 text-bone/50 text-sm not-italic">
                47 Redchurch Street<br />
                London E2 7DP
              </p>
            </div>
          </div>
        </Reveal>

        <div className="mt-20 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between gap-4 text-bone/40 text-xs">
          <div>© {new Date().getFullYear()} Atlas Club Ltd. All rights reserved.</div>
          <div className="flex gap-6">
            <a href="#" className="hover:text-gold transition-colors">Privacy</a>
            <a href="#" className="hover:text-gold transition-colors">Terms</a>
            <a href="#" className="hover:text-gold transition-colors">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
