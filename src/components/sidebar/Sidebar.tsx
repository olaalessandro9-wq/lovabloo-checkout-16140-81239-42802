import { useEffect, useMemo, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { NAV_SECTIONS } from "./sidebar.config";
import { SidebarToggle } from "./SidebarToggle";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarItem } from "./SidebarItem";
import clsx from "clsx";

export function Sidebar() {
  const { pathname } = useLocation();
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    const v = localStorage.getItem("rc.sidebar.collapsed");
    return v ? v === "1" : false;
  });

  useEffect(() => {
    const onHotkey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "b") {
        e.preventDefault();
        setCollapsed((c) => {
          const nv = !c;
          localStorage.setItem("rc.sidebar.collapsed", nv ? "1" : "0");
          return nv;
        });
      }
    };
    window.addEventListener("keydown", onHotkey);
    return () => window.removeEventListener("keydown", onHotkey);
  }, []);

  const activeSegment = useMemo(() => {
    const seg = pathname.split("/").filter(Boolean)[0];
    return seg ?? "";
  }, [pathname]);

  return (
    <aside
      className={clsx(
        "group/sidebar relative z-40 h-dvh border-r",
        "bg-[var(--sidebar-bg,theme(colors.zinc.950))] border-[var(--sidebar-border,theme(colors.zinc.800))]",
        collapsed ? "w-[72px]" : "w-[260px]",
        "transition-[width] duration-200 ease-out"
      )}
      aria-label="Navegação principal"
    >
      {/* Top brand / toggle */}
      <div className="flex items-center justify-between px-3 pt-3 pb-2">
        <Link to="/" className="flex items-center gap-2">
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
          <span className={clsx("text-sm font-semibold tracking-tight text-[var(--text)]", collapsed && "sr-only")}>
            RiseCheckout
          </span>
        </Link>
        <SidebarToggle
          collapsed={collapsed}
          onToggle={() =>
            setCollapsed((c) => {
              const nv = !c;
              localStorage.setItem("rc.sidebar.collapsed", nv ? "1" : "0");
              return nv;
            })
          }
        />
      </div>

      {/* Sections */}
      <TooltipProvider delayDuration={150}>
        <nav className="mt-2 flex flex-col gap-5 overflow-y-auto px-2 pb-6">
          {NAV_SECTIONS.map((section, i) => (
            <div key={i}>
              {section.title && (
                <div
                  className={clsx(
                    "px-3 pb-2 text-[11px] uppercase tracking-wider",
                    "text-[var(--sidebar-ghost,theme(colors.zinc.400))]",
                    collapsed && "sr-only"
                  )}
                >
                  {section.title}
                </div>
              )}
              <ul className="space-y-1">
                {section.items.map((item) => (
                  <SidebarItem
                    key={item.href}
                    item={item}
                    active={item.segment ? activeSegment === item.segment : pathname === item.href}
                    collapsed={collapsed}
                  />
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </TooltipProvider>

      {/* Footer */}
      <div className={clsx("absolute bottom-0 left-0 right-0 p-2", collapsed && "sr-only")}>
        <div className="rounded-lg border border-[var(--sidebar-border)] p-3 text-xs text-zinc-400">
          © {new Date().getFullYear()} Rise Checkout
        </div>
      </div>
    </aside>
  );
}
