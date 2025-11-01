import { Outlet } from "react-router-dom";
import { Sidebar } from "@/components/sidebar/Sidebar";

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
      <main
        className="min-h-screen overflow-x-hidden px-4 md:px-6 lg:px-8 py-4 md:py-6"
        style={{ marginLeft: SIDEBAR_WIDTH }}
      >
        <div className="min-w-0">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
