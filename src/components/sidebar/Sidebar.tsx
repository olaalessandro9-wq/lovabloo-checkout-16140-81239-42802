import { NavLink } from "react-router-dom";
import { routes } from "./routes";

export function Sidebar() {
  return (
    <div className="h-full flex flex-col">
      {/* Cabeçalho */}
      <div className="px-4 py-3 border-b border-sidebar">
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
          <div>
            <div className="text-sm uppercase tracking-wide text-sidebar-muted">RiseCheckout</div>
            <div className="font-semibold text-sidebar text-xs">Navegação</div>
          </div>
        </div>
      </div>

      {/* Lista: apenas aqui rola */}
      <nav className="flex-1 overflow-y-auto px-2 py-2">
        {routes.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              [
                "flex items-center gap-3 rounded-lg px-3 py-2 transition-colors",
                isActive
                  ? "bg-black/5 dark:bg-white/5 text-sidebar"
                  : "text-sidebar-muted hover:text-sidebar hover:bg-black/5 dark:hover:bg-white/5"
              ].join(" ")
            }
          >
            <item.icon className="w-4 h-4" />
            <span className="text-sm">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Rodapé */}
      <div className="px-4 py-3 border-t border-sidebar text-xs text-sidebar-muted">
        © {new Date().getFullYear()} Rise Checkout
      </div>
    </div>
  );
}
