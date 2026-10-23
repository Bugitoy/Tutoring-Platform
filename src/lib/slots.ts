import { addGaboroneDays, formatDayButton, gaboroneDate } from "./format";
import { cat, MOCK_NOW_ISO } from "./mock/ids";
import { LESSONS } from "./mock/lessons";
import type { Lesson } from "./types";

export const BOOKING_TIMES = ["15:00", "17:00", "18:00", "19:00"] as const;

const BLOCKING = new Set<Lesson["status"]>(["booked", "live", "awaiting_payment"]);

export type SlotChoice = {
  start: string;
  time: string;
  state: "open" | "booked" | "past";
};

export type BookingDay = {
  date: string;
  weekday: string;
  label: string;
  slots: SlotChoice[];
};

export function buildBookingDays(
  tutorId: string,
  nowIso = MOCK_NOW_ISO,
  lessons: Lesson[] = LESSONS,
): BookingDay[] {
  const today = gaboroneDate(nowIso);
  const now = new Date(nowIso).getTime();

  return Array.from({ length: 4 }, (_, index) => {
    const date = addGaboroneDays(today, index);
    const { weekday, label } = formatDayButton(date);
    const slots: SlotChoice[] = BOOKING_TIMES.map((time) => {
      const start = cat(date, time);
      const taken = lessons.some(
        (lesson) => lesson.tutorId === tutorId && lesson.start === start && BLOCKING.has(lesson.status),
      );
      const past = new Date(start).getTime() <= now;
      const state: SlotChoice["state"] = taken ? "booked" : past ? "past" : "open";
      return { start, time, state };
    });
    return { date, weekday, label, slots };
  });
}

export function firstOpenSlot(days: BookingDay[]): string | null {
  for (const day of days) {
    const open = day.slots.find((slot) => slot.state === "open");
    if (open) return open.start;
  }
  return null;
}
