import { useContext } from 'react';
import { Moon, Sun } from 'lucide-react';
import { ThemeCtx } from '@/providers/theme';

export default function ThemeToggle() {
  const { theme, toggle } = useContext(ThemeCtx);
  const isDark = theme === 'dark';
  
  return (
    <button
      aria-label="Alternar tema"
      onClick={toggle}
      className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border bg-card text-foreground hover:opacity-80 transition"
      title={isDark ? 'Ir para tema claro' : 'Ir para tema escuro'}
    >
      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  );
}
