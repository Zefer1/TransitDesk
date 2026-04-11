/**
 * Theme context, provider, and hook for light/dark mode.
 *
 * - ThemeProvider: wraps the app in App.tsx, holds the theme state, and keeps
 *   the `dark` class on <html> in sync so Tailwind dark: variants work.
 * - useTheme: used by any component that needs to read or toggle the theme.
 *
 * The chosen theme is saved to localStorage so it survives page refreshes.
 */
import { createContext, useContext, useState, useEffect } from 'react';

type Theme = 'light' | 'dark';

/** Key used to persist the theme preference in localStorage. */
const THEME_STORAGE_KEY = 'transitdesk:theme:v1';

type ThemeContextValue = {
  theme: Theme;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Lazy init: read the saved preference once on first render — no useEffect needed.
  const [theme, setTheme] = useState<Theme>(() => {
    return localStorage.getItem(THEME_STORAGE_KEY) === 'dark' ? 'dark' : 'light';
  });

  // Sync the `dark` class on <html> whenever the theme changes.
  // This is the correct use of useEffect — we are updating the DOM (an external
  // system), not calling setState. We also persist the choice to localStorage here.
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  function toggleTheme() {
    setTheme((current) => (current === 'light' ? 'dark' : 'light'));
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

/** Call this inside any component to get the current theme and the toggle function. */
export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return ctx;
}
