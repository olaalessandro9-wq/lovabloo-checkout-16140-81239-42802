import { 
  LayoutDashboard, 
  Package, 
  Users,
  DollarSign,
  Settings,
  LogOut,
  ChevronRight
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";

const menuItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Produtos", url: "/produtos", icon: Package },
  { title: "Afiliados", url: "/afiliados", icon: Users },
  { title: "Financeiro", url: "/financeiro", icon: DollarSign },
  { title: "Integrações", url: "/integracoes", icon: Settings },
];

export function AppSidebar() {
  const { signOut } = useAuth();

  return (
    <Sidebar className="border-r border-border/40 bg-[hsl(220,20%,6%)]">
      <SidebarHeader className="p-5 border-b border-border/30">
        <div className="flex items-center gap-3">
          <div className="relative w-11 h-11 rounded-2xl bg-gradient-to-br from-primary/90 via-primary to-accent shadow-lg shadow-primary/30 flex items-center justify-center">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="text-white"
            >
              <path
                d="M13 2L3 14H12L11 22L21 10H12L13 2Z"
                fill="currentColor"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div className="flex flex-col">
            <span className="text-base font-bold text-white tracking-tight">RiseCheckout</span>
            <span className="text-[11px] text-muted-foreground/80">Sistema de Vendas</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-3 py-6">
        <SidebarGroup>
          <SidebarGroupLabel className="px-3 mb-3 text-[11px] uppercase tracking-wider text-muted-foreground/70 font-semibold">
            Navegação
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === "/"}
                      className={({ isActive }) =>
                        `group flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-200 ${
                          isActive
                            ? "bg-primary/15 text-primary font-medium border border-primary/20"
                            : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                        }`
                      }
                    >
                      {({ isActive }) => (
                        <>
                          <div className="flex items-center gap-3">
                            <item.icon className="w-[18px] h-[18px]" strokeWidth={2.2} />
                            <span className="text-sm font-medium">{item.title}</span>
                          </div>
                          {isActive && (
                            <ChevronRight className="w-4 h-4 text-primary" strokeWidth={2.5} />
                          )}
                        </>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-3 border-t border-border/30">
        <div className="px-3 py-2 mb-2">
          <p className="text-xs text-muted-foreground/70">Usuário</p>
          <p className="text-sm text-foreground font-medium">usuario@risecheckout.com</p>
        </div>
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground hover:bg-white/5 rounded-xl h-10 transition-all duration-200"
          onClick={signOut}
        >
          <LogOut className="w-[18px] h-[18px]" strokeWidth={2.2} />
          <span className="text-sm font-medium">Sair</span>
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
