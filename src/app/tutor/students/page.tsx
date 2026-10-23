import { Suspense } from "react";
import { io } from "next/cache";
import { StudentsWorkspace, type StudentRow } from "@/components/tutor/StudentsWorkspace";
import { nowIso } from "@/lib/clock";
import { getDemoSession } from "@/lib/data/profiles";
import { getReportsForTutorStudent } from "@/lib/data/reports";
import { getTutorRoster, getTutorStats } from "@/lib/data/tutorWorkspace";
import { formatBookingWhen, formatNextFree, formatWeekday } from "@/lib/format";
import { attendanceView, courseLabel } from "@/lib/lessonStatus";
import type { Report } from "@/lib/types";

function homeworkLine(report: Report): string | undefined {
  const homework = report.homework;
  if (!homework) return undefined;
  if (homework.done) return `${homework.text} · handed in`;
  return homework.due ? `${homework.text} · due ${formatWeekday(homework.due)}` : homework.text;
}

async function TutorStudents() {
  await io();
  const now = nowIso();
  const { tutor } = await getDemoSession();
  const [roster, stats] = await Promise.all([getTutorRoster(tutor.id, now), getTutorStats(tutor.id)]);

  const rows: StudentRow[] = await Promise.all(
    roster.map(async (entry) => {
      const reports = await getReportsForTutorStudent(tutor.id, entry.student.id);
      return {
        id: entry.student.id,
        name: entry.student.fullName,
        initials: entry.student.initials,
        parentName: entry.parent?.fullName,
        course: entry.course,
        lessonsTogether: entry.lessonsTogether,
        nextLesson: entry.nextLessonStart ? formatNextFree(entry.nextLessonStart, now) : undefined,
        homework: entry.homework,
        summary: [entry.student.learningProfile.year, entry.course, entry.parent ? `parent ${entry.parent.fullName}` : null]
          .filter(Boolean)
          .join(" · "),
        goal: entry.goal,
        topics: entry.topics,
        privateNote: entry.privateNote,
        reports: reports.map(({ report, lesson }) => ({
          lessonId: lesson.id,
          heading: `${courseLabel(lesson.curriculumId, lesson.subjectId)} · ${lesson.title}`,
          when: `${formatBookingWhen(lesson.start)} · ${lesson.durationMin} min`,
          attendance: attendanceView(report, "short"),
          comment: report.comment,
          homework: homeworkLine(report),
        })),
      };
    }),
  );

  return (
    <StudentsWorkspace
      subtitle={`${stats.activeStudents} active students · ${stats.newThisWeek} new this week`}
      rows={rows}
    />
  );
}

export default function TutorStudentsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col gap-6" aria-busy="true" aria-label="Loading">
          <div className="h-16 rounded-xl bg-divider-soft" />
          <div className="grid gap-6 xl:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
            <div className="h-96 rounded-xl bg-divider-soft" />
            <div className="h-[28rem] rounded-xl bg-divider-soft" />
          </div>
        </div>
      }
    >
      <TutorStudents />
    </Suspense>
  );
}
