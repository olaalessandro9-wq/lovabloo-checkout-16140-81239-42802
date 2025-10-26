import { ReactNode } from "react";
import { EagleSidebar } from "./EagleSidebar";
import { useTheme } from "@/contexts/ThemeProvider";
import { Sun, Moon, Bell, User } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="app-shell grid grid-cols-[264px_1fr] min-h-screen bg-bg">
      {/* Sidebar sticky */}
      <aside className="app-sidebar sticky top-0 h-screen overflow-y-auto border-r border-sidebar-border">
        <EagleSidebar />
      </aside>

      {/* Conteúdo principal */}
      <main className="app-main min-h-screen overflow-x-hidden">
        {/* Header */}
        <header className="sticky top-0 z-20 border-b border-sidebar-border bg-card/80 backdrop-blur supports-[backdrop-filter]:bg-card/60">
          <div className="px-6 h-14 flex items-center justify-end gap-2">
            {/* Botão Light/Dark */}
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
            
            {/* Notificações */}
            <button className="p-2.5 rounded-xl hover:bg-sidebar-hover transition-all duration-200 hover:scale-105 group">
              <Bell className="w-5 h-5 text-subtext group-hover:text-text transition-colors" />
            </button>
            
            {/* Perfil */}
            <button className="p-2.5 rounded-xl hover:bg-sidebar-hover transition-all duration-200 hover:scale-105 group">
              <User className="w-5 h-5 text-subtext group-hover:text-text transition-colors" />
            </button>
          </div>
        </header>

        {/* Conteúdo da página */}
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}

