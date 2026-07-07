import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { links } from "@/constants";
import { useAuth } from "@/lib/auth-context";
import { Link } from "@tanstack/react-router";
import { SiteThemeToggle } from "@/components/SiteThemeToggle";

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { session, isLoading } = useAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const lbl: React.CSSProperties = { fontFamily: "Inter", fontSize: "10px", letterSpacing: "0.26em", textTransform: "uppercase" };

  return (
    <header className={cn("fixed inset-x-0 top-0 z-50 transition-all duration-500", scrolled ? "border-b border-white/[0.06] bg-[#080809]/85 backdrop-blur-xl" : "bg-transparent")}>
      <div className="mx-auto flex max-w-[1440px] items-center justify-between px-6 md:px-12 py-5">
        <a href="#top" className="flex items-center gap-2">
          <img src="/logo.png" alt="Logo" className="h-10 md:h-[100px] object-contain" />
          <span className="hidden sm:inline text-[#F0EDE6]/35" style={{ fontFamily: "Inter", fontSize: "9px", letterSpacing: "0.22em", textTransform: "uppercase" }}>&middot; BY WEBFORGE</span>
          <div className="flex items-center gap-1.5 px-2 py-0.5 bg-[#BEFF00]/10 border border-[#BEFF00]/30 rounded text-[#BEFF00]" style={{ fontSize: "8px", fontFamily: "Inter", letterSpacing: "0.1em", fontWeight: 700 }}>
            DEMO: XYZ FITNESS
          </div>
        </a>

        <nav className="hidden md:flex items-center gap-10">
          {links.map((l) => (
            <a key={l.href} href={l.href} className="text-[#F0EDE6]/45 hover:text-[#BEFF00] transition-colors duration-300" style={lbl}>{l.label}</a>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-4">
          <SiteThemeToggle />
          {!isLoading && !session && (
            <Link to="/signup" className="text-[#F0EDE6]/55 hover:text-[#BEFF00] transition-colors duration-300" style={lbl}>Sign Up</Link>
          )}
          {!isLoading && (session ? (
            <Link to="/dashboard" className="px-5 py-2.5 bg-[#BEFF00] text-[#080809] hover:bg-white transition-colors duration-300" style={lbl}>Dashboard</Link>
          ) : (
            <Link to="/login" className="px-5 py-2.5 border border-[#F0EDE6]/20 text-[#F0EDE6]/70 hover:border-[#BEFF00] hover:text-[#BEFF00] transition-all duration-300" style={lbl}>Login</Link>
          ))}
        </div>

        <button className="md:hidden text-[#F0EDE6] p-2 flex flex-col gap-[5px]" onClick={() => setOpen((v) => !v)} aria-label="Toggle menu">
          <span className={cn("block w-6 h-[1px] bg-[#F0EDE6] origin-center transition-all duration-300", open && "rotate-45 translate-y-[6px]")} />
          <span className={cn("block h-[1px] bg-[#F0EDE6] transition-all duration-300", open ? "w-0 opacity-0" : "w-4")} />
          <span className={cn("block w-6 h-[1px] bg-[#F0EDE6] origin-center transition-all duration-300", open && "-rotate-45 -translate-y-[6px]")} />
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-white/[0.06] bg-[#080809]/97 backdrop-blur-xl">
          <div className="px-6 py-8 flex flex-col gap-5">
            {links.map((l) => (<a key={l.href} href={l.href} onClick={() => setOpen(false)} className="text-[#F0EDE6]/65 hover:text-[#BEFF00] transition-colors" style={{ ...lbl, fontSize: "12px" }}>{l.label}</a>))}
            {!isLoading && !session && (
              <Link to="/signup" onClick={() => setOpen(false)} className="mt-4 py-4 bg-[#BEFF00] text-[#080809] text-center" style={{ ...lbl, fontSize: "11px" }}>Sign Up</Link>
            )}
            {!isLoading && (session ? (
              <Link to="/dashboard" onClick={() => setOpen(false)} className="py-4 border border-[#BEFF00] text-[#BEFF00] text-center" style={{ ...lbl, fontSize: "11px" }}>Dashboard</Link>
            ) : (
              <Link to="/login" onClick={() => setOpen(false)} className="py-4 border border-[#F0EDE6]/20 text-[#F0EDE6]/60 text-center" style={{ ...lbl, fontSize: "11px" }}>Login</Link>
            ))}
            <div className="flex items-center justify-between pt-4 border-t border-white/[0.06]">
              <span className="text-[#F0EDE6]/30" style={{ fontFamily: "Inter", fontSize: "10px", letterSpacing: "0.22em", textTransform: "uppercase" }}>Appearance</span>
              <SiteThemeToggle />
            </div>
          </div>
        </div>
      )}
    </header>
  );
}