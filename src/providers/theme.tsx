import React, { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark";

type ThemeCtx = {
  theme: Theme;
  toggle: () => void;
  setTheme: (t: Theme) => void;
};

const ThemeContext = createContext<ThemeCtx | null>(null);
const STORAGE_KEY = "rise:theme";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    // migração: se encontrar "system", trata como "light" por padrão
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === "dark") return "dark";
    return "light";
  });

  const apply = (t: Theme) => {
    const root = document.documentElement;
    if (t === "dark") root.classList.add("dark");
    else root.classList.remove("dark");
    root.setAttribute("data-theme", t);
  };

  const setTheme = (t: Theme) => {
    setThemeState(t);
    localStorage.setItem(STORAGE_KEY, t);
    apply(t);
  };

  const toggle = () => setTheme(theme === "dark" ? "light" : "dark");

  useEffect(() => {
    // aplica no mount (previne FOUC se index.html já não fizer isso)
    apply(theme);
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
