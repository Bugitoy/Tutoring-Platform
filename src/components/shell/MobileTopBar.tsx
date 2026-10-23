"use client";

import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/shell/Logo";
import { usePageTitle } from "@/components/shell/PageTitleContext";

type MobileTopBarProps = {
  onOpenMenu: () => void;
};

export function MobileTopBar({ onOpenMenu }: MobileTopBarProps) {
  const { title } = usePageTitle();

  return (
    <header className="sticky top-0 z-40 flex h-14 items-center gap-3 border-b border-border bg-card px-4 lg:hidden">
      <Logo wordmarkClassName="sr-only sm:not-sr-only" />
      <p className="min-w-0 flex-1 truncate text-sm font-semibold text-foreground">{title}</p>
      <Button type="button" variant="ghost" size="icon" aria-label="Open menu" onClick={onOpenMenu}>
        <Menu size={20} aria-hidden="true" />
      </Button>
    </header>
  );
}
