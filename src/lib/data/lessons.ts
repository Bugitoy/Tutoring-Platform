import { gridRange } from "@/lib/calendar";
import { addGaboroneDays, gaboroneDate } from "@/lib/format";
import { LESSONS, OPEN_SLOTS, PAYMENT_REQUESTS } from "@/lib/mock/lessons";
import { REPORTS } from "@/lib/mock/reports";
import { getStudentById } from "@/lib/mock/users";
import type { Lesson, PaymentRequest, Report, Slot } from "@/lib/types";

const BLOCKING = new Set<Lesson["status"]>(["booked", "live", "awaiting_payment"]);

function onMonthGrid(iso: string, month: string) {
  const { from, to } = gridRange(month);
  const day = gaboroneDate(iso);
  return day >= from && day <= to;
}

function byStart(a: Lesson, b: Lesson) {
  return a.start.localeCompare(b.start);
}

function endMs(lesson: Lesson) {
  return new Date(lesson.start).getTime() + lesson.durationMin * 60000;
}

/** Lessons on the month grid, including the adjacent-month days shown in it. */
export async function getLessonsForStudent(studentId: string, month: string): Promise<Lesson[]> {
  return LESSONS.filter((lesson) => lesson.studentId === studentId && onMonthGrid(lesson.start, month)).sort(byStart);
}

/** Lessons on the month grid for every child of the parent, or just one child. */
export async function getLessonsForParent(
  parentId: string,
  month: string,
  childId?: string,
): Promise<Lesson[]> {
  return LESSONS.filter((lesson) => {
    if (!onMonthGrid(lesson.start, month)) return false;
    const student = getStudentById(lesson.studentId);
    if (!student || student.linkedParentId !== parentId) return false;
    if (childId && lesson.studentId !== childId) return false;
    return true;
  }).sort(byStart);
}

/** Lessons and open slots from Monday `weekStart` to the Sunday after it. */
export async function getTutorWeek(
  tutorId: string,
  weekStart: string,
): Promise<{ lessons: Lesson[]; open: Slot[] }> {
  const weekEnd = addGaboroneDays(weekStart, 6);
  const inWeek = (iso: string) => {
    const day = gaboroneDate(iso);
    return day >= weekStart && day <= weekEnd;
  };

  return {
    lessons: LESSONS.filter((lesson) => lesson.tutorId === tutorId && inWeek(lesson.start)).sort(byStart),
    open: OPEN_SLOTS.filter((slot) => slot.tutorId === tutorId && inWeek(slot.start)),
  };
}

/** Today's lessons for Tutor · Today. Lessons waiting for a parent's payment stay hidden. */
export async function getTutorDay(tutorId: string, date: string): Promise<Lesson[]> {
  return LESSONS.filter(
    (lesson) => lesson.tutorId === tutorId && gaboroneDate(lesson.start) === date && lesson.status !== "awaiting_payment",
  ).sort(byStart);
}

/** Finished lessons still waiting for the after-class report, oldest first. */
export async function getReportsDue(tutorId: string): Promise<Lesson[]> {
  return LESSONS.filter(
    (lesson) => lesson.tutorId === tutorId && lesson.status === "completed" && lesson.reportStatus === "report_due",
  ).sort(byStart);
}

/** Booked or live lessons that haven't ended, soonest first. */
export async function getTutorUpcoming(tutorId: string, now: string): Promise<Lesson[]> {
  const nowMs = new Date(now).getTime();
  return LESSONS.filter(
    (lesson) =>
      lesson.tutorId === tutorId && (lesson.status === "booked" || lesson.status === "live") && endMs(lesson) > nowMs,
  ).sort(byStart);
}

/** Opens a closed hour for booking, or closes an open one. Booked and past hours can't change. */
export async function toggleOpenSlot(tutorId: string, start: string, now: string): Promise<"open" | "unavailable"> {
  if (new Date(start).getTime() <= new Date(now).getTime()) throw new Error("That time has already passed.");
  const booked = LESSONS.some(
    (lesson) => lesson.tutorId === tutorId && lesson.start === start && lesson.status !== "cancelled",
  );
  if (booked) throw new Error("A lesson is booked at that time.");

  const index = OPEN_SLOTS.findIndex((slot) => slot.tutorId === tutorId && slot.start === start);
  if (index >= 0) {
    OPEN_SLOTS.splice(index, 1);
    return "unavailable";
  }
  OPEN_SLOTS.push({ tutorId, start, end: new Date(new Date(start).getTime() + 60 * 60000).toISOString() });
  return "open";
}

/** Every lesson a tutor and student have had or booked, oldest first. */
export async function getLessonsBetween(tutorId: string, studentId: string): Promise<Lesson[]> {
  return LESSONS.filter((lesson) => lesson.tutorId === tutorId && lesson.studentId === studentId).sort(byStart);
}

