import { LESSONS } from "@/lib/mock/lessons";
import { EARNINGS_WEEKS } from "@/lib/mock/payments";
import { IDS, pula } from "@/lib/mock/ids";
import { getStudentById } from "@/lib/mock/users";
import type { EarningsWeek, Lesson } from "@/lib/types";

type Payout = { readyToPayout: number; nextPayoutAt: string; bankLast4: string };

const PAYOUTS: Record<string, Payout> = {
  [IDS.molefe]: { readyToPayout: pula(1028.5), nextPayoutAt: "2026-10-23T08:00:00+02:00", bankLast4: "2210" },
};

const MONTH_TOTALS: Record<string, number> = {
  [IDS.molefe]: pula(2340),
};

export type StatementRow = {
  lessonId: string;
  date: string;
  studentName: string;
  title: string;
  durationMin: Lesson["durationMin"];
  paid: number;
};

export async function getTutorEarnings(tutorId: string): Promise<
  Payout & { weeks: EarningsWeek[]; monthTotal: number }
> {
  const payout = PAYOUTS[tutorId] ?? { readyToPayout: 0, nextPayoutAt: "2026-10-23T08:00:00+02:00", bankLast4: "0000" };
  return {
    ...payout,
    weeks: tutorId === IDS.molefe ? EARNINGS_WEEKS : [],
    monthTotal: MONTH_TOTALS[tutorId] ?? 0,
  };
}

/** Lessons the tutor has taught, newest first, for the statement table. */
export async function getStatementRows(tutorId: string, now: string, limit: number): Promise<StatementRow[]> {
  const nowMs = new Date(now).getTime();
  return LESSONS.filter(
    (lesson) => lesson.tutorId === tutorId && lesson.status === "completed" && new Date(lesson.start).getTime() <= nowMs,
  )
    .sort((a, b) => b.start.localeCompare(a.start))
    .slice(0, limit)
    .map((lesson) => ({
      lessonId: lesson.id,
      date: lesson.start,
      studentName: getStudentById(lesson.studentId)?.fullName ?? "Student",
      title: lesson.title,
      durationMin: lesson.durationMin,
      paid: lesson.price,
    }));
}

/** Sends the ready balance to the bank account now instead of on Friday. */
export async function payOutNow(tutorId: string): Promise<{ amount: number; bankLast4: string }> {
  const payout = PAYOUTS[tutorId];
  if (!payout || payout.readyToPayout <= 0) throw new Error("There’s nothing ready to pay out yet.");
  const amount = payout.readyToPayout;
  payout.readyToPayout = 0;
  return { amount, bankLast4: payout.bankLast4 };
}
