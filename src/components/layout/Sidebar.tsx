// src/components/layout/Sidebar.tsx
import {
  LayoutDashboard,
  Package,
  Users,
  Banknote,
  Plug,
  Cog,
  LifeBuoy,
  HelpCircle,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { HELP_CENTER_URL, SUPPORT_WHATSAPP_URL } from "@/lib/links";
import { UserFooter } from "./UserFooter";
import clsx from "clsx";

type Item = { label: string; icon: React.ElementType; to?: string; external?: string };
type Section = { title: string; items: Item[] };

// Ajuste de altura do brand no topo do sidebar
const BRAND_H = 68; // px (maior que antes; menor que o Rise Insights)

const NAV_SECTIONS: Section[] = [
  {
    title: "NAVEGAÇÃO",
    items: [
      { label: "Dashboard", icon: LayoutDashboard, to: "/" },
      { label: "Produtos", icon: Package, to: "/produtos" },
      { label: "Afiliados", icon: Users, to: "/afiliados" },
    ],
  },
  {
    title: "OPERAÇÕES",
    items: [
      { label: "Financeiro", icon: Banknote, to: "/financeiro" },
      { label: "Integrações", icon: Plug, to: "/integracoes" },
    ],
  },
  {
    title: "SISTEMA",
    items: [
      { label: "Configurações", icon: Cog, to: "/config" },
      { label: "Suporte pelo WhatsApp", icon: LifeBuoy, external: SUPPORT_WHATSAPP_URL },
      { label: "Ajuda", icon: HelpCircle, external: HELP_CENTER_URL },
      // >>> intencionalmente NÃO tem "Sair" aqui <<<
    ],
  },
];

export function Sidebar() {
  return (
    <aside
      className={clsx(
        "flex h-screen w-[248px] shrink-0 flex-col border-r border-border/60 bg-background text-foreground"
      )}
    >
      {/* Brand / Logo */}
      <div
        className="flex items-center px-4 border-b border-border/60"
        style={{ height: BRAND_H }}
      >
        <div className="text-lg font-semibold tracking-tight">RiseCheckout</div>
      </div>

      {/* Navegação */}
      <nav className="scrollbar-none flex-1 overflow-y-auto px-2 py-4">
        {NAV_SECTIONS.map((section) => (
          <div key={section.title} className="mb-5">
            <div className="px-2 pb-2 text-[11px] font-medium uppercase tracking-wide text-muted-foreground/80">
              {section.title}
            </div>
            <ul className="space-y-1">
              {section.items.map((it) => {
                const Icon = it.icon;
                if (it.external) {
                  return (
                    <li key={it.label}>
                      <a
                        href={it.external}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={rowClass()}
                      >
                        <Icon className="h-4 w-4" />
                        <span>{it.label}</span>
                      </a>
                    </li>
                  );
                }
                return (
                  <li key={it.label}>
                    <NavLink to={it.to!} className={({ isActive }) => rowClass(isActive)}>
                      <Icon className="h-4 w-4" />
                      <span>{it.label}</span>
                    </NavLink>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Rodapé com email + sair */}
      <UserFooter />
    </aside>
  );
}

function rowClass(active?: boolean) {
  return clsx(
    "group flex items-center gap-3 rounded-md px-2 py-2 text-sm transition",
    active
      ? "bg-muted text-foreground font-medium"
      : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
  );
}
