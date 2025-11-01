import { Link } from "react-router-dom";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import clsx from "clsx";
import type { NavItem } from "./sidebar.config";

export function SidebarItem({
  item,
  active,
  collapsed,
}: {
  item: NavItem;
  active: boolean;
  collapsed: boolean;
}) {
  const Icon = item.icon;
  const content = (
    <div
      className={clsx(
        "flex h-9 items-center gap-3 rounded-md px-2 text-sm outline-none",
        active
          ? "bg-[var(--sidebar-item-active,theme(colors.zinc.800))] text-white ring-1 ring-[var(--ring,theme(colors.zinc.700))]"
          : "text-[var(--sidebar-item,theme(colors.zinc.300))] hover:bg-zinc-900/60",
        "transition-colors"
      )}
      aria-current={active ? "page" : undefined}
      role="menuitem"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          (e.currentTarget as HTMLElement).click();
        }
      }}
    >
      <Icon className="h-4 w-4 shrink-0" aria-hidden />
      <span className={clsx("truncate", collapsed && "sr-only")}>{item.label}</span>
      {item.badge && !collapsed && (
        <span className="ml-auto inline-flex min-w-[20px] items-center justify-center rounded bg-zinc-800 px-1.5 text-[10px]">
          {item.badge}
        </span>
      )}
    </div>
  );

  if (item.external) {
    return (
      <Tooltip disableHoverableContent={!collapsed}>
        <TooltipTrigger asChild>
          <a href={item.href} target="_blank" rel="noreferrer" className="block">
            {content}
          </a>
        </TooltipTrigger>
        {collapsed && <TooltipContent side="right">{item.label}</TooltipContent>}
      </Tooltip>
    );
  }

  return (
    <Tooltip disableHoverableContent={!collapsed}>
      <TooltipTrigger asChild>
        <Link to={item.href} className="block">
          {content}
        </Link>
      </TooltipTrigger>
      {collapsed && <TooltipContent side="right">{item.label}</TooltipContent>}
    </Tooltip>
  );
}
