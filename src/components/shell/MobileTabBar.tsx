"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MoreHorizontal } from "lucide-react";
import { cn } from "cn";
import { isNavItemActive, type NavItem } from "@/config/nav";

type MobileTabBarProps = {
  items: NavItem[];
  moreOpen: boolean;
  onMore: () => void;
};

export function MobileTabBar({ items, moreOpen, onMore }: MobileTabBarProps) {
  const pathname = usePathname() ?? "/";

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card pb-[env(safe-area-inset-bottom)] sm:hidden"
    >
      <div className="grid h-16 grid-cols-5">
        {items.map((item) => {
          const active = isNavItemActive(pathname, item);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex min-h-11 flex-col items-center justify-center gap-0.5 px-1 text-[11px]",
                active ? "font-semibold text-primary" : "font-medium text-muted-foreground",
              )}
            >
              <Icon size={18} strokeWidth={2} aria-hidden="true" />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
        <button
          type="button"
          aria-expanded={moreOpen}
          onClick={onMore}
          className={cn(
            "flex min-h-11 flex-col items-center justify-center gap-0.5 px-1 text-[11px]",
            moreOpen ? "font-semibold text-primary" : "font-medium text-muted-foreground",
          )}
        >
          <MoreHorizontal size={18} strokeWidth={2} aria-hidden="true" />
          More
        </button>
      </div>
    </nav>
  );
}
