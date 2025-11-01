import { NavLink } from "react-router-dom";
import { LayoutDashboard, Box, Users, BadgeDollarSign, Settings } from "lucide-react";

export function Sidebar() {
  return (
    <div className="h-full flex flex-col">
      {/* Cabeçalho */}
      <div className="px-4 py-4 border-b border-sidebar-border">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-xl bg-brand-subtle/20 grid place-items-center">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path 
                d="M13 2L3 14H12L11 22L21 10H12L13 2Z" 
                stroke="var(--brand)" 
                strokeWidth="1.5" 
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <span className="text-lg font-semibold">RiseCheckout</span>
        </div>
      </div>

      {/* Navegação (rola se necessário) */}
      <nav className="flex-1 overflow-y-auto py-2">
        <ul className="px-2 space-y-1">
          <Item to="/" icon={<LayoutDashboard className="size-4" />}>
            Dashboard
          </Item>
          <Item to="/produtos" icon={<Box className="size-4" />}>
            Produtos
          </Item>
          <Item to="/afiliados" icon={<Users className="size-4" />}>
            Afiliados
          </Item>
          <Item to="/financeiro" icon={<BadgeDollarSign className="size-4" />}>
            Financeiro
          </Item>
          <Item to="/integracoes" icon={<Settings className="size-4" />}>
            Integrações
          </Item>
        </ul>
      </nav>

      {/* Rodapé do sidebar */}
      <div className="px-4 py-3 border-t border-sidebar-border text-xs text-muted-fg">
        © {new Date().getFullYear()} Rise Checkout
      </div>
    </div>
  );
}

function Item({
  to,
  icon,
  children,
}: {
  to: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <li>
      <NavLink
        to={to}
        className={({ isActive }) =>
          [
            "group flex items-center gap-2 rounded-md px-3 py-2 text-sm",
            "transition-colors",
            isActive
              ? "bg-sidebar-active/60 text-sidebar-fg font-medium"
              : "text-sidebar-fg hover:bg-sidebar-hover hover:text-sidebar-fg",
          ].join(" ")
        }
      >
        <span className="shrink-0 text-muted-fg group-hover:text-sidebar-fg">
          {icon}
        </span>
        <span className="truncate">{children}</span>
      </NavLink>
    </li>
  );
}
