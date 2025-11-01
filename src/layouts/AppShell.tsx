import { Outlet } from "react-router-dom";
import { Sidebar } from "@/components/sidebar/Sidebar";

export default function AppShell() {
  // Largura do sidebar (mantenha coerente com Sidebar)
  const SIDEBAR_WIDTH = "w-64"; // 256px (sm/md+)

  return (
    <div className="min-h-screen bg-shell-bg text-shell-fg">
      {/* Sidebar FIXO */}
      <aside
        className={[
          "fixed left-0 top-0 h-screen z-40",
          SIDEBAR_WIDTH,
          "bg-sidebar-bg text-sidebar-fg border-r border-sidebar-border",
          "flex flex-col",
        ].join(" ")}
      >
        <Sidebar />
      </aside>

      {/* Conteúdo rola normalmente */}
      <main
        className={[
          "min-h-screen",
          // empurra o conteúdo para a direita exatamente a largura do sidebar
          "ml-64",
          "px-4 md:px-6 lg:px-8 py-4 md:py-6",
        ].join(" ")}
      >
        {/* 
          MUITO IMPORTANTE:
          Permite que o container flex/flow encolha abaixo do conteúdo intrínseco,
          evitando overflow horizontal inesperado (sem usar w-dvw).
        */}
        <div className="min-w-0">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
