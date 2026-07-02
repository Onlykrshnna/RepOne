import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const links = [
  { label: "Philosophy", href: "#philosophy" },
  { label: "Programs", href: "#programs" },
  { label: "Trainers", href: "#trainers" },
  { label: "Facility", href: "#facility" },
  { label: "Membership", href: "#membership" },
];

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-500",
        scrolled
          ? "backdrop-blur-xl bg-ink/70 border-b border-white/5"
          : "bg-transparent"
      )}
    >
      <div className="mx-auto flex max-w-[1440px] items-center justify-between px-6 md:px-12 py-5">
        <a href="#top" className="flex items-center gap-2 group">
          <span className="font-display text-2xl tracking-tight text-bone">ATLAS</span>
          <span className="eyebrow text-gold/80 hidden sm:inline ml-2">·&nbsp;&nbsp;EST 2014</span>
        </a>

        <nav className="hidden md:flex items-center gap-10">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-[12px] tracking-[0.22em] uppercase text-bone/70 hover:text-gold transition-colors duration-300 relative"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="hidden md:block">
          <a
            href="#book"
            className="text-[11px] tracking-[0.28em] uppercase px-6 py-3 border border-bone/20 text-bone hover:bg-gold hover:text-ink hover:border-gold transition-all duration-500"
          >
            Book a Visit
          </a>
        </div>

        <button
          className="md:hidden text-bone p-2"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          <div className="w-6 h-[1px] bg-bone mb-1.5" />
          <div className="w-6 h-[1px] bg-bone" />
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-white/5 bg-ink/95 backdrop-blur-xl">
          <div className="px-6 py-8 flex flex-col gap-5">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="text-sm tracking-[0.22em] uppercase text-bone/80"
              >
                {l.label}
              </a>
            ))}
            <a
              href="#book"
              onClick={() => setOpen(false)}
              className="mt-4 text-[11px] tracking-[0.28em] uppercase px-6 py-4 border border-gold text-gold text-center"
            >
              Book a Visit
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
