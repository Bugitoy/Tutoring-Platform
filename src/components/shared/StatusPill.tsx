import type { ReactNode } from "react";
import { cn } from "cn";

export type StatusTone = "success" | "info" | "warning" | "danger" | "neutral" | "live";

type StatusPillProps = {
  tone: StatusTone;
  children: ReactNode;
  className?: string;
};

const TONE_CLASS: Record<StatusTone, string> = {
  success: "bg-status-success-bg text-status-success-fg",
  info: "bg-status-info-bg text-status-info-fg",
  warning: "bg-status-warning-bg text-status-warning-fg",
  danger: "bg-status-danger-bg text-status-danger-fg",
  neutral: "bg-status-neutral-bg text-status-neutral-fg",
  live: "bg-status-live-bg text-status-live-fg",
};

export function StatusPill({ tone, children, className }: StatusPillProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-[5px] text-xs font-bold",
        TONE_CLASS[tone],
        className,
      )}
    >
      {tone === "live" ? (
        <span className="size-1.5 rounded-full bg-status-live-dot" aria-hidden="true" />
      ) : null}
      {children}
    </span>
  );
}
