import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { ReactNode } from "react";
import { Bell, User } from "lucide-react";

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          <header className="h-16 border-b border-border/40 flex items-center justify-between px-8 bg-card/30 backdrop-blur-xl sticky top-0 z-10">
            <SidebarTrigger className="lg:hidden" />
            <div className="flex items-center gap-3 ml-auto">
              <button className="p-2.5 rounded-xl hover:bg-white/5 transition-all duration-200 hover:scale-105 group">
                <Bell className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
              </button>
              <button className="p-2.5 rounded-xl hover:bg-white/5 transition-all duration-200 hover:scale-105 group">
                <User className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
              </button>
            </div>
          </header>
          <main className="flex-1 p-8 bg-background">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
