import { 
  LayoutDashboard, 
  Package, 
  Users,
  DollarSign,
  Settings,
  TrendingUp,
  LogOut
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
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
    <Sidebar className="border-r border-sidebar-border bg-sidebar-background">
      <SidebarHeader className="p-6 border-b border-sidebar-border/50">
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-primary via-primary to-accent flex items-center justify-center shadow-lg shadow-primary/20">
            <TrendingUp className="w-5 h-5 text-white" strokeWidth={2.5} />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold text-foreground tracking-tight">RiseCheckout</span>
            <span className="text-xs text-muted-foreground">Sistema de Vendas</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-3 py-4">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === "/"}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                          isActive
                            ? "bg-primary/10 text-primary font-semibold shadow-sm border border-primary/20"
                            : "text-sidebar-foreground hover:bg-sidebar-accent/60 hover:text-foreground"
                        }`
                      }
                    >
                      <item.icon className="w-5 h-5" strokeWidth={2} />
                      <span className="text-sm">{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-3 border-t border-sidebar-border/50">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground hover:bg-sidebar-accent/60 rounded-xl py-3 transition-all duration-200"
          onClick={signOut}
        >
          <LogOut className="w-5 h-5" strokeWidth={2} />
          <span className="text-sm font-medium">Sair</span>
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
