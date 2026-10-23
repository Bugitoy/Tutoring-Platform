import type { StatusTone } from "@/components/shared/StatusPill";
import { getTutorUpcoming } from "@/lib/data/lessons";
import { courseLabel } from "@/lib/lessonStatus";
import { formatWeekday } from "@/lib/format";
import { LESSONS } from "@/lib/mock/lessons";
import { REPORTS, TOPICS } from "@/lib/mock/reports";
import { BOOKING_SETTINGS, TUTOR_STATS, TUTOR_STUDENTS } from "@/lib/mock/tutorWorkspace";
import { getParentById, getStudentById } from "@/lib/mock/users";
import type { BookingSettings, Parent, Report, Student, TopicProgress, TutorStats } from "@/lib/types";

const DEFAULT_SETTINGS: BookingSettings = { lessonLength: 60, breakMin: 15, bookAhead: "2w", repeatWeekly: false };

export async function getTutorStats(tutorId: string): Promise<TutorStats> {
  return TUTOR_STATS[tutorId] ?? { activeStudents: 0, newThisWeek: 0 };
}

export async function getBookingSettings(tutorId: string): Promise<BookingSettings> {
  return BOOKING_SETTINGS[tutorId] ?? DEFAULT_SETTINGS;
}

export async function saveBookingSettings(tutorId: string, settings: BookingSettings): Promise<BookingSettings> {
  BOOKING_SETTINGS[tutorId] = settings;
  return settings;
}

export type HomeworkPill = { label: string; tone: StatusTone };

export type RosterStudent = {
  student: Student;
  parent?: Parent;
  /** "BGCSE Maths" */
  course: string;
  lessonsTogether: number;
  nextLessonStart?: string;
  homework: HomeworkPill;
  /** "Pass BGCSE Maths with a B or better" */
  goal?: string;
  topics: TopicProgress[];
  privateNote: string;
};

function homeworkPill(report: Report | undefined): HomeworkPill {
  const homework = report?.homework;
  if (!homework) return { label: "None set", tone: "neutral" };
  if (homework.done) return { label: "Handed in", tone: "success" };
  return { label: homework.due ? `Due ${formatWeekday(homework.due)}` : "Not handed in", tone: "warning" };
}

function goalLine(student: Student, curriculumId: string, subjectId: string): string | undefined {
  const goal = student.learningProfile.goals.find((item) => item.subjectId === subjectId);
  if (!goal) return undefined;
  const article = /^[AEF]/.test(goal.targetGrade) ? "an" : "a";
  return `Pass ${courseLabel(curriculumId, subjectId)} with ${article} ${goal.targetGrade} or better`;
}

/** Everyone on Tutor · Students, in roster order. */
export async function getTutorRoster(tutorId: string, now: string): Promise<RosterStudent[]> {
  const upcoming = await getTutorUpcoming(tutorId, now);

  return TUTOR_STUDENTS.filter((entry) => entry.tutorId === tutorId).flatMap((entry) => {
    const student = getStudentById(entry.studentId);
    if (!student) return [];
    const lessons = LESSONS.filter((lesson) => lesson.tutorId === tutorId && lesson.studentId === student.id).sort((a, b) =>
      b.start.localeCompare(a.start),
    );
    const subject = lessons[0] ?? {
      curriculumId: student.learningProfile.curriculumId,
      subjectId: student.learningProfile.subjectIds[0] ?? "mathematics",
    };
    const latestReport = lessons
      .map((lesson) => REPORTS.find((report) => report.lessonId === lesson.id))
      .find((report): report is Report => Boolean(report));

    return [
      {
        student,
        parent: student.linkedParentId ? getParentById(student.linkedParentId) : undefined,
        course: courseLabel(subject.curriculumId, subject.subjectId),
        lessonsTogether: entry.lessonsTogether,
        nextLessonStart: upcoming.find((lesson) => lesson.studentId === student.id)?.start,
        homework: homeworkPill(latestReport),
        goal: goalLine(student, subject.curriculumId, subject.subjectId),
        topics: TOPICS[student.id] ?? [],
        privateNote: entry.privateNote,
      },
    ];
  });
}

/** From the tutor's roster when there is one, otherwise the completed lessons on record. */
export async function getLessonsTogether(tutorId: string, studentId: string): Promise<number> {
  const entry = TUTOR_STUDENTS.find((item) => item.tutorId === tutorId && item.studentId === studentId);
  if (entry) return entry.lessonsTogether;
  return LESSONS.filter(
    (lesson) => lesson.tutorId === tutorId && lesson.studentId === studentId && lesson.status === "completed",
  ).length;
}

export async function saveStudentNote(tutorId: string, studentId: string, note: string): Promise<void> {
  const entry = TUTOR_STUDENTS.find((item) => item.tutorId === tutorId && item.studentId === studentId);
  if (!entry) throw new Error("We couldn’t find that student.");
  entry.privateNote = note.slice(0, 2000);
}
