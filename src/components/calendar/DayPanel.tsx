import type { ReactNode } from "react";
import Link from "next/link";
import { cn } from "cn";
import { CAT_CLASS } from "@/components/calendar/styles";
import { EmptyState } from "@/components/shared/EmptyState";
import { StatusPill, type StatusTone } from "@/components/shared/StatusPill";
import type { CatIndex } from "@/lib/calendar";
import type { LessonAction } from "@/lib/lessonStatus";

export type DayPanelRow = {
  id: string;
  cat: CatIndex;
  title: string;
  meta: string;
  pill: { label: string; tone: StatusTone };
  action?: LessonAction;
};

type DayPanelProps = {
  isToday: boolean;
  dateLabel: string;
  rows: DayPanelRow[];
  emptyDescription: string;
  emptyAction?: ReactNode;
};

export function DayPanel({ isToday, dateLabel, rows, emptyDescription, emptyAction }: DayPanelProps) {
  return (
    <section className="rounded-xl border-2 border-primary bg-card p-5" aria-live="polite">
      <p className="text-xs font-bold tracking-[0.07em] text-primary uppercase">{isToday ? "Today" : "Selected day"}</p>
      <h2 className="mt-1 text-[17px] font-bold text-foreground">{dateLabel}</h2>
      {rows.length === 0 ? (
        <EmptyState
          className="mt-4 p-4"
          title="No lessons on this day."
          description={emptyDescription}
          action={emptyAction}
        />
      ) : (
        <ul className="mt-3 divide-y divide-border">
          {rows.map((row) => (
            <li key={row.id} className="py-3 first:pt-1 last:pb-0">
              <div className={cn("flex items-start justify-between gap-3 border-l-[3px] pl-3", CAT_CLASS[row.cat].bar)}>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-foreground">{row.title}</p>
                  <p className="mt-0.5 text-[13px] text-muted-foreground">{row.meta}</p>
                  <StatusPill tone={row.pill.tone} className="mt-2">
                    {row.pill.label}
                  </StatusPill>
                </div>
                {row.action ? (
                  <Link
                    href={row.action.href}
                    className="inline-flex min-h-11 shrink-0 items-start pt-0.5 text-[13px] font-semibold text-primary underline underline-offset-2"
                  >
                    {row.action.label}
                  </Link>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
