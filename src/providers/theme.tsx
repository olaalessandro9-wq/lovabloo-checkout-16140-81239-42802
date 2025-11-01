import React, { createContext, useEffect, useState } from 'react';
import { getTheme, setTheme, toggleTheme, Theme } from '@/lib/theme';

type Ctx = {
  theme: Theme;
  set: (t: Theme) => void;
  toggle: () => void;
};

export const ThemeCtx = createContext<Ctx>({
  theme: 'light',
  set: () => {},
  toggle: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setState] = useState<Theme>('light');

  useEffect(() => {
    setState(getTheme());
  }, []);

  const set = (t: Theme) => {
    setTheme(t);
    setState(t);
  };

  const toggle = () => {
    const next = toggleTheme();
    setState(next);
  };

  return (
    <ThemeCtx.Provider value={{ theme, set, toggle }}>
      {children}
    </ThemeCtx.Provider>
  );
}
