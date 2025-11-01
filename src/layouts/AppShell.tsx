import { Outlet } from 'react-router-dom';
import Sidebar from '@/components/sidebar/Sidebar';
import ThemeToggle from '@/components/ThemeToggle';

export default function AppShell() {
  return (
    <div className="bg-app text-app">
      <Sidebar />
      <header className="sticky top-0 z-30 ml-64 border-b border-app bg-card/90 backdrop-blur supports-[backdrop-filter]:bg-card/70">
        <div className="mx-auto flex h-14 max-w-screen-2xl items-center justify-end gap-2 px-4">
          <ThemeToggle />
        </div>
      </header>
      <main className="ml-64">
        <div className="mx-auto max-w-screen-2xl p-4">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
