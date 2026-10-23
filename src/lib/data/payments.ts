import { PAYMENT_REQUESTS } from "@/lib/mock/lessons";
import {
  PARENT_MONTH_TOTALS,
  PARENT_PAYMENTS,
  STUDENT_EXTRA_CARDS,
  STUDENT_MONTH_TOTALS,
  STUDENT_PAYMENTS,
} from "@/lib/mock/payments";
import { getTutorById } from "@/lib/mock/tutors";
import { getParentById, getStudentById } from "@/lib/mock/users";
import { formatBookingWhen, formatDayMonth, formatTime, gaboroneDate } from "@/lib/format";
import { subjectShort } from "@/lib/lessonStatus";
import type { Lesson, Parent, Payment, PaymentRequest, SavedCard, Student } from "@/lib/types";

export type StudentMonthTotals = { paidByStudent: number; paidByParent: number; waiting: number };
export type ParentMonthTotals = { lessonsCount: number; lessonsAmount: number };

/** "Visa 4821", "MC 0937" — the short form used in payment tables. */
export function cardShort(card: Pick<SavedCard, "brand" | "last4">): string {
  return `${card.brand === "mastercard" ? "MC" : "Visa"} ${card.last4}`;
}

export function defaultCard(parent: Parent): SavedCard | undefined {
  return parent.cards.find((card) => card.isDefault) ?? parent.cards[0];
}

export async function getPaymentsForStudent(studentId: string): Promise<Payment[]> {
  return STUDENT_PAYMENTS[studentId] ?? [];
}

export async function getPaymentsForParent(parentId: string): Promise<Payment[]> {
  return PARENT_PAYMENTS[parentId] ?? [];
}

export async function getStudentMonthTotals(studentId: string): Promise<StudentMonthTotals> {
  return STUDENT_MONTH_TOTALS[studentId] ?? { paidByStudent: 0, paidByParent: 0, waiting: 0 };
}

export async function getParentMonthTotals(parentId: string): Promise<ParentMonthTotals> {
  return PARENT_MONTH_TOTALS[parentId] ?? { lessonsCount: 0, lessonsAmount: 0 };
}

export async function getPaymentRequestsForParent(parentId: string): Promise<PaymentRequest[]> {
  return PAYMENT_REQUESTS.filter((item) => item.toParentId === parentId);
}

export async function getStudentCards(student: Student): Promise<SavedCard[]> {
  return [...(student.card ? [student.card] : []), ...(STUDENT_EXTRA_CARDS[student.id] ?? [])];
}

export type CardInput = { brand: SavedCard["brand"]; last4: string; expiry: string };

/** Card capture belongs to the payment provider; the mock keeps only what the UI shows. */
export async function addCard(owner: Student | Parent, input: CardInput): Promise<SavedCard> {
  if (!/^\d{4}$/.test(input.last4)) throw new Error("Enter the full card number.");
  if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(input.expiry)) throw new Error("Enter the expiry as MM/YY.");
  const card: SavedCard = { brand: input.brand, last4: input.last4, expiry: input.expiry };
  if (owner.role === "parent") {
    if (owner.cards.some((item) => item.last4 === card.last4 && item.brand === card.brand)) {
      throw new Error("That card is already saved.");
    }
    owner.cards.push(card);
  } else {
    const cards = (STUDENT_EXTRA_CARDS[owner.id] ??= []);
    if ([owner.card, ...cards].some((item) => item?.last4 === card.last4 && item.brand === card.brand)) {
      throw new Error("That card is already saved.");
    }
    if (owner.card) cards.push(card);
    else owner.card = { ...card, isDefault: true };
  }
  return card;
}

export async function setMonthlyStatement(parentId: string, on: boolean): Promise<void> {
  const parent = getParentById(parentId);
  if (!parent) throw new Error("We couldn’t find your account.");
  parent.monthlyStatement = on;
}

/* ── Keeping history and "October so far" in step with bookings ─────────────────────────── */

let sequence = 0;
function paymentId() {
  sequence += 1;
  return `pay-${Date.now().toString(36)}-${sequence}`;
}

function inMonth(totals: { month: string }, iso: string) {
  return gaboroneDate(iso).slice(0, 7) === totals.month;
}

function studentRow(lesson: Lesson, now: string, fields: Pick<Payment, "payerLabel" | "cardLabel" | "status">): Payment {
  const tutor = getTutorById(lesson.tutorId);
  return {
    id: paymentId(),
    date: now,
    description: `${subjectShort(lesson.curriculumId, lesson.subjectId)} · ${tutor?.fullName ?? "Tutor"}`,
    detail: `${formatBookingWhen(lesson.start)} · ${lesson.durationMin} min`,
    amount: lesson.price,
    receiptUrl: fields.status === "paid" ? "#" : undefined,
    lessonId: lesson.id,
    paymentRequestId: lesson.paymentRequestId,
    ...fields,
  };
}

