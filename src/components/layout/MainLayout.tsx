import { ReactNode } from "react";
import { EagleSidebar } from "./EagleSidebar";
import { useThemeStore } from "@/contexts/ThemeProvider";
import { Sun, Moon, Palette, Bell, User } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
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
    <div className="min-h-screen flex w-full bg-bg">
      <EagleSidebar />
      <div className="flex-1 flex flex-col">
        <header className="h-16 border-b border-sidebar-border flex items-center justify-between px-8 bg-card/30 backdrop-blur-xl sticky top-0 z-10">
          <div className="flex-1"></div>
          <div className="flex items-center gap-2 ml-auto">
            <Button
              variant="ghost"
              size="sm"
              onClick={cyclePalette}
              className="rounded-xl hover:bg-sidebar-hover transition-all duration-200 flex items-center gap-2 text-subtext hover:text-text"
              title="Trocar paleta de cores"
            >
              <Palette className="w-4 h-4" />
              <span className="hidden sm:inline text-xs">{getPaletteName()}</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="rounded-xl hover:bg-sidebar-hover transition-all duration-200"
              title={theme === 'light' ? 'Ativar modo escuro' : 'Ativar modo claro'}
            >
              {theme === "light" ? (
                <Moon className="w-5 h-5 text-subtext" />
              ) : (
                <Sun className="w-5 h-5 text-subtext" />
              )}
            </Button>
            <button className="p-2.5 rounded-xl hover:bg-sidebar-hover transition-all duration-200 hover:scale-105 group">
              <Bell className="w-5 h-5 text-subtext group-hover:text-text transition-colors" />
            </button>
            <button className="p-2.5 rounded-xl hover:bg-sidebar-hover transition-all duration-200 hover:scale-105 group">
              <User className="w-5 h-5 text-subtext group-hover:text-text transition-colors" />
            </button>
          </div>
        </header>
        <main className="flex-1 p-8 bg-bg">
          {children}
        </main>
      </div>
    </div>
  );
}

