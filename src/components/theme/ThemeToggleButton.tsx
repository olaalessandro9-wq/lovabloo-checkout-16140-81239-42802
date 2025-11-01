import { Moon, Sun } from "lucide-react";
import { useTheme } from "./ThemeProvider";
import clsx from "clsx";

export function ThemeToggleButton() {
  const { theme, toggle } = useTheme();

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={theme === "dark" ? "Trocar para tema claro" : "Trocar para tema escuro"}
      title={theme === "dark" ? "Tema claro" : "Tema escuro"}
      className={clsx(
        "relative inline-flex h-9 w-9 items-center justify-center rounded-md border border-transparent",
        "hover:bg-foreground/5 transition"
      )}
    >
      {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </button>
  );
}
