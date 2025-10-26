import React from 'react';

type Mode = 'light' | 'dark';

interface ThemeContextType {
  theme: Mode;
  toggleTheme: () => void;
}

const ThemeContext = React.createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = React.useState<Mode>(() => {
    const saved = localStorage.getItem('theme') as Mode | null;
    return saved || 'light';
  });

  React.useEffect(() => {
    const root = document.documentElement;
    
    // Seta data-mode
    root.setAttribute('data-mode', theme);
    
    // Paleta fixa por modo (não editável pelo usuário)
    // Light = Horizon (Sky Commander)
    // Dark = Eagle
    root.setAttribute('data-palette', theme === 'dark' ? 'eagle' : 'horizon');
    
    // Mantém data-theme para compatibilidade
    root.setAttribute('data-theme', theme === 'dark' ? 'dark' : 'light');
    
    // Classe 'dark' para compatibilidade com Tailwind
    root.classList.toggle('dark', theme === 'dark');
    
    // Persiste no localStorage
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = React.useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}

