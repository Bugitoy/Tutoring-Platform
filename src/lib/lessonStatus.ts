import type { StatusTone } from "@/components/shared/StatusPill";
import type { ChipStyle } from "./calendar";
import { getCurriculum } from "./curricula";
import { formatCountdown } from "./format";
import { subjectName } from "./matching";
import type { Lesson, Report } from "./types";

export type Viewer = "student" | "parent" | "tutor";

export type StatusKey = "awaiting_payment" | "booked" | "soon" | "live" | "done" | "missed" | "cancelled";

export type LessonAction = { label: string; href: string };

export type LessonStatusView = {
  key: StatusKey;
  label: string;
  tone: StatusTone;
  chip: ChipStyle;
  action?: LessonAction;
};

type StatusContext = {
  now: string;
  /** Who pays when a student asks a parent, e.g. "Masego". */
  parentName?: string;
  /** `?child=` key used for parent links, e.g. "neo". */
  childKey?: string;
};

const SOON_MINUTES = 120;

export function lessonStatusKey(lesson: Lesson, now: string): StatusKey {
  switch (lesson.status) {
    case "awaiting_payment":
      return "awaiting_payment";
    case "live":
      return "live";
    case "completed":
      return "done";
    case "missed":
      return "missed";
    case "cancelled":
      return "cancelled";
    case "booked": {
      const minutes = (new Date(lesson.start).getTime() - new Date(now).getTime()) / 60000;
      return minutes > -lesson.durationMin && minutes <= SOON_MINUTES ? "soon" : "booked";
    }
  }
}

const CHIP: Record<StatusKey, ChipStyle> = {
  awaiting_payment: "pending",
  booked: "subject",
  soon: "subject",
  live: "subject",
  done: "done",
  missed: "missed",
  cancelled: "missed",
};

function countdownLabel(lesson: Lesson, now: string) {
  return new Date(lesson.start).getTime() > new Date(now).getTime()
    ? formatCountdown(lesson.start, now).pill
    : "Starting now";
}

/** Tutors get a rounded countdown: "Starts in 2 h", "Starts in 25 min". */
function tutorCountdownLabel(lesson: Lesson, now: string) {
  const minutes = Math.round((new Date(lesson.start).getTime() - new Date(now).getTime()) / 60000);
  if (minutes <= 0) return "Starting now";
  return minutes >= 60 ? `Starts in ${Math.round(minutes / 60)} h` : `Starts in ${minutes} min`;
}

export function rebookHref(lesson: Lesson): string {
  const curriculum = getCurriculum(lesson.curriculumId);
  const params = new URLSearchParams();
  if (curriculum) {
    params.set("level", curriculum.level);
    params.set("system", curriculum.system);
  }
  params.set("curriculum", lesson.curriculumId);
  params.set("subject", lesson.subjectId);
  params.set("verified", "1");
  return `/student/tutors?${params.toString()}`;
}

function studentView(lesson: Lesson, key: StatusKey, ctx: StatusContext): Omit<LessonStatusView, "key" | "chip"> {
  switch (key) {
    case "awaiting_payment":
      return {
        label: `Waiting for ${ctx.parentName ?? "your parent"} to pay`,
        tone: "warning",
        action: { label: "View payment", href: "/student/payments" },
      };
    case "booked":
      return { label: "Booked · paid", tone: "info", action: { label: "Message tutor", href: "/student/messages" } };
    case "soon":
      return { label: countdownLabel(lesson, ctx.now), tone: "info", action: { label: "Join", href: `/lesson/${lesson.id}` } };
    case "live":
      return { label: "Live now", tone: "live", action: { label: "Join", href: `/lesson/${lesson.id}` } };
    case "done":
      return { label: "Done", tone: "success", action: { label: "View summary", href: `/student/lessons/${lesson.id}` } };
    case "missed":
      return { label: "Missed", tone: "danger", action: { label: "Rebook", href: rebookHref(lesson) } };
    case "cancelled":
      return { label: "Cancelled", tone: "neutral" };
  }
}

