import type { Payment, SavedCard } from "@/lib/types";
import { IDS, cat, pula } from "./ids";

/** Payment history per student, newest first. Booking and payment-request changes add and update rows. */
export const STUDENT_PAYMENTS: Record<string, Payment[]> = {
  [IDS.neo]: [
    {
      id: "pay-neo-nov-01",
      date: cat("2026-10-22", "12:31"),
      description: "Physics · Thato Sebego",
      detail: "Sun 1 Nov, 10:00 · 60 min",
      payerLabel: "Masego (requested)",
      cardLabel: "",
      status: "waiting",
      amount: pula(90),
      lessonId: "lesson-neo-nov-01",
      paymentRequestId: "preq-neo-nov-01",
    },
    {
      id: "pay-neo-oct-22-pm",
      date: cat("2026-10-22", "09:12"),
      description: "Maths · Ms. Kagiso Molefe",
      detail: "Thu 22 Oct, 17:00 · 60 min",
      payerLabel: "Masego",
      cardLabel: "Visa 4821",
      status: "paid",
      amount: pula(150),
      receiptUrl: "#",
      lessonId: "lesson-neo-oct-22-pm",
    },
    {
      id: "pay-neo-oct-22-am",
      date: cat("2026-10-20", "18:40"),
      description: "Maths · Ms. Kagiso Molefe",
      detail: "Thu 22 Oct, 15:00 · 60 min",
      payerLabel: "Masego",
      cardLabel: "Visa 4821",
      status: "paid",
      amount: pula(150),
      receiptUrl: "#",
      lessonId: "lesson-neo-oct-22-am",
    },
    {
      id: "pay-neo-oct-11",
      date: cat("2026-10-09", "16:02"),
      description: "Physics · Thato Sebego",
      detail: "Sun 11 Oct, 10:00 · 60 min",
      payerLabel: "You · Visa 7310",
      cardLabel: "Visa 7310",
      status: "paid",
      amount: pula(90),
      receiptUrl: "#",
      lessonId: "lesson-neo-oct-11",
    },
  ],
};

export const PARENT_PAYMENTS: Record<string, Payment[]> = {
  [IDS.masego]: [
    {
      id: "pay-parent-oct-22",
      date: cat("2026-10-22", "09:12"),
      description: "Lesson · Maths",
      detail: "Neo with Ms. Kagiso Molefe, 22 Oct 17:00",
      payerLabel: "Masego",
      cardLabel: "Visa 4821",
      status: "paid",
      amount: pula(150),
      receiptUrl: "#",
      lessonId: "lesson-neo-oct-22-pm",
    },
    {
      id: "pay-parent-oct-20",
      date: cat("2026-10-20", "18:40"),
      description: "Lesson · Maths",
      detail: "Neo with Ms. Kagiso Molefe, 22 Oct 15:00",
      payerLabel: "Masego",
      cardLabel: "Visa 4821",
      status: "paid",
      amount: pula(150),
      receiptUrl: "#",
      lessonId: "lesson-neo-oct-22-am",
    },
    {
      id: "pay-parent-oct-18",
      date: cat("2026-10-18", "11:20"),
      description: "Lesson · Physics",
      detail: "Neo with Thato Sebego, 25 Oct 10:00",
      payerLabel: "Masego",
      cardLabel: "Visa 4821",
      status: "paid",
      amount: pula(90),
      receiptUrl: "#",
      lessonId: "lesson-neo-oct-25",
    },
    {
      id: "pay-parent-oct-15",
      date: cat("2026-10-15", "10:00"),
      description: "Lesson · Maths",
      detail: "Lesego with Gofaone Nkwe, cancelled 24 h before",
      payerLabel: "Masego",
      cardLabel: "MC 0937",
      status: "refunded",
      amount: pula(80),
      receiptUrl: "#",
      lessonId: "lesson-lesego-oct-16",
    },
    {
      id: "pay-parent-plus-oct",
      date: cat("2026-10-01", "08:00"),
      description: "Thanodi Plus",
      detail: "Monthly subscription",
      payerLabel: "Masego",
      cardLabel: "Visa 4821",
      status: "paid",
      amount: null,
      receiptUrl: "#",
    },
  ],
};

/** "October so far". Includes lessons paid before the rows shown in the history. */
export const STUDENT_MONTH_TOTALS: Record<string, { month: string; paidByStudent: number; paidByParent: number; waiting: number }> = {
  [IDS.neo]: { month: "2026-10", paidByStudent: pula(90), paidByParent: pula(1605), waiting: pula(90) },
};

export const PARENT_MONTH_TOTALS: Record<string, { month: string; lessonsCount: number; lessonsAmount: number }> = {
  [IDS.masego]: { month: "2026-10", lessonsCount: 11, lessonsAmount: pula(1605) },
};

/** Cards a student added on Payments besides the one on their profile. */
export const STUDENT_EXTRA_CARDS: Record<string, SavedCard[]> = {};

/** Ms. Molefe’s weekly earnings after Thanodi’s fee; weeks start on Monday. */
export const EARNINGS_WEEKS = [
  { weekStart: "2026-08-31", label: "31 Aug", amount: pula(450) },
  { weekStart: "2026-09-07", label: "7 Sep", amount: pula(520) },
  { weekStart: "2026-09-14", label: "14 Sep", amount: pula(610) },
  { weekStart: "2026-09-21", label: "21 Sep", amount: pula(580) },
  { weekStart: "2026-09-28", label: "28 Sep", amount: pula(760) },
  { weekStart: "2026-10-05", label: "5 Oct", amount: pula(840) },
  { weekStart: "2026-10-12", label: "12 Oct", amount: pula(990) },
  { weekStart: "2026-10-19", label: "19 Oct", amount: pula(1150) },
];
