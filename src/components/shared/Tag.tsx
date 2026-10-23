import type { ReactNode } from "react";
import { cn } from "cn";

type TagProps = {
  matched?: boolean;
  children: ReactNode;
  className?: string;
};

export function Tag({ matched = false, children, className }: TagProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-[6px] px-2 py-1 text-xs font-semibold",
        matched ? "bg-status-info-bg text-status-info-fg" : "bg-divider-soft text-text-secondary",
        className,
      )}
    >
      {children}
    </span>
  );
}
