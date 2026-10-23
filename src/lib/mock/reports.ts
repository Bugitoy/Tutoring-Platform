import type { Report, ReportDraft, TermProgress, TopicProgress, WhiteboardPage } from "@/lib/types";
import { IDS, cat } from "./ids";

/** Today’s 15:00 lesson is waiting for Ms. Molefe’s report; this is what her form starts with. */
export const REPORT_DRAFTS: Record<string, ReportDraft> = {
  "lesson-neo-oct-22-am": {
    attendance: "on_time",
    comment:
      "Neo can now factorise simple quadratics on his own. He still mixes up signs when the constant is negative, so we’ll practise that next time.",
    homework: {
      text: "Past paper 2023, Paper 1, questions 4–7",
      due: cat("2026-10-24", "17:00"),
      done: false,
      minutes: 30,
    },
    files: [{ id: "file-wb-quad", name: "Whiteboard_Quadratics.pdf", kind: "pdf", sizeKb: 420 }],
    takeaways: [
      "To solve a factorised quadratic, set each bracket to zero and solve it.",
      "(x + 2) = 0 gives x = −2. Don’t just read the number off the bracket.",
      "Always check a root by putting it back into the original equation.",
    ],
    aiDrafted: true,
    agenda: [
      { time: "15:00", title: "Warm-up", detail: "Two simultaneous equations from last week" },
      { time: "15:10", title: "Factorising x² − 5x + 6", detail: "Finding two numbers that multiply to 6 and add to −5" },
      { time: "15:30", title: "Reading the roots from the graph", detail: "Where the parabola crosses the x-axis" },
      { time: "15:45", title: "Negative constants", detail: "x² − 2x − 8 and why the root is −2, not 2" },
      { time: "15:55", title: "Homework set", detail: "Past paper 2023, Paper 1, questions 4–7" },
    ],
  },
};

/** Sent reports only. */
export const REPORTS: Report[] = [
  {
    id: "report-neo-oct-20",
    lessonId: "lesson-neo-oct-20",
    attendance: "on_time",
    comment:
      "Good effort. Neo followed the method well but needs more practice with fractions inside the bracket.",
    homework: {
      text: "Worksheet 6, questions 1–10",
      due: cat("2026-10-22", "15:00"),
      done: true,
      minutes: 25,
    },
    files: [{ id: "file-wb-square", name: "Whiteboard_Completing_Square.pdf", kind: "pdf", sizeKb: 310 }],
    takeaways: ["Completing the square turns x² + bx into a perfect square plus a constant."],
    aiDrafted: false,
    tutorApproved: true,
    sentAt: cat("2026-10-20", "18:10"),
  },
  {
    id: "report-neo-oct-18",
    lessonId: "lesson-neo-oct-18",
    attendance: "late",
    lateMinutes: 10,
    comment:
      "Neo joined late because of a connection problem, so we switched to data saver. He understood the speed triangle quickly.",
    homework: { text: "5 practice questions", done: true, minutes: 20 },
    files: [{ id: "file-wb-motion", name: "Whiteboard_Motion.pdf", kind: "pdf", sizeKb: 280 }],
    sentAt: cat("2026-10-18", "11:05"),
  },
  {
    id: "report-lesego-oct-21",
    lessonId: "lesson-lesego-oct-21",
    attendance: "on_time",
    comment: "Lesego lined up the decimal points every time today. Next we’ll use decimals in money problems.",
    homework: { text: "Decimals worksheet, page 2", due: cat("2026-10-27", "16:00"), done: false, minutes: 20 },
    files: [{ id: "file-wb-decimals", name: "Whiteboard_Decimals.pdf", kind: "pdf", sizeKb: 190 }],
    sentAt: cat("2026-10-21", "17:10"),
  },
  {
    id: "report-lesego-oct-14",
    lessonId: "lesson-lesego-oct-14",
    attendance: "on_time",
    comment: "Lesego can now add fractions with the same denominator. Different denominators still need practice.",
    homework: { text: "Fractions worksheet, questions 1–8", done: true, minutes: 20 },
    files: [{ id: "file-wb-fractions", name: "Whiteboard_Fractions.pdf", kind: "pdf", sizeKb: 210 }],
    sentAt: cat("2026-10-14", "17:05"),
  },
  {
    id: "report-lesego-oct-07",
    lessonId: "lesson-lesego-oct-07",
    attendance: "on_time",
    comment: "A confident start. Lesego reads and writes numbers up to a million without mistakes.",
    homework: { text: "Place value cards", done: true, minutes: 15 },
    files: [{ id: "file-wb-place", name: "Whiteboard_Place_Value.pdf", kind: "pdf", sizeKb: 160 }],
    sentAt: cat("2026-10-07", "17:05"),
  },
  {
    id: "report-amantle-oct-22",
    lessonId: "lesson-amantle-oct-22",
    attendance: "on_time",
    comment: "Amantle is confident with elimination. Next: substitution with fractions.",
    homework: { text: "IGCSE worksheet 4", done: true },
    files: [],
    sentAt: cat("2026-10-22", "11:02"),
  },
  {
    id: "report-lesego-d-oct-21",
    lessonId: "lesson-lesego-d-oct-21",
    attendance: "on_time",
    comment: "Lesego simplified every fraction we tried today. Next time we’ll move on to mixed numbers.",
    files: [],
    sentAt: cat("2026-10-21", "18:00"),
  },
  {
    id: "report-kabelo-oct-20",
    lessonId: "lesson-kabelo-oct-20",
    attendance: "on_time",
    comment: "Kabelo labels the sides of a right-angled triangle correctly now. SOH CAH TOA is starting to stick.",
    homework: { text: "Exercise 7B, questions 1–6", done: true, minutes: 25 },
    files: [],
    sentAt: cat("2026-10-20", "16:10"),
  },
  {
    id: "report-tumi-oct-17",
    lessonId: "lesson-tumi-oct-17",
    attendance: "on_time",
    comment: "Tumi can plot straight-line graphs from a table. Finding the gradient from two points needs more practice.",
    homework: { text: "Gradient worksheet, questions 1–12", due: cat("2026-10-26", "17:00"), done: false, minutes: 30 },
    files: [],
    sentAt: cat("2026-10-17", "15:10"),
  },
];

