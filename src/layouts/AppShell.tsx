import { Outlet } from "react-router-dom";
import { Sidebar } from "@/components/sidebar/Sidebar";
import { MobileSidebar } from "@/components/sidebar/MobileSidebar";

export default function AppShell() {
  return (
    <div className="flex min-h-dvh w-dvw bg-[var(--bg)] text-[var(--text)]">
      <div className="hidden md:block">
        <Sidebar />
      </div>

      <div className="flex-1">
        {/* Topbar (mobile) */}
        <div className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b border-[var(--sidebar-border)] bg-[var(--sidebar-bg)] px-3 md:hidden">
          <MobileSidebar />
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
          <span className="text-sm font-semibold">RiseCheckout</span>
        </div>

        {/* Conteúdo */}
        <div className="px-4 py-4 md:px-6 md:py-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
