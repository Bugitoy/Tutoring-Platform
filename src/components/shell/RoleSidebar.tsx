"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "cn";
import {
  PROFILE_HREF,
  ROLE_LABEL,
  isNavItemActive,
  isProfileActive,
  type NavItem,
  type Role,
} from "@/config/nav";
import type { AccountChipData } from "@/lib/account";
import { AccountChip } from "@/components/shell/AccountChip";
import { Logo } from "@/components/shell/Logo";

type RoleSidebarProps = {
  role: Role;
  items: NavItem[];
  account: AccountChipData;
  onNavigate?: () => void;
};

export function RoleSidebar({ role, items, account, onNavigate }: RoleSidebarProps) {
  const pathname = usePathname() ?? "/";
  const profileHref = PROFILE_HREF[role];

  return (
    <div className="flex h-full min-h-0 flex-col bg-card">
      <div className="px-3 pt-5">
        <div className="px-2 pb-2">
          <Logo />
        </div>
        <p className="mt-5 px-3 text-xs font-bold tracking-[0.07em] text-primary uppercase">
          {ROLE_LABEL[role]}
        </p>
        <nav className="mt-3 flex flex-col gap-1" aria-label="Main">
          {items.map((item) => {
            const active = isNavItemActive(pathname, item);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                onClick={onNavigate}
                className={cn(
                  "flex h-11 items-center gap-3 rounded-[10px] px-3 text-sm",
                  active
                    ? "bg-accent font-semibold text-primary"
                    : "font-medium text-muted-foreground hover:bg-surface-subtle hover:text-foreground",
                )}
              >
                <Icon size={18} strokeWidth={2} aria-hidden="true" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="mt-auto">
        <AccountChip
          account={account}
          href={profileHref}
          active={isProfileActive(pathname, role)}
        />
      </div>
    </div>
  );
}
