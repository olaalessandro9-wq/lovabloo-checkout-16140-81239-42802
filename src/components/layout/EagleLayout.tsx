import React from 'react';
import { EagleSidebar } from './EagleSidebar';
import { useThemeStore } from '@/contexts/ThemeProvider';
import { Sun, Moon, Palette } from 'lucide-react';

interface EagleLayoutProps {
  children: React.ReactNode;
  title?: string;
}

export const EagleLayout: React.FC<EagleLayoutProps> = ({ children, title }) => {
  const { theme, toggleTheme, palette, cyclePalette } = useThemeStore();

  const getPaletteName = () => {
    switch (palette) {
      case 'eagle':
        return 'Eagle Vision';
      case 'sky':
        return 'Sky Commander';
      case 'horizon':
        return 'Horizon';
      default:
        return palette;
    }
  };

  return (
    <div className="min-h-screen bg-bg text-text">
      <div className="flex">
        <EagleSidebar />
        <main className="flex-1">
          <header className="sticky top-0 z-20 border-b border-sidebar-border bg-card/80 backdrop-blur supports-[backdrop-filter]:bg-card/60">
            <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
              <h1 className="text-lg font-semibold">{title ?? 'Painel'}</h1>
              <div className="flex items-center gap-2">
                <button 
                  onClick={cyclePalette} 
                  className="px-3 py-1.5 rounded-xl bg-brand text-brand-fg text-sm shadow-soft hover:opacity-90 transition-opacity flex items-center gap-2"
                  title="Trocar paleta de cores"
                >
                  <Palette size={16} />
                  <span className="hidden sm:inline">{getPaletteName()}</span>
                </button>
                <button 
                  onClick={toggleTheme} 
                  className="px-3 py-1.5 rounded-xl border border-sidebar-border text-subtext hover:text-text transition-colors"
                  title={theme === 'light' ? 'Ativar modo escuro' : 'Ativar modo claro'}
                >
                  {theme === 'light' ? <Moon size={16}/> : <Sun size={16}/>}
                </button>
              </div>
            </div>
          </header>
          <div className="max-w-6xl mx-auto p-6 grid gap-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

