import {
  LayoutDashboard, Box, Users, BadgeDollarSign, ShoppingCart, Link as LinkIcon,
  Settings, Receipt, Percent, Workflow, HelpCircle
} from "lucide-react";

export type NavItem = {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  segment?: string;
  badge?: string;
  external?: boolean;
};

export type NavSection = {
  title?: string;
  items: NavItem[];
};

export const NAV_SECTIONS: NavSection[] = [
  {
    title: "Navegação",
    items: [
      { label: "Dashboard", href: "/", icon: LayoutDashboard, segment: "" },
      { label: "Produtos", href: "/produtos", icon: Box, segment: "produtos" },
      { label: "Afiliados", href: "/afiliados", icon: Users, segment: "afiliados" },
    ],
  },
  {
    title: "Operações",
    items: [
      { label: "Financeiro", href: "/financeiro", icon: BadgeDollarSign, segment: "financeiro" },
      { label: "Integrações", href: "/integracoes", icon: LinkIcon, segment: "integracoes" },
    ],
  },
  {
    title: "Sistema",
    items: [
      { label: "Configurações", href: "/config", icon: Settings, segment: "config" },
    ],
  },
];
