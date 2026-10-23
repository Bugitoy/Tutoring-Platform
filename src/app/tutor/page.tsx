import { Suspense } from "react";
import Link from "next/link";
import { Sparkles, Video } from "lucide-react";
import { EmptyState } from "@/components/shared/EmptyState";
import { SectionCard } from "@/components/shared/SectionCard";
import { StatCard } from "@/components/shared/StatCard";
import { StatusPill } from "@/components/shared/StatusPill";
import { PageHeader } from "@/components/shell/PageHeader";
import { AfterClassReportForm } from "@/components/tutor/AfterClassReportForm";
import { buttonVariants } from "@/components/ui/button";
import { nowIso } from "@/lib/clock";
import { getTutorEarnings } from "@/lib/data/earnings";
import { getReportsDue, getTutorDay, getTutorUpcoming, getTutorWeek } from "@/lib/data/lessons";
import { getDemoSession, listStudents } from "@/lib/data/profiles";
import { getReportDraft } from "@/lib/data/reports";
import { getTutorStats } from "@/lib/data/tutorWorkspace";
import { formatDayHeading, formatMoney, formatTime, gaboroneDate } from "@/lib/format";
import { courseLabel, lessonStatusView } from "@/lib/lessonStatus";
import { lessonsOnGrid, weekStartOf } from "@/lib/tutorWeek";
import { cn } from "cn";

async function TutorToday({ searchParams }: { searchParams: Promise<{ report?: string }> }) {
  const { report } = await searchParams;
  const now = nowIso();
  const today = gaboroneDate(now);
  const { tutor } = await getDemoSession();
  const [lessons, due, upcoming, earnings, stats, week, students] = await Promise.all([
    getTutorDay(tutor.id, today),
    getReportsDue(tutor.id),
    getTutorUpcoming(tutor.id, now),
    getTutorEarnings(tutor.id),
    getTutorStats(tutor.id),
    getTutorWeek(tutor.id, weekStartOf(today)),
    listStudents(),
  ]);
  const studentOf = (id: string) => students.find((student) => student.id === id);

  const next = upcoming[0];
  const nextStudent = next ? studentOf(next.studentId) : undefined;
  const thisWeek = lessonsOnGrid(week.lessons);
  const stillToTeach = thisWeek.filter((lesson) => upcoming.some((item) => item.id === lesson.id)).length;

  const reportLesson = due.find((lesson) => lesson.id === report) ?? due[0];
  const reportStudent = reportLesson ? studentOf(reportLesson.studentId) : undefined;
  const draft = reportLesson ? await getReportDraft(reportLesson.id) : undefined;

  return (
    <>
      <PageHeader
        eyebrow={formatDayHeading(now)}
        eyebrowStyle="plain"
        title={`Dumela, ${tutor.firstName}`}
        actions={
          next ? (
            <Link href={`/lesson/${next.id}?as=tutor`} className={buttonVariants({ size: "lg" })}>
              <Video aria-hidden="true" />
              Start next lesson · {formatTime(next.start)}
            </Link>
          ) : null
        }
      />

      <div className="flex flex-col gap-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Earned this month"
            value={formatMoney(earnings.monthTotal)}
            subline={<span className="text-status-success-fg">Paid out every Friday</span>}
          />
          <StatCard label="Lessons this week" value={thisWeek.length} subline={`${stillToTeach} still to teach`} />
          <StatCard label="Active students" value={stats.activeStudents} subline={`${stats.newThisWeek} new this week`} />
          <StatCard
            label="Reports to write"
            value={<span className={cn(due.length > 0 && "text-status-warning-fg")}>{due.length}</span>}
            subline="Parents see them after class"
          />
        </div>

        <div className="grid items-start gap-6 lg:grid-cols-2 xl:grid-cols-[minmax(0,5fr)_minmax(0,4fr)]">
          <SectionCard title="Today’s lessons">
            {lessons.length === 0 ? (
              <EmptyState title="No lessons today" description="Open more hours on your calendar so students can book you." />
            ) : (
              <ul className="divide-y divide-border">
                {lessons.map((lesson) => {
                  const status = lessonStatusView(lesson, "tutor", { now });
                  return (
                    <li key={lesson.id} className="flex items-center gap-4 py-3.5 first:pt-0 last:pb-0">
                      <span className="w-14 shrink-0 text-[15px] font-bold text-foreground">{formatTime(lesson.start)}</span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold text-foreground">
                          {studentOf(lesson.studentId)?.fullName ?? "Student"}
                        </span>
                        <span className="block text-xs text-muted-foreground">
                          {courseLabel(lesson.curriculumId, lesson.subjectId)} · {lesson.title}
                        </span>
                      </span>
                      {status.action ? (
                        <Link href={status.action.href} className="shrink-0">
                          <StatusPill tone={status.tone}>{status.label}</StatusPill>
                        </Link>
                      ) : (
                        <StatusPill tone={status.tone} className="shrink-0">
                          {status.label}
                        </StatusPill>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </SectionCard>

          {reportLesson && draft ? (
            <section
              id="after-class-report"
              className="scroll-mt-20 rounded-xl border-2 border-highlight-border bg-card p-5 md:p-6"
            >
              <AfterClassReportForm
                key={reportLesson.id}
                lessonId={reportLesson.id}
                subtitle={`Lesson with ${reportStudent?.fullName ?? "your student"} · ${formatTime(reportLesson.start)} · ${reportLesson.title}`}
                draft={{
                  attendance: draft.attendance ?? "on_time",
                  comment: draft.comment ?? "",
                  homework: draft.homework?.text ?? "",
                  homeworkDue: draft.homework?.due ? gaboroneDate(draft.homework.due) : "",
                  takeaways: draft.takeaways ?? [],
                  aiDrafted: Boolean(draft.aiDrafted),
                  attachment: draft.files?.find((file) => file.kind === "pdf")?.name,
                }}
              />
            </section>
          ) : (
            <SectionCard title="After-class report">
              <EmptyState
                title="All reports sent"
                description="Parents and students can read every report from today’s lessons."
              />
            </SectionCard>
          )}
        </div>

        <aside className="flex flex-col gap-3 rounded-xl bg-accent p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-3">
            <Sparkles aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-primary" />
            <div>
              <h2 className="text-[15px] font-bold text-foreground">Teaching tip</h2>
              <p className="mt-0.5 text-sm text-text-secondary">
                Students who solve one problem on the whiteboard themselves in the first 10 minutes stay more engaged.
                {nextStudent ? ` Try handing ${nextStudent.firstName} the pen early.` : ""}
              </p>
            </div>
          </div>
          <Link href="/tutor/resources" className="shrink-0 text-sm font-semibold text-primary underline underline-offset-2">
            More tips
          </Link>
        </aside>
      </div>
    </>
  );
}

export default function TutorTodayPage({ searchParams }: { searchParams: Promise<{ report?: string }> }) {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col gap-6" aria-busy="true" aria-label="Loading">
          <div className="h-16 rounded-xl bg-divider-soft" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[0, 1, 2, 3].map((item) => (
              <div key={item} className="h-28 rounded-xl bg-divider-soft" />
            ))}
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="h-80 rounded-xl bg-divider-soft" />
            <div className="h-96 rounded-xl bg-divider-soft" />
          </div>
        </div>
      }
    >
      <TutorToday searchParams={searchParams} />
    </Suspense>
  );
}