export async function getLesson(lessonId: string): Promise<Lesson | undefined> {
  return LESSONS.find((lesson) => lesson.id === lessonId);
}

export async function getLessonSummary(
  lessonId: string,
): Promise<{ lesson: Lesson; report: Report } | undefined> {
  const lesson = LESSONS.find((item) => item.id === lessonId);
  const report = REPORTS.find((item) => item.lessonId === lessonId);
  if (!lesson || !report) return undefined;
  return { lesson, report };
}

/** The next paid lesson that has not ended yet. */
export async function getNextLesson(studentId: string, now: string): Promise<Lesson | undefined> {
  const nowMs = new Date(now).getTime();
  return LESSONS.filter(
    (lesson) =>
      lesson.studentId === studentId &&
      (lesson.status === "booked" || lesson.status === "live") &&
      endMs(lesson) > nowMs,
  ).sort(byStart)[0];
}

/** Future lessons, paid or waiting for payment, excluding `exceptId` (the hero lesson). */
export async function getUpcomingLessons(
  studentId: string,
  now: string,
  limit: number,
  exceptId?: string,
): Promise<Lesson[]> {
  const nowMs = new Date(now).getTime();
  return LESSONS.filter(
    (lesson) =>
      lesson.studentId === studentId &&
      lesson.id !== exceptId &&
      (lesson.status === "booked" || lesson.status === "awaiting_payment") &&
      new Date(lesson.start).getTime() > nowMs,
  )
    .sort(byStart)
    .slice(0, limit);
}

/** The most recent completed lessons, newest first. */
export async function getPastLessons(studentId: string, now: string, limit: number): Promise<Lesson[]> {
  const nowMs = new Date(now).getTime();
  return LESSONS.filter(
    (lesson) =>
      lesson.studentId === studentId && lesson.status === "completed" && new Date(lesson.start).getTime() <= nowMs,
  )
    .sort((a, b) => byStart(b, a))
    .slice(0, limit);
}

/** The tutor who has taught the student most often. */
export async function getMainTutorId(studentId: string): Promise<string | undefined> {
  const counts = new Map<string, number>();
  for (const lesson of LESSONS) {
    if (lesson.studentId === studentId && lesson.status !== "cancelled") {
      counts.set(lesson.tutorId, (counts.get(lesson.tutorId) ?? 0) + 1);
    }
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0];
}

export type ParentMonthSummary = {
  children: { studentId: string; attended: number; held: number }[];
  stillToCome: number;
  waiting: { count: number; amount: number };
};

/** "October so far" on Parent · Calendar. */
export async function getParentMonthSummary(
  parentId: string,
  childIds: string[],
  month: string,
  now: string,
): Promise<ParentMonthSummary> {
  const nowMs = new Date(now).getTime();
  const inMonth = LESSONS.filter(
    (lesson) => childIds.includes(lesson.studentId) && gaboroneDate(lesson.start).slice(0, 7) === month,
  );

  const children = childIds.map((studentId) => {
    const past = inMonth.filter(
      (lesson) => lesson.studentId === studentId && new Date(lesson.start).getTime() <= nowMs,
    );
    return {
      studentId,
      attended: past.filter((lesson) => lesson.status === "completed").length,
      held: past.filter((lesson) => lesson.status === "completed" || lesson.status === "missed").length,
    };
  });

  const stillToCome = inMonth.filter(
    (lesson) =>
      (lesson.status === "booked" || lesson.status === "live") && endMs(lesson) > nowMs,
  ).length;

  const pending = PAYMENT_REQUESTS.filter((request) => request.toParentId === parentId && request.status === "pending");
  return {
    children,
    stillToCome,
    waiting: { count: pending.length, amount: pending.reduce((sum, request) => sum + request.amount, 0) },
  };
}

export async function rescheduleLesson(lessonId: string, start: string): Promise<Lesson> {
  const lesson = LESSONS.find((item) => item.id === lessonId);
  if (!lesson) throw new Error("We couldn’t find that lesson.");
  if (lesson.status !== "booked") throw new Error("Only booked lessons can be moved.");
  const taken = LESSONS.some(
    (item) => item.id !== lessonId && item.tutorId === lesson.tutorId && item.start === start && BLOCKING.has(item.status),
  );
  if (taken) throw new Error("That time was just booked.");
  lesson.start = start;
  return lesson;
}

export async function getPaymentRequest(id: string): Promise<PaymentRequest | undefined> {
  return PAYMENT_REQUESTS.find((item) => item.id === id);
}

export async function getPendingPaymentRequests(parentId: string): Promise<PaymentRequest[]> {
  return PAYMENT_REQUESTS.filter((item) => item.toParentId === parentId && item.status === "pending");
}
