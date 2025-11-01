import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

type Theme = "light" | "dark" | "system";
type ThemeContextValue = {
  theme: Theme;
  setTheme: (t: Theme) => void;
  isDark: boolean;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);
const STORAGE_KEY = "rise:theme";

function resolveIsDark(theme: Theme) {
  if (theme === "dark") return true;
  if (theme === "light") return false;
  // system
  return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
}

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    try {
      return (localStorage.getItem(STORAGE_KEY) as Theme) || "system";
    } catch {
      return "system";
    }
  });

  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return resolveIsDark(theme);
  });

  // aplica/atualiza .dark no <html>
  useEffect(() => {
    const html = document.documentElement;
    const update = () => {
      const activeDark = resolveIsDark(theme);
      setIsDark(activeDark);
      html.classList.toggle("dark", activeDark);
      // Manter data-theme para compatibilidade
      html.setAttribute("data-theme", activeDark ? "dark" : "light");
    };

    update();

    // quando estiver em "system" reagir às mudanças do SO
    let mq: MediaQueryList | null = null;
    if (theme === "system" && window.matchMedia) {
      mq = window.matchMedia("(prefers-color-scheme: dark)");
      const listener = () => update();
      mq.addEventListener?.("change", listener);
      return () => mq?.removeEventListener?.("change", listener);
    }
  }, [theme]);

  const setTheme = (t: Theme) => {
    setThemeState(t);
    try {
      localStorage.setItem(STORAGE_KEY, t);
    } catch {}
  };

  const value = useMemo(() => ({ theme, setTheme, isDark }), [theme, isDark]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
