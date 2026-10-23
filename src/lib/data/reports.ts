import { LESSONS } from "@/lib/mock/lessons";
import { REPORT_DRAFTS, REPORTS, TERM_PROGRESS, TOPICS, WHITEBOARD_PAGES } from "@/lib/mock/reports";
import { getStudentById } from "@/lib/mock/users";
import type {
  Lesson,
  Report,
  ReportDraft,
  ReportInput,
  TermProgress,
  TopicProgress,
  WhiteboardPage,
} from "@/lib/types";

export type ReportWithLesson = { report: Report; lesson: Lesson };

export const MIN_COMMENT_LENGTH = 30;
export const MAX_TAKEAWAYS = 3;

function withLesson(report: Report): ReportWithLesson[] {
  const lesson = LESSONS.find((item) => item.id === report.lessonId);
  return lesson ? [{ report, lesson }] : [];
}

function newestFirst(a: ReportWithLesson, b: ReportWithLesson) {
  return b.lesson.start.localeCompare(a.lesson.start);
}

/** Reports for the parent's children, newest lesson first. */
export async function getReportsForParent(parentId: string, childId?: string): Promise<ReportWithLesson[]> {
  return REPORTS.flatMap(withLesson)
    .filter(({ lesson }) => {
      const student = getStudentById(lesson.studentId);
      if (!student || student.linkedParentId !== parentId) return false;
      return !childId || lesson.studentId === childId;
    })
    .sort(newestFirst);
}

/** Reports a tutor has sent about one student, newest first. */
export async function getReportsForTutorStudent(tutorId: string, studentId: string): Promise<ReportWithLesson[]> {
  return REPORTS.flatMap(withLesson)
    .filter(({ lesson }) => lesson.tutorId === tutorId && lesson.studentId === studentId)
    .sort(newestFirst);
}

export async function getReportForLesson(lessonId: string): Promise<Report | undefined> {
  return REPORTS.find((report) => report.lessonId === lessonId);
}

export async function getReportDraft(lessonId: string): Promise<ReportDraft> {
  return REPORT_DRAFTS[lessonId] ?? {};
}

export async function getWhiteboardPages(lessonId: string): Promise<WhiteboardPage[]> {
  return WHITEBOARD_PAGES[lessonId] ?? [];
}

export async function getTermProgress(studentId: string): Promise<TermProgress | undefined> {
  return TERM_PROGRESS[studentId];
}

export async function getTopics(studentId: string): Promise<TopicProgress[]> {
  return TOPICS[studentId] ?? [];
}

/** Checks the after-class form and turns it into a report. Throws a message the tutor can act on. */
export function buildReport(input: ReportInput, draft: ReportDraft, sentAt: string): Report {
  const comment = input.comment.trim();
  if (comment.length < MIN_COMMENT_LENGTH) {
    throw new Error(`Write at least ${MIN_COMMENT_LENGTH} characters for the parent.`);
  }
  if (input.attendance === "late" && !(input.lateMinutes && input.lateMinutes > 0)) {
    throw new Error("Enter how many minutes late the student was.");
  }
  const takeaways = input.takeaways.map((line) => line.trim()).filter(Boolean).slice(0, MAX_TAKEAWAYS);
  const homeworkText = input.homework?.text.trim();

  return {
    id: `report-${input.lessonId}`,
    lessonId: input.lessonId,
    attendance: input.attendance,
    lateMinutes: input.attendance === "late" ? input.lateMinutes : undefined,
    comment,
    homework: homeworkText
      ? {
          text: homeworkText,
          due: input.homework?.due,
          done: false,
          minutes: homeworkText === draft.homework?.text ? draft.homework?.minutes : undefined,
        }
      : undefined,
    files: draft.files ?? [],
    takeaways: takeaways.length > 0 ? takeaways : undefined,
    aiDrafted: Boolean(draft.aiDrafted && takeaways.length > 0),
    tutorApproved: takeaways.length > 0 && input.takeawaysChecked,
    agenda: draft.agenda,
    sentAt,
  };
}

export async function sendReport(input: ReportInput, tutorId: string, sentAt: string): Promise<{ report: Report; lesson: Lesson }> {
  const lesson = LESSONS.find((item) => item.id === input.lessonId);
  if (!lesson || lesson.tutorId !== tutorId) throw new Error("We couldn’t find that lesson.");
  if (lesson.reportStatus === "report_sent") throw new Error("This report has already been sent.");

  const report = buildReport(input, REPORT_DRAFTS[lesson.id] ?? {}, sentAt);
  REPORTS.push(report);
  delete REPORT_DRAFTS[lesson.id];
  lesson.reportStatus = "report_sent";
  if (report.attendance === "absent") lesson.status = "missed";
  return { report, lesson };
}

export async function markHomeworkDone(lessonId: string): Promise<void> {
  const report = REPORTS.find((item) => item.lessonId === lessonId);
  if (report?.homework) report.homework.done = true;
}
