"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "cn";
import {
  isNavItemActive,
  mobileMoreItems,
  mobileTabItems,
  visibleNavItems,
  type Role,
} from "@/config/nav";
import type { AccountChipData } from "@/lib/account";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { DevRoleSwitcher } from "@/components/shell/DevRoleSwitcher";
import { MobileTabBar } from "@/components/shell/MobileTabBar";
import { MobileTopBar } from "@/components/shell/MobileTopBar";
import { PageTitleProvider } from "@/components/shell/PageTitleContext";
import { RoleSidebar } from "@/components/shell/RoleSidebar";

type AppShellProps = {
  role: Role;
  account: AccountChipData;
  hideFindTutors?: boolean;
  children: ReactNode;
};

export function AppShell({ role, account, hideFindTutors = false, children }: AppShellProps) {
  const pathname = usePathname() ?? "/";
  const [menuOpen, setMenuOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const items = visibleNavItems(role, hideFindTutors);
  const tabs = mobileTabItems(role, items);
  const more = mobileMoreItems(role, items);

  return (
    <PageTitleProvider>
      <div className="min-h-dvh bg-background">
        <aside className="fixed inset-y-0 left-0 z-30 hidden w-[240px] border-r border-border bg-card lg:flex">
          <div className="h-full w-full">
            <RoleSidebar role={role} items={items} account={account} />
          </div>
        </aside>

        <MobileTopBar
          onOpenMenu={() => {
            setMoreOpen(false);
            setMenuOpen(true);
          }}
        />

        <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
          <SheetContent
            side="left"
            showCloseButton={false}
            className="w-[240px] gap-0 bg-card p-0 sm:max-w-[240px]"
          >
            <SheetHeader className="sr-only">
              <SheetTitle>Menu</SheetTitle>
            </SheetHeader>
            <RoleSidebar
              role={role}
              items={items}
              account={account}
              onNavigate={() => setMenuOpen(false)}
            />
          </SheetContent>
        </Sheet>

        <Sheet open={moreOpen} onOpenChange={setMoreOpen}>
          <SheetContent side="bottom" className="gap-2 bg-card sm:max-w-none">
            <SheetHeader>
              <SheetTitle>More</SheetTitle>
            </SheetHeader>
            <nav className="flex flex-col gap-1 px-4 pb-6">
              {more.map((item) => {
                const active = isNavItemActive(pathname, item);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    onClick={() => setMoreOpen(false)}
                    className={cn(
                      "flex h-11 items-center gap-3 rounded-[10px] px-3 text-sm",
                      active
                        ? "bg-accent font-semibold text-primary"
                        : "font-medium text-muted-foreground",
                    )}
                  >
                    <Icon size={18} strokeWidth={2} aria-hidden="true" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </SheetContent>
        </Sheet>

        <main className="lg:pl-[240px]">
          <div className="px-4 py-4 pb-24 sm:px-4 sm:pb-8 lg:px-10 lg:py-8">{children}</div>
        </main>

        <MobileTabBar
          items={tabs}
          moreOpen={moreOpen}
          onMore={() => {
            setMenuOpen(false);
            setMoreOpen(true);
          }}
        />

        <DevRoleSwitcher role={role} />
      </div>
    </PageTitleProvider>
  );
}
