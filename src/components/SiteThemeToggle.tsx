import React from "react";
import { useSiteTheme } from "../lib/theme-context";
import { Sun, Moon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function SiteThemeToggle() {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => {
    setMounted(true);
  }, []);

  const { siteTheme, toggleSiteTheme } = useSiteTheme();
  const isDark = siteTheme === "dark";

  if (!mounted) {
    // Return static default dark state to match server-side rendering exactly
    return (
      <button
        aria-label="Switch to light mode"
        className="relative inline-flex items-center justify-center w-9 h-9 rounded-full border border-white/10 bg-white/5 shadow-[0_0_14px_2px_rgba(190,255,0,0.14)]"
      >
        <span className="flex items-center justify-center">
          <Sun className="w-[17px] h-[17px] text-[#BEFF00]" strokeWidth={1.8} />
        </span>
      </button>
    );
  }

  return (
    <button
      onClick={toggleSiteTheme}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className={[
        "relative inline-flex items-center justify-center w-9 h-9 rounded-full",
        "transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#BEFF00]/40",
        isDark
          ? "border border-white/10 bg-white/5 hover:bg-white/10 shadow-[0_0_14px_2px_rgba(190,255,0,0.14)] hover:shadow-[0_0_22px_4px_rgba(190,255,0,0.28)]"
          : "border border-black/10 bg-black/5 hover:bg-black/10",
      ].join(" ")}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={siteTheme}
          initial={{ opacity: 0, scale: 0.5, rotate: -90 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          exit={{ opacity: 0, scale: 0.5, rotate: 90 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
          className="flex items-center justify-center"
        >
          {isDark ? (
            <Sun className="w-[17px] h-[17px] text-[#BEFF00]" strokeWidth={1.8} />
          ) : (
            <Moon className="w-[17px] h-[17px] text-[#0C0C0E]/70" strokeWidth={1.8} />
          )}
        </motion.span>
      </AnimatePresence>
    </button>
  );
}