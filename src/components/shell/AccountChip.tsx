import Link from "next/link";
import { cn } from "cn";
import type { AccountChipData } from "@/lib/account";

type AccountChipProps = {
  account: AccountChipData;
  href: string;
  active?: boolean;
};

export function AccountChip({ account, href, active = false }: AccountChipProps) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex items-center gap-3 border-t border-border px-3 py-3",
        active && "bg-accent",
      )}
    >
      <span
        className="flex size-9 shrink-0 items-center justify-center rounded-full bg-accent text-xs font-bold text-accent-foreground"
        aria-hidden="true"
      >
        {account.initials}
      </span>
      <span className="min-w-0">
        <span className="block truncate text-sm font-semibold text-foreground">{account.name}</span>
        <span className="block truncate text-xs text-muted-foreground">{account.subline}</span>
      </span>
    </Link>
  );
}
