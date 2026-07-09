import React from 'react';
import { useTheme } from '../lib/theme-context';
import { Sun, Moon } from 'lucide-react';
import { motion } from 'framer-motion';

/**
 * ThemeToggle — used inside the member & admin dashboard sidebars.
 * A pill-style slider with an animated floating dot and icon labels,
 * giving a clearly distinct feel from the minimal site nav button.
 */
export function ThemeToggle() {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => {
    setMounted(true);
  }, []);

  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  if (!mounted) {
    // Render static placeholder matching the server-side default theme ('light')
    // to prevent hydration mismatches.
    return (
      <button
        role="switch"
        aria-checked={false}
        aria-label="Switch to dark mode"
        className={[
          'relative flex items-center gap-1 h-8 w-[72px] rounded-full px-1',
          'transition-colors duration-300 focus:outline-none',
          'bg-muted border border-border shadow-[inset_0_1px_4px_rgba(0,0,0,0.06)]',
        ].join(' ')}
      >
        <span className="absolute top-1 w-6 h-6 rounded-full z-10 flex items-center justify-center left-1 bg-background shadow-[0_2px_6px_rgba(0,0,0,0.1)]">
          <Sun className="w-3.5 h-3.5 text-amber-500" strokeWidth={2} />
        </span>
        <Sun className="w-3 h-3 ml-1 opacity-0" strokeWidth={2} />
        <Moon className="w-3 h-3 ml-auto mr-1 opacity-30 text-muted-foreground" strokeWidth={2} />
      </button>
    );
  }

  return (
    <button
      onClick={toggleTheme}
      role="switch"
      aria-checked={isDark}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className={[
        'relative flex items-center gap-1 h-8 w-[72px] rounded-full px-1',
        'transition-colors duration-300 focus:outline-none',
        'focus-visible:ring-2 focus-visible:ring-primary/40',
        'bg-muted border border-border shadow-[inset_0_1px_4px_rgba(0,0,0,0.06)]',
      ].join(' ')}
    >
      {/* Sliding pill dot */}
      <motion.span
        layout
        transition={{ type: 'spring', stiffness: 500, damping: 34 }}
        className={[
          'absolute top-1 w-6 h-6 rounded-full z-10',
          'flex items-center justify-center',
          isDark
            ? 'right-1 bg-primary text-primary-foreground shadow'
            : 'left-1 bg-background text-foreground shadow',
        ].join(' ')}
      >
        {isDark ? (
          <Moon className="w-3.5 h-3.5 text-primary-foreground" strokeWidth={2} />
        ) : (
          <Sun className="w-3.5 h-3.5 text-amber-500" strokeWidth={2} />
        )}
      </motion.span>

      {/* Track labels */}
      <Sun
        className={[
          'w-3 h-3 ml-1 transition-opacity duration-200',
          isDark ? 'opacity-30 text-muted-foreground' : 'opacity-0',
        ].join(' ')}
        strokeWidth={2}
      />
      <Moon
        className={[
          'w-3 h-3 ml-auto mr-1 transition-opacity duration-200',
          isDark ? 'opacity-0' : 'opacity-30 text-muted-foreground',
        ].join(' ')}
        strokeWidth={2}
      />
    </button>
  );
}