function addParentPayment(parent: Parent, child: Student, lesson: Lesson, now: string) {
  const tutor = getTutorById(lesson.tutorId);
  const card = defaultCard(parent);
  (PARENT_PAYMENTS[parent.id] ??= []).unshift({
    id: paymentId(),
    date: now,
    description: `Lesson · ${subjectShort(lesson.curriculumId, lesson.subjectId)}`,
    detail: `${child.firstName} with ${tutor?.fullName ?? "tutor"}, ${formatDayMonth(lesson.start)} ${formatTime(lesson.start)}`,
    payerLabel: parent.firstName,
    cardLabel: card ? cardShort(card) : "",
    status: "paid",
    amount: lesson.price,
    receiptUrl: "#",
    lessonId: lesson.id,
  });
  const totals = PARENT_MONTH_TOTALS[parent.id];
  if (totals && inMonth(totals, now)) {
    totals.lessonsCount += 1;
    totals.lessonsAmount += lesson.price;
  }
}

/** A lesson paid at checkout, by the student's own card or by the parent. */
export function recordLessonPaid(lesson: Lesson, now: string): void {
  const student = getStudentById(lesson.studentId);
  if (!student) return;
  const studentTotals = STUDENT_MONTH_TOTALS[student.id];
  const rows = (STUDENT_PAYMENTS[student.id] ??= []);

  if (lesson.payer === "student") {
    const label = student.card ? cardShort(student.card) : "card";
    rows.unshift(studentRow(lesson, now, { payerLabel: `You · ${label}`, cardLabel: label, status: "paid" }));
    if (studentTotals && inMonth(studentTotals, now)) studentTotals.paidByStudent += lesson.price;
    return;
  }

  const parent = student.linkedParentId ? getParentById(student.linkedParentId) : undefined;
  if (!parent) return;
  const card = defaultCard(parent);
  rows.unshift(studentRow(lesson, now, { payerLabel: parent.firstName, cardLabel: card ? cardShort(card) : "", status: "paid" }));
  if (studentTotals && inMonth(studentTotals, now)) studentTotals.paidByParent += lesson.price;
  addParentPayment(parent, student, lesson, now);
}

/** "Ask my parent to pay": a waiting row until the parent pays or declines. */
export function recordPaymentRequested(lesson: Lesson, now: string): void {
  const student = getStudentById(lesson.studentId);
  const parent = student?.linkedParentId ? getParentById(student.linkedParentId) : undefined;
  if (!student || !parent) return;
  (STUDENT_PAYMENTS[student.id] ??= []).unshift(
    studentRow(lesson, now, { payerLabel: `${parent.firstName} (requested)`, cardLabel: "", status: "waiting" }),
  );
  const totals = STUDENT_MONTH_TOTALS[student.id];
  if (totals && inMonth(totals, now)) totals.waiting += lesson.price;
}

function waitingRow(lesson: Lesson) {
  const rows = STUDENT_PAYMENTS[lesson.studentId] ?? [];
  return rows.find((row) => row.status === "waiting" && (row.lessonId === lesson.id || row.paymentRequestId === lesson.paymentRequestId));
}

export function recordRequestPaid(lesson: Lesson, now: string): void {
  const student = getStudentById(lesson.studentId);
  const parent = student?.linkedParentId ? getParentById(student.linkedParentId) : undefined;
  if (!student || !parent) return;
  const card = defaultCard(parent);
  const row = waitingRow(lesson);
  const totals = STUDENT_MONTH_TOTALS[student.id];
  if (row) {
    if (totals && inMonth(totals, row.date)) totals.waiting -= row.amount ?? 0;
    Object.assign(row, { payerLabel: parent.firstName, cardLabel: card ? cardShort(card) : "", status: "paid", receiptUrl: "#" });
  }
  if (totals && inMonth(totals, now)) totals.paidByParent += lesson.price;
  addParentPayment(parent, student, lesson, now);
}

export function recordRequestDeclined(lesson: Lesson): void {
  const rows = STUDENT_PAYMENTS[lesson.studentId];
  const row = waitingRow(lesson);
  if (!rows || !row) return;
  const totals = STUDENT_MONTH_TOTALS[lesson.studentId];
  if (totals && inMonth(totals, row.date)) totals.waiting -= row.amount ?? 0;
  rows.splice(rows.indexOf(row), 1);
}
