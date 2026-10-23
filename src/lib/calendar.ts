import { addGaboroneDays } from "./format";

export type CatIndex = 1 | 2 | 3 | 4 | 5;
export type ChipStyle = "subject" | "done" | "missed" | "pending";

function utc(yyyyMmDd: string) {
  const [year, month, day] = yyyyMmDd.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

export function isYmd(value: string | undefined): value is string {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  return utc(value).toISOString().slice(0, 10) === value;
}

export function monthOf(yyyyMmDd: string): string {
  return yyyyMmDd.slice(0, 7);
}

/** 0 = Monday … 6 = Sunday */
export function mondayIndex(yyyyMmDd: string): number {
  return (utc(yyyyMmDd).getUTCDay() + 6) % 7;
}

export function shiftMonth(yyyyMm: string, months: number): string {
  const [year, month] = yyyyMm.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1 + months, 1)).toISOString().slice(0, 7);
}

/** Weeks (Monday first) covering the month, including leading and trailing days of adjacent months. */
export function monthGrid(yyyyMm: string): string[][] {
  const first = `${yyyyMm}-01`;
  const last = addGaboroneDays(`${shiftMonth(yyyyMm, 1)}-01`, -1);
  const start = addGaboroneDays(first, -mondayIndex(first));
  const end = addGaboroneDays(last, 6 - mondayIndex(last));

  const weeks: string[][] = [];
  for (let day = start; day <= end; day = addGaboroneDays(day, 7)) {
    weeks.push(Array.from({ length: 7 }, (_, index) => addGaboroneDays(day, index)));
  }
  return weeks;
}

export function gridRange(yyyyMm: string): { from: string; to: string } {
  const weeks = monthGrid(yyyyMm);
  return { from: weeks[0][0], to: weeks[weeks.length - 1][6] };
}

/** When moving to another month, land on today if it is in that month, otherwise on the 1st. */
export function landingDate(yyyyMm: string, todayYmd: string): string {
  return monthOf(todayYmd) === yyyyMm ? todayYmd : `${yyyyMm}-01`;
}

const SUBJECT_CATS: Record<string, CatIndex> = { mathematics: 1, physics: 2 };

export function subjectCat(subjectId: string): CatIndex {
  if (SUBJECT_CATS[subjectId]) return SUBJECT_CATS[subjectId];
  const hash = [...subjectId].reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return ((hash % 3) + 3) as CatIndex;
}

/** First child is cat-1, second is cat-3 (section 7.14). */
export function childCat(index: number): CatIndex {
  const order: CatIndex[] = [1, 3, 4, 5, 2];
  return order[index % order.length];
}
