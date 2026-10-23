import { formatInTimeZone } from "date-fns-tz";
import { mondayIndex } from "./calendar";
import { TIMEZONE, addGaboroneDays, formatTime, gaboroneDate } from "./format";
import { cat } from "./mock/ids";
import type { Lesson, Slot } from "./types";

/** Hours shown on Tutor · Calendar unless a lesson falls outside them. */
export const DEFAULT_HOURS = { from: 14, to: 20 } as const;

/** Lessons the tutor sees on the grid. Payment requests stay hidden until paid. */
const ON_GRID = new Set<Lesson["status"]>(["booked", "live", "completed", "missed"]);

export type WeekCell = {
  start: string;
  date: string;
  hour: number;
  state: "booked" | "open" | "unavailable";
  lesson?: Lesson;
  past: boolean;
};

export type WeekGrid = {
  weekStart: string;
  days: string[];
  hours: number[];
  /** `cells[dayIndex][hourIndex]` */
  cells: WeekCell[][];
};

export function weekStartOf(yyyyMmDd: string): string {
  return addGaboroneDays(yyyyMmDd, -mondayIndex(yyyyMmDd));
}

export function weekDays(weekStart: string): string[] {
  return Array.from({ length: 7 }, (_, index) => addGaboroneDays(weekStart, index));
}

function hourOf(iso: string): number {
  return Number(formatTime(iso).slice(0, 2));
}

function noon(yyyyMmDd: string) {
  return new Date(`${yyyyMmDd}T12:00:00+02:00`);
}

/** "Week of 19–25 October", or "Week of 26 October – 1 November" across months. */
export function formatWeekTitle(weekStart: string): string {
  const end = addGaboroneDays(weekStart, 6);
  const sameMonth = weekStart.slice(0, 7) === end.slice(0, 7);
  const first = formatInTimeZone(noon(weekStart), TIMEZONE, sameMonth ? "d" : "d MMMM");
  const last = formatInTimeZone(noon(end), TIMEZONE, "d MMMM");
  return sameMonth ? `Week of ${first}–${last}` : `Week of ${first} – ${last}`;
}

export function lessonsOnGrid(lessons: Lesson[]): Lesson[] {
  return lessons.filter((lesson) => ON_GRID.has(lesson.status));
}

export function buildWeekGrid({
  weekStart,
  lessons,
  open,
  now,
}: {
  weekStart: string;
  lessons: Lesson[];
  open: Slot[];
  now: string;
}): WeekGrid {
  const days = weekDays(weekStart);
  const shown = lessonsOnGrid(lessons).filter((lesson) => days.includes(gaboroneDate(lesson.start)));
  const lessonHours = shown.map((lesson) => hourOf(lesson.start));
  const from = Math.min(DEFAULT_HOURS.from, ...lessonHours);
  const to = Math.max(DEFAULT_HOURS.to, ...lessonHours);
  const hours = Array.from({ length: to - from + 1 }, (_, index) => from + index);
  const nowMs = new Date(now).getTime();
  const openStarts = new Set(open.map((slot) => slot.start));

  const cells = days.map((date) =>
    hours.map((hour): WeekCell => {
      const start = cat(date, `${String(hour).padStart(2, "0")}:00`);
      const lesson = shown.find((item) => gaboroneDate(item.start) === date && hourOf(item.start) === hour);
      const state = lesson ? "booked" : openStarts.has(start) ? "open" : "unavailable";
      return { start, date, hour, state, lesson, past: new Date(start).getTime() <= nowMs };
    }),
  );

  return { weekStart, days, hours, cells };
}

/** Booked lessons, open slots and expected earnings for the "This week" card. */
export function weekCounts(grid: WeekGrid): { booked: number; open: number; expected: number } {
  const all = grid.cells.flat();
  const booked = all.filter((cell) => cell.state === "booked");
  return {
    booked: booked.length,
    open: all.filter((cell) => cell.state === "open").length,
    expected: booked.reduce((sum, cell) => sum + (cell.lesson?.price ?? 0), 0),
  };
}

/** "Neo S." from "Neo Seretse"; "Amantle K." stays as it is. */
export function shortStudentName(fullName: string): string {
  const [first, ...rest] = fullName.split(" ");
  const last = rest[rest.length - 1];
  if (!last) return first;
  return last.endsWith(".") ? `${first} ${last}` : `${first} ${last[0]}.`;
}