function parentView(lesson: Lesson, key: StatusKey, ctx: StatusContext): Omit<LessonStatusView, "key" | "chip"> {
  const message = { label: "Message tutor", href: "/parent/messages" };
  switch (key) {
    case "awaiting_payment":
      return {
        label: "Needs your payment",
        tone: "warning",
        action: lesson.paymentRequestId
          ? { label: "Review and pay", href: `/parent/tutors/${lesson.tutorId}/book?request=${lesson.paymentRequestId}` }
          : undefined,
      };
    case "booked":
    case "soon":
      return { label: "Booked", tone: "info", action: message };
    case "live":
      return { label: "Live now", tone: "live", action: message };
    case "done": {
      const child = ctx.childKey ? `?child=${ctx.childKey}` : "";
      return {
        label: "Attended",
        tone: "success",
        action: { label: "Read report", href: `/parent/reports${child}#report-${lesson.id}` },
      };
    }
    case "missed":
      return { label: "Missed", tone: "danger", action: message };
    case "cancelled":
      return {
        label: lesson.refunded ? "Cancelled · refunded" : "Cancelled",
        tone: "neutral",
        action: { label: "Payments", href: "/parent/payments" },
      };
  }
}

function tutorView(lesson: Lesson, key: StatusKey, ctx: StatusContext): Omit<LessonStatusView, "key" | "chip"> {
  switch (key) {
    case "awaiting_payment":
      return { label: "Waiting for payment", tone: "warning" };
    case "booked":
      return { label: "Confirmed", tone: "neutral" };
    case "soon":
      return { label: tutorCountdownLabel(lesson, ctx.now), tone: "info" };
    case "live":
      return { label: "Live now · Rejoin", tone: "live", action: { label: "Rejoin", href: `/lesson/${lesson.id}?as=tutor` } };
    case "done":
      return lesson.reportStatus === "report_sent"
        ? { label: "Report sent", tone: "success" }
        : { label: "Report due", tone: "warning" };
    case "missed":
      return { label: "Absent", tone: "danger" };
    case "cancelled":
      return { label: "Cancelled", tone: "neutral" };
  }
}

/** One mapping from lesson status to pill, chip and action for every screen (section 8.2). */
export function lessonStatusView(lesson: Lesson, viewer: Viewer, ctx: StatusContext): LessonStatusView {
  const key = lessonStatusKey(lesson, ctx.now);
  const view =
    viewer === "student" ? studentView(lesson, key, ctx) : viewer === "parent" ? parentView(lesson, key, ctx) : tutorView(lesson, key, ctx);
  return { key, chip: CHIP[key], ...view };
}

/** "you paid", "Neo paid", "refunded" or "Neo asked you to pay" (Parent · Calendar). */
export function parentPayerNote(lesson: Lesson, childName: string): string {
  if (lesson.refunded) return "refunded";
  if (lesson.status === "awaiting_payment") return `${childName} asked you to pay`;
  return lesson.payer === "student" ? `${childName} paid` : "you paid";
}

export function attendanceView(report: Report, style: "long" | "short"): { label: string; tone: StatusTone } {
  if (report.attendance === "late") return { label: `Late · ${report.lateMinutes ?? 0} min`, tone: "warning" };
  if (report.attendance === "absent") return { label: "Absent", tone: "danger" };
  return { label: style === "long" ? "Attended on time" : "On time", tone: "success" };
}

const SHORT_SUBJECTS: Record<string, string> = { mathematics: "Maths" };

/** "Maths", "Physics" */
export function subjectShort(curriculumId: string, subjectId: string): string {
  return SHORT_SUBJECTS[subjectId] ?? subjectName(curriculumId, subjectId) ?? subjectId;
}

/** "BGCSE Maths" */
export function courseLabel(curriculumId: string, subjectId: string): string {
  const curriculum = getCurriculum(curriculumId)?.name ?? curriculumId;
  return `${curriculum} ${subjectShort(curriculumId, subjectId)}`;
}
