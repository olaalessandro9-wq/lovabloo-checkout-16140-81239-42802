import React from 'react';
import { motion } from 'framer-motion';
import { Home, Package, Settings, Link as LinkIcon, Users, CreditCard } from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';

type Item = { label: string; href: string; icon: React.ReactNode };

const ITEMS: Item[] = [
  { label: 'Dashboard', href: '/', icon: <Home size={18} /> },
  { label: 'Produtos', href: '/produtos', icon: <Package size={18} /> },
  { label: 'Afiliados', href: '/afiliados', icon: <Users size={18} /> },
  { label: 'Financeiro', href: '/financeiro', icon: <CreditCard size={18} /> },
  { label: 'Integrações', href: '/integracoes', icon: <LinkIcon size={18} /> },
  { label: 'Configurações', href: '/config', icon: <Settings size={18} /> },
];

export const EagleSidebar: React.FC = () => {
  const location = useLocation();
  const isActive = (href: string) => {
    if (href === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(href);
  };

  return (
    <aside className="relative w-64 shrink-0 border-r bg-sidebar-bg border-sidebar-border text-sidebar-text">
      <div className="p-4 border-b border-sidebar-border">
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
          <div className="font-semibold text-[var(--text)]">RiseCheckout</div>
        </div>
      </div>

      <nav className="relative p-2">
        <ul className="space-y-1 relative">
          {ITEMS.map((it) => (
            <li key={it.href} className="relative">
              {isActive(it.href) && (
                <motion.div
                  layoutId="active"
                  className="absolute inset-0 rounded-xl bg-brand-subtle/10"
                  transition={{ type: 'spring', stiffness: 500, damping: 40 }}
                />
              )}
              <NavLink
                to={it.href}
                className={`relative z-10 flex items-center gap-3 px-3 py-2 rounded-xl transition-colors
                ${isActive(it.href) ? 'text-[var(--brand)] font-semibold' : 'text-sidebar-muted hover:text-[var(--text)] hover:bg-sidebar-hover'}`}
              >
                <span className="opacity-90">{it.icon}</span>
                <span className="text-sm">{it.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

