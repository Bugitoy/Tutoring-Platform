import type { ReactNode } from "react";
import { cn } from "cn";

type NoticeBoxProps = {
  tone?: "info" | "warning";
  lead?: string;
  children: ReactNode;
  className?: string;
};

export function NoticeBox({ tone = "info", lead, children, className }: NoticeBoxProps) {
  return (
    <div
      className={cn(
        "rounded-xl p-4 text-sm leading-relaxed",
        tone === "info"
          ? "bg-accent text-accent-foreground"
          : "bg-status-warning-bg text-status-warning-fg",
        className,
      )}
    >
      {lead ? <p className="mb-1 font-bold">{lead}</p> : null}
      {children}
    </div>
  );
}