export const WHITEBOARD_PAGES: Record<string, WhiteboardPage[]> = {
  "lesson-neo-oct-22-am": [
    {
      caption: "Page 1 · Factorising",
      lines: [
        { text: "x² − 5x + 6 = 0", tone: "ink" },
        { text: "(x − 2)(x − 3) = 0", tone: "work" },
        { text: "x = 2 or 3", tone: "work" },
      ],
    },
    { caption: "Page 2 · The graph", lines: [], graph: true },
    {
      caption: "Page 3 · Negative signs",
      lines: [
        { text: "x² − 2x − 8 = 0", tone: "ink" },
        { text: "(x + 2)(x − 4) = 0", tone: "work" },
        { text: "x = −2 or 4", tone: "answer" },
      ],
    },
  ],
};

export const TERM_PROGRESS: Record<string, TermProgress> = {
  [IDS.neo]: {
    termLabel: "Term 3 · week 7",
    termStart: "2026-09-07",
    attended: 11,
    scheduled: 12,
    homeworkDone: 8,
    homeworkSet: 10,
    tutors: 2,
  },
  [IDS.lesego]: {
    termLabel: "Term 3 · week 7",
    termStart: "2026-09-07",
    attended: 10,
    scheduled: 10,
    homeworkDone: 7,
    homeworkSet: 8,
    tutors: 1,
  },
};

export const TOPICS: Record<string, TopicProgress[]> = {
  [IDS.neo]: [
    { topic: "Simultaneous equations", label: "Confident", percent: 90 },
    { topic: "Factorising quadratics", label: "Improving", percent: 65 },
    { topic: "Completing the square", label: "Started", percent: 35 },
    { topic: "Quadratic formula", label: "Not yet", percent: 5 },
  ],
  [IDS.lesego]: [
    { topic: "Place value", label: "Confident", percent: 90 },
    { topic: "Fractions", label: "Improving", percent: 65 },
    { topic: "Decimals", label: "Started", percent: 35 },
    { topic: "Measurement", label: "Not yet", percent: 5 },
  ],
};
