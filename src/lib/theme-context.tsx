import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

// ─── Dashboard Theme ──────────────────────────────────────────────────────────
// Controls dark class on <html>. Used ONLY inside member & admin layouts.
// Cleans up on unmount so it never bleeds into the public website.

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('dashboard-theme') as Theme;
      if (saved) return saved;
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark';
    }
    return 'light';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.style.colorScheme = 'dark';
    } else {
      root.classList.remove('dark');
      root.style.colorScheme = 'light';
    }
    localStorage.setItem('dashboard-theme', theme);
  }, [theme]);

  useEffect(() => {
    // Remove dark from <html> when dashboard unmounts so it never leaks to the site
    return () => {
      document.documentElement.classList.remove('dark');
      document.documentElement.style.colorScheme = '';
    };
  }, []);

  const toggleTheme = () => setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within a ThemeProvider');
  return ctx;
}

// ─── Site Theme ───────────────────────────────────────────────────────────────
// Scoped to the public website. Applies dark class to a wrapper <div>,
// NOT to document.documentElement. Stores preference in 'site-theme' key.
// Completely independent from the dashboard theme.

interface SiteThemeContextType {
  siteTheme: Theme;
  toggleSiteTheme: () => void;
}

const SiteThemeContext = createContext<SiteThemeContextType | undefined>(undefined);

export function SiteThemeProvider({ children }: { children: React.ReactNode }) {
  const [siteTheme, setSiteTheme] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('site-theme') as Theme;
      if (saved) return saved;
    }
    return 'dark'; // Website defaults to dark aesthetic
  });

  useEffect(() => {
    localStorage.setItem('site-theme', siteTheme);
  }, [siteTheme]);

  const toggleSiteTheme = () => setSiteTheme((prev) => (prev === 'light' ? 'dark' : 'light'));

  return (
    <SiteThemeContext.Provider value={{ siteTheme, toggleSiteTheme }}>
      {/* dark class on this wrapper div — NOT on html — fully isolates site theme */}
      <div className={siteTheme === 'dark' ? 'dark' : ''} style={{ colorScheme: siteTheme }}>
        {children}
      </div>
    </SiteThemeContext.Provider>
  );
}

export function useSiteTheme() {
  const ctx = useContext(SiteThemeContext);
  if (!ctx) throw new Error('useSiteTheme must be used within a SiteThemeProvider');
  return ctx;
}
