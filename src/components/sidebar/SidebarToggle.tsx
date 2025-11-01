import { ChevronsLeft, ChevronsRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import clsx from "clsx";

export function SidebarToggle({
  collapsed,
  onToggle,
}: {
  collapsed: boolean;
  onToggle: () => void;
}) {
  return (
    <Button
      variant="ghost"
      size="icon"
      className={clsx(
        "h-8 w-8 text-zinc-400 hover:text-zinc-100",
        "hover:bg-zinc-900/60"
      )}
      onClick={onToggle}
      aria-label={collapsed ? "Expandir menu" : "Recolher menu"}
    >
      {collapsed ? <ChevronsRight className="h-4 w-4" /> : <ChevronsLeft className="h-4 w-4" />}
    </Button>
  );
}
