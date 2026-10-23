import type { ReactNode } from "react";
import { cn } from "cn";
import { Progress } from "@/components/ui/progress";

type StatCardProps = {
  label: string;
  value: ReactNode;
  subline?: ReactNode;
  progress?: number;
  className?: string;
};

export function StatCard({ label, value, subline, progress, className }: StatCardProps) {
  return (
    <section className={cn("rounded-xl border border-border bg-card p-5 shadow-none", className)}>
      <p className="text-[13px] font-medium text-muted-foreground">{label}</p>
      <p className="mt-1 text-[28px] leading-none font-bold text-foreground">{value}</p>
      {subline ? <div className="mt-2 text-[13px] text-muted-foreground">{subline}</div> : null}
      {typeof progress === "number" ? (
        <Progress
          value={progress}
          className="mt-3 gap-0 [&_[data-slot=progress-track]]:h-2 [&_[data-slot=progress-track]]:bg-border"
        >
          <span className="sr-only">{progress}% complete</span>
        </Progress>
      ) : null}
    </section>
  );
}
