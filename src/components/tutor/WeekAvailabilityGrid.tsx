"use client";

import { useOptimistic, useTransition, type ReactNode } from "react";
import Link from "next/link";
import { MessageSquare } from "lucide-react";
import { toast } from "sonner";
import { cn } from "cn";
import { StatusPill, type StatusTone } from "@/components/shared/StatusPill";
import { buttonVariants } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { toggleSlot } from "@/lib/actions/tutor";
import { formatDayNumber, formatMoney, formatWeekday, formatYmdLong } from "@/lib/format";
import { weekCounts, type WeekCell, type WeekGrid } from "@/lib/tutorWeek";

export type BookedLessonDetail = {
  studentName: string;
  shortName: string;
  course: string;
  title: string;
  when: string;
  status: { label: string; tone: StatusTone };
};

type WeekAvailabilityGridProps = {
  grid: WeekGrid;
  today: string;
  /** Keyed by lesson id. */
  booked: Record<string, BookedLessonDetail>;
  /** Booking settings card, shown above the week totals in the side column. */
  settings: ReactNode;
  isThisWeek: boolean;
};

type SlotChange = { start: string; state: WeekCell["state"] };

function hourLabel(hour: number) {
  return `${String(hour).padStart(2, "0")}:00`;
}

export function WeekAvailabilityGrid({ grid, today, booked, settings, isThisWeek }: WeekAvailabilityGridProps) {
  const [, startTransition] = useTransition();
  const [changes, addChange] = useOptimistic<Record<string, WeekCell["state"]>, SlotChange>({}, (current, change) => ({
    ...current,
    [change.start]: change.state,
  }));

  const shown: WeekGrid = {
    ...grid,
    cells: grid.cells.map((column) =>
      column.map((cell) => (cell.state !== "booked" && changes[cell.start] ? { ...cell, state: changes[cell.start] } : cell)),
    ),
  };
  const counts = weekCounts(shown);

  function toggle(cell: WeekCell) {
    const next = cell.state === "open" ? "unavailable" : "open";
    startTransition(async () => {
      addChange({ start: cell.start, state: next });
      const result = await toggleSlot(cell.start);
      if (!result.ok) toast.error(result.error);
    });
  }

  return (
    <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_260px]">
      <div className="min-w-0">
        <ul className="mb-3 flex flex-wrap gap-x-5 gap-y-1.5 text-xs text-muted-foreground" aria-label="Legend">
          <li className="inline-flex items-center gap-1.5">
            <span aria-hidden="true" className="size-3 rounded-[3px] bg-primary" />
            Booked lesson
          </li>
          <li className="inline-flex items-center gap-1.5">
            <span aria-hidden="true" className="size-3 rounded-[3px] border-2 border-dashed border-status-success-fg" />
            Open for booking
          </li>
          <li className="inline-flex items-center gap-1.5">
            <span aria-hidden="true" className="size-3 rounded-[3px] bg-divider-soft" />
            Unavailable
          </li>
        </ul>

        <div className="overflow-x-auto rounded-xl border border-border bg-card">
          <table className="w-full min-w-[620px] table-fixed border-separate border-spacing-1 p-1">
            <caption className="sr-only">
              Your week. Choose a grey hour to open it for booking, or an open hour to close it.
            </caption>
            <colgroup>
              <col className="w-14" />
            </colgroup>
            <thead>
              <tr>
                <td />
                {shown.days.map((day) => {
                  const isToday = day === today;
                  const noon = `${day}T12:00:00+02:00`;
                  return (
                    <th
                      key={day}
                      scope="col"
                      aria-current={isToday ? "date" : undefined}
                      className={cn("rounded-lg py-2 text-center", isToday ? "bg-accent text-primary" : "text-foreground")}
                    >
                      <span className={cn("block text-[11px] font-bold uppercase", !isToday && "text-muted-foreground")}>
                        {formatWeekday(noon)}
                      </span>
                      <span className="block text-[17px] font-bold">{formatDayNumber(noon)}</span>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {shown.hours.map((hour, hourIndex) => (
                <tr key={hour}>
                  <th scope="row" className="h-16 pt-1.5 pr-1 text-right align-top text-xs font-medium text-muted-foreground">
                    {hourLabel(hour)}
                  </th>
                  {shown.days.map((day, dayIndex) => {
                    const cell = shown.cells[dayIndex][hourIndex];
                    return (
                      <td key={day} className="h-16 p-0">
                        <SlotCell cell={cell} detail={cell.lesson ? booked[cell.lesson.id] : undefined} onToggle={toggle} />
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <aside className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
        <div>{settings}</div>
        <div className="flex flex-col gap-4">
          <section className="rounded-xl border border-border bg-card p-5" aria-live="polite">
            <h2 className="mb-3 text-[15px] font-bold text-foreground">{isThisWeek ? "This week" : "Week totals"}</h2>
            <dl className="flex flex-col gap-2 text-[13px]">
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">Booked</dt>
                <dd className="font-bold text-foreground">
                  {counts.booked} {counts.booked === 1 ? "lesson" : "lessons"}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">Still open</dt>
                <dd className="font-bold text-foreground">
                  {counts.open} {counts.open === 1 ? "slot" : "slots"}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">Expected earnings</dt>
                <dd className="font-bold text-foreground">{formatMoney(counts.expected)}</dd>
              </div>
            </dl>
          </section>
          <button
            type="button"
            className={buttonVariants({ variant: "outline", className: "w-full" })}
            onClick={() => toast("Google Calendar sync isn’t available yet.")}
          >
            Sync with Google Calendar
          </button>
        </div>
      </aside>
    </div>
  );
}

function SlotCell({
  cell,
  detail,
  onToggle,
}: {
  cell: WeekCell;
  detail?: BookedLessonDetail;
  onToggle: (cell: WeekCell) => void;
}) {
  const when = `${formatYmdLong(cell.date)}, ${hourLabel(cell.hour)}`;
  const box = "flex h-14 w-full items-start rounded-lg px-2 py-1.5 text-left text-xs font-semibold";

  if (cell.state === "booked") {
    return (
      <Popover>
        <PopoverTrigger
          aria-label={`${when}: lesson with ${detail?.studentName ?? "a student"}`}
          className={cn(box, "bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none")}
        >
          <span className="truncate">{detail?.shortName ?? "Booked"}</span>
        </PopoverTrigger>
        {detail ? (
          <PopoverContent align="start" className="w-72 gap-3 rounded-xl p-4">
            <div>
              <p className="text-[15px] font-bold text-foreground">{detail.studentName}</p>
              <p className="text-[13px] text-muted-foreground">
                {detail.course} · {detail.title}
              </p>
              <p className="mt-1 text-[13px] text-foreground">{detail.when}</p>
            </div>
            <StatusPill tone={detail.status.tone} className="self-start">
              {detail.status.label}
            </StatusPill>
            <Link href="/tutor/messages" className={buttonVariants({ variant: "outline", size: "sm", className: "w-full" })}>
              <MessageSquare aria-hidden="true" />
              Message
            </Link>
          </PopoverContent>
        ) : null}
      </Popover>
    );
  }

  const isOpen = cell.state === "open";
  if (cell.past) {
    return (
      <div
        aria-label={`${when}: ${isOpen ? "open" : "unavailable"}, already passed`}
        role="img"
        className={cn(
          box,
          isOpen ? "border-2 border-dashed border-status-success-fg text-status-success-fg opacity-60" : "bg-divider-soft",
        )}
      >
        {isOpen ? "Open" : null}
      </div>
    );
  }

  return (
    <button
      type="button"
      aria-label={`${when}: ${isOpen ? "open for booking. Choose to close it" : "unavailable. Choose to open it for booking"}`}
      onClick={() => onToggle(cell)}
      className={cn(
        box,
        "transition-colors focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
        isOpen
          ? "border-2 border-dashed border-status-success-fg bg-card text-status-success-fg hover:bg-status-success-bg"
          : "bg-divider-soft hover:bg-border",
      )}
    >
      {isOpen ? "Open" : null}
    </button>
  );
}
