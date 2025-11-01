import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/providers/theme";

export function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const isDark = theme === "dark";
  
  return (
    <button
      onClick={toggle}
      aria-label="Alternar tema"
      className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-background/80 hover:bg-accent transition-colors"
    >
      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  );
}
