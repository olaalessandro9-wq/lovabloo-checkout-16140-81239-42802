import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Box, Users, BadgeDollarSign, Link as LinkIcon, Settings } from 'lucide-react';

type Item = { to: string; label: string; icon: React.ComponentType<{ className?: string }>; exact?: boolean };

const NAV: Item[] = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { to: '/produtos', label: 'Produtos', icon: Box },
  { to: '/afiliados', label: 'Afiliados', icon: Users },
];

const OPS: Item[] = [
  { to: '/financeiro', label: 'Financeiro', icon: BadgeDollarSign },
  { to: '/integracoes', label: 'Integrações', icon: LinkIcon },
];

const SYS: Item[] = [
  { to: '/config', label: 'Configurações', icon: Settings },
];

function Section({ title, items }: { title: string; items: Item[] }) {
  return (
    <div className="mt-6 first:mt-0">
      <div className="px-2 pb-2 text-xs font-semibold uppercase tracking-wide text-sidebar-muted">
        {title}
      </div>
      <nav className="space-y-1">
        {items.map((it) => {
          const Icon = it.icon;
          return (
            <NavLink
              key={it.to}
              to={it.to}
              end={it.exact}
              className={({ isActive }) =>
                [
                  'group flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-sidebar hover:bg-sidebar-active transition',
                  isActive ? 'bg-sidebar-active font-semibold' : ''
                ].join(' ')
              }
            >
              <Icon className="h-4 w-4" />
              <span>{it.label}</span>
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
}

export default function Sidebar() {
  return (
    <aside
      className="
        bg-sidebar text-sidebar border-sidebar
        fixed inset-y-0 left-0 z-40 w-64 shrink-0 border-r px-3 py-4
      "
    >
      <div className="mb-3 px-2 text-lg font-semibold">
        RiseCheckout
      </div>
      
      <Section title="Navegação" items={NAV} />
      <Section title="Operações" items={OPS} />
      <Section title="Sistema" items={SYS} />

      <div className="mt-auto pt-4">
        <div className="h-px w-full bg-sidebar-border opacity-50" />
        <div className="mt-3 px-2 text-xs text-sidebar-muted">© 2025 Rise Checkout</div>
      </div>
    </aside>
  );
}
