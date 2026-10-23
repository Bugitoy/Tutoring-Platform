"use client";

import { useOptimistic, useTransition, type ReactNode } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { DayPanel, type DayPanelRow } from "@/components/calendar/DayPanel";
import { MonthCalendar, type CalendarEventBase, type LegendItem } from "@/components/calendar/MonthCalendar";
import { landingDate } from "@/lib/calendar";
import { formatYmdLong } from "@/lib/format";

export type CalendarLessonEvent = CalendarEventBase & { row: DayPanelRow };

type CalendarWithDayPanelProps = {
  month: string;
  today: string;
  selectedDate: string;
  events: CalendarLessonEvent[];
  legend: LegendItem[];
  calendarAction?: ReactNode;
  emptyDescription: string;
  emptyAction?: ReactNode;
  /** Cards under the day panel in the side column. */
  children?: ReactNode;
};

export function CalendarWithDayPanel({
  month,
  today,
  selectedDate,
  events,
  legend,
  calendarAction,
  emptyDescription,
  emptyAction,
  children,
}: CalendarWithDayPanelProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [date, setDate] = useOptimistic(selectedDate);

  function go(next: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("date", next);
    startTransition(() => {
      setDate(next);
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    });
  }

  const rows = events.filter((event) => event.date === date).map((event) => event.row);

  return (
    <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
      <MonthCalendar
        month={month}
        today={today}
        selectedDate={date}
        events={events}
        colorBy={(event) => event.row.cat}
        onSelect={go}
        onMonthChange={(next) => go(landingDate(next, today))}
        legend={legend}
        action={calendarAction}
        busy={isPending && !date.startsWith(month)}
      />
      <div className="flex flex-col gap-4">
        <DayPanel
          isToday={date === today}
          dateLabel={formatYmdLong(date)}
          rows={rows}
          emptyDescription={emptyDescription}
          emptyAction={emptyAction}
        />
        {children}
      </div>
    </div>
  );
}
