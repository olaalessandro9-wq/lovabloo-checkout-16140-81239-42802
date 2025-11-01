import { Outlet } from "react-router-dom";
import { Sidebar } from "@/components/sidebar/Sidebar";
import { ThemeToggle } from "@/components/ThemeToggle";

const SIDEBAR_WIDTH = 272; // ~w-68

export default function AppShell() {
  return (
    <div className="bg-app">
      {/* Sidebar fixo */}
      <aside
        className="fixed left-0 top-0 h-screen bg-sidebar text-sidebar border-r border-sidebar z-40"
        style={{ width: SIDEBAR_WIDTH }}
      >
        <Sidebar />
      </aside>

      {/* Conteúdo */}
      <div className="flex min-h-screen flex-col" style={{ marginLeft: SIDEBAR_WIDTH }}>
        {/* Header */}
        <header className="sticky top-0 z-30 flex items-center justify-end gap-2 border-b border-sidebar bg-app/80 px-4 py-2 backdrop-blur">
          <ThemeToggle />
        </header>

        {/* Conteúdo rolável */}
        <main className="flex-1 overflow-x-hidden px-4 md:px-6 lg:px-8 py-4 md:py-6">
          <div className="min-w-0">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
