import React from 'react';

type ThemeName = 'light' | 'dark';

type ThemeContextState = {
  theme: ThemeName;
  setTheme: (t: ThemeName) => void;
  toggleTheme: () => void;
};

const ThemeContext = React.createContext<ThemeContextState | null>(null);

export const ThemeProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [theme, setTheme] = React.useState<ThemeName>('light');

  React.useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme === 'dark' ? 'dark' : 'light');
    // Paleta fixa "sky" para ambos os temas
    document.documentElement.setAttribute('data-palette', 'sky');
    
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => setTheme(t => (t === 'light' ? 'dark' : 'light'));

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useThemeStore = () => {
  const ctx = React.useContext(ThemeContext);
  if (!ctx) throw new Error('useThemeStore must be used within ThemeProvider');
  return ctx;
};

