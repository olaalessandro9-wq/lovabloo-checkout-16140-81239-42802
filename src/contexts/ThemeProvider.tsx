import React from 'react';

type ThemeName = 'light' | 'dark';
type Palette = 'eagle' | 'sky' | 'horizon';

type ThemeContextState = {
  theme: ThemeName;
  palette: Palette;
  setTheme: (t: ThemeName) => void;
  setPalette: (p: Palette) => void;
  toggleTheme: () => void;
  cyclePalette: () => void;
};

const ThemeContext = React.createContext<ThemeContextState | null>(null);

export const ThemeProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [theme, setTheme] = React.useState<ThemeName>(() => {
    const saved = localStorage.getItem('theme') as ThemeName | null;
    return saved || 'light';
  });
  const [palette, setPalette] = React.useState<Palette>(() => {
    const saved = localStorage.getItem('palette') as Palette | null;
    return saved || 'eagle';
  });

  React.useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme === 'dark' ? 'dark' : 'light');
    // Também atualiza a classe 'dark' para compatibilidade com componentes existentes
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    // Persiste no localStorage
    localStorage.setItem('theme', theme);
  }, [theme]);

  React.useEffect(() => {
    document.documentElement.setAttribute('data-palette', palette);
    // Persiste no localStorage
    localStorage.setItem('palette', palette);
  }, [palette]);

  const toggleTheme = () => setTheme(t => (t === 'light' ? 'dark' : 'light'));
  const cyclePalette = () => setPalette(p => (p === 'eagle' ? 'sky' : p === 'sky' ? 'horizon' : 'eagle'));

  return (
    <ThemeContext.Provider value={{ theme, palette, setTheme, setPalette, toggleTheme, cyclePalette }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useThemeStore = () => {
  const ctx = React.useContext(ThemeContext);
  if (!ctx) throw new Error('useThemeStore must be used within ThemeProvider');
  return ctx;
};

