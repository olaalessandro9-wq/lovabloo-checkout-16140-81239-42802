import { LayoutDashboard, Box, Users, BadgeDollarSign, Link as LinkIcon, Settings } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type SidebarRoute = {
  to: string;
  label: string;
  icon: LucideIcon;
};

export const routes: SidebarRoute[] = [
  {
    to: "/",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    to: "/produtos",
    label: "Produtos",
    icon: Box,
  },
  {
    to: "/afiliados",
    label: "Afiliados",
    icon: Users,
  },
  {
    to: "/financeiro",
    label: "Financeiro",
    icon: BadgeDollarSign,
  },
  {
    to: "/integracoes",
    label: "Integrações",
    icon: LinkIcon,
  },
  {
    to: "/config",
    label: "Configurações",
    icon: Settings,
  },
];
