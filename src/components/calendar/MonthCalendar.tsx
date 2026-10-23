"use client";

import { useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "cn";
import { Button } from "@/components/ui/button";
import { chipClass, dotClass, swatchClass, type LegendSwatch } from "@/components/calendar/styles";
import { monthGrid, monthOf, shiftMonth, type CatIndex, type ChipStyle } from "@/lib/calendar";
import { addGaboroneDays, formatMonthTitle, formatYmdLong } from "@/lib/format";

export type CalendarEventBase = {
  id: string;
  /** yyyy-MM-dd in Botswana time */
  date: string;
  chipText: string;
  chip: ChipStyle;
};

export type LegendItem = { label: string; swatch: LegendSwatch };

type MonthCalendarProps<E extends CalendarEventBase> = {
  month: string;
  today: string;
  selectedDate: string;
  events: E[];
  colorBy: (event: E) => CatIndex;
  onSelect: (date: string) => void;
  onMonthChange: (month: string) => void;
  legend: LegendItem[];
  action?: ReactNode;
  busy?: boolean;
};

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MAX_CHIPS = 3;

export function MonthCalendar<E extends CalendarEventBase>({
  month,
  today,
  selectedDate,
  events,
  colorBy,
  onSelect,
  onMonthChange,
  legend,
  action,
  busy,
}: MonthCalendarProps<E>) {
  const weeks = monthGrid(month);
  const days = weeks.flat();
  const cells = useRef(new Map<string, HTMLButtonElement>());
  const [focusDate, setFocusDate] = useState<string | null>(null);
  const tabStop = focusDate && days.includes(focusDate) ? focusDate : days.includes(selectedDate) ? selectedDate : days[0];

  const byDate = new Map<string, E[]>();
  for (const event of events) byDate.set(event.date, [...(byDate.get(event.date) ?? []), event]);

  function moveFocus(event: KeyboardEvent<HTMLButtonElement>, date: string) {
    const step = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 }[event.key];
    if (!step) return;
    event.preventDefault();
    const next = addGaboroneDays(date, step);
    if (!days.includes(next)) return;
    setFocusDate(next);
    cells.current.get(next)?.focus();
  }

  return (
    <section className="rounded-xl border border-border bg-card p-4 md:p-5" aria-label="Lesson calendar">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon-sm" aria-label="Previous month" onClick={() => onMonthChange(shiftMonth(month, -1))}>
            <ChevronLeft aria-hidden="true" />
          </Button>
          <h2 className="min-w-28 text-center text-[17px] font-bold text-foreground" aria-live="polite">
            {formatMonthTitle(month, today)}
          </h2>
          <Button variant="outline" size="icon-sm" aria-label="Next month" onClick={() => onMonthChange(shiftMonth(month, 1))}>
            <ChevronRight aria-hidden="true" />
          </Button>
        </div>
        {action}
      </div>

      <ul className="mb-3 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
        {legend.map((item) => (
          <li key={item.label} className="inline-flex items-center gap-1.5">
            <span aria-hidden="true" className={cn("size-2.5 rounded-[3px]", swatchClass(item.swatch))} />
            {item.label}
          </li>
        ))}
      </ul>

      <div className={cn("overflow-x-auto transition-opacity", busy && "opacity-60")} aria-busy={busy}>
        <div className="overflow-hidden rounded-xl border border-border sm:min-w-[560px]">
          <div className="grid grid-cols-7 gap-px border-b border-border bg-border">
            {WEEKDAYS.map((weekday) => (
              <div key={weekday} className="bg-surface-subtle py-2 text-center text-xs font-semibold text-muted-foreground">
                {weekday}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-px bg-border">
            {weeks.map((week) => (
              <div key={week[0]} className="contents">
                {week.map((date) => {
                  const dayEvents = byDate.get(date) ?? [];
                  const inMonth = monthOf(date) === month;
                  const isToday = date === today;
                  const selected = date === selectedDate;
                  const count = dayEvents.length;
                  return (
                    <div key={date} className="contents">
                      <button
                        ref={(node) => {
                          if (node) cells.current.set(date, node);
                          else cells.current.delete(date);
                        }}
                        type="button"
                        tabIndex={date === tabStop ? 0 : -1}
                        aria-label={`${formatYmdLong(date)}, ${count === 0 ? "no lessons" : count === 1 ? "1 lesson" : `${count} lessons`}`}
                        aria-pressed={selected}
                        aria-current={isToday ? "date" : undefined}
                        onClick={() => {
                          setFocusDate(date);
                          onSelect(date);
                        }}
                        onKeyDown={(event) => moveFocus(event, date)}
                        className={cn(
                          "flex min-h-14 flex-col items-stretch gap-1 bg-card p-1.5 text-left outline-none focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset sm:min-h-[104px] sm:p-2",
                          selected && "bg-accent/60 ring-2 ring-primary ring-inset",
                        )}
                      >
                        <span
                          className={cn(
                            "inline-flex size-6 items-center justify-center self-start rounded-full text-[13px] font-semibold",
                            inMonth ? "text-foreground" : "text-text-faint",
                            isToday && "bg-primary text-primary-foreground",
                          )}
                        >
                          {Number(date.slice(8))}
                        </span>
                        <span className="hidden flex-col gap-1 sm:flex">
                          {dayEvents.slice(0, MAX_CHIPS).map((event) => (
                            <span
                              key={event.id}
                              className={cn(
                                "truncate rounded-md px-1.5 py-0.5 text-[11px] leading-4 font-semibold",
                                chipClass(event.chip, colorBy(event)),
                              )}
                            >
                              {event.chipText}
                            </span>
                          ))}
                          {count > MAX_CHIPS ? (
                            <span className="px-1 text-[11px] font-semibold text-muted-foreground">
                              +{count - MAX_CHIPS} more
                            </span>
                          ) : null}
                        </span>
                        {count > 0 ? (
                          <span className="flex flex-wrap gap-1 sm:hidden" aria-hidden="true">
                            {dayEvents.map((event) => (
                              <span key={event.id} className={cn("size-1.5 rounded-full", dotClass(event.chip, colorBy(event)))} />
                            ))}
                          </span>
                        ) : null}
                      </button>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
