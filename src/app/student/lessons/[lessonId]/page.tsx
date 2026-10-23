import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { HomeworkCard } from "@/components/lessons/HomeworkCard";
import { JoinLessonButton } from "@/components/lessons/JoinLessonButton";
import { RatingStars } from "@/components/lessons/RatingStars";
import { WhiteboardThumb } from "@/components/lessons/WhiteboardThumb";
import { EmptyState } from "@/components/shared/EmptyState";
import { NavyCard } from "@/components/shared/NavyCard";
import { SectionCard } from "@/components/shared/SectionCard";
import { StatusPill } from "@/components/shared/StatusPill";
import { PageHeader } from "@/components/shell/PageHeader";
import { buttonVariants } from "@/components/ui/button";
import { nowIso } from "@/lib/clock";
import { getLesson, getNextLesson } from "@/lib/data/lessons";
import { getDemoSession } from "@/lib/data/profiles";
import { getReportForLesson, getWhiteboardPages } from "@/lib/data/reports";
import { getTutor } from "@/lib/data/tutors";
import {
  formatDateShort,
  formatFileSize,
  formatLessonWhen,
  formatTimeRange,
  tutorShortName,
} from "@/lib/format";
import { attendanceView, courseLabel } from "@/lib/lessonStatus";

type Params = Promise<{ lessonId: string }>;

async function LessonSummary({ params }: { params: Params }) {
  const { lessonId } = await params;
  const now = nowIso();
  const { student } = await getDemoSession();
  const lesson = await getLesson(lessonId);
  if (!lesson || lesson.studentId !== student.id) notFound();

  const [report, tutor, next, pages] = await Promise.all([
    getReportForLesson(lesson.id),
    getTutor(lesson.tutorId),
    getNextLesson(student.id, now),
    getWhiteboardPages(lesson.id),
  ]);
  const tutorName = tutor?.fullName ?? "your tutor";
  const tutorShort = tutor ? tutorShortName(tutor.fullName) : "your tutor";
  const nextTutor = next && next.tutorId !== tutor?.id ? await getTutor(next.tutorId) : tutor;
  const meta = [
    `${formatDateShort(lesson.start)}, ${formatTimeRange(lesson.start, lesson.durationMin)}`,
    tutorName,
    courseLabel(lesson.curriculumId, lesson.subjectId),
    "video lesson",
  ].join(" · ");
  const attendance = report ? attendanceView(report, "long") : null;
  const showTakeaways = Boolean(report?.takeaways?.length) && (!report?.aiDrafted || report?.tutorApproved);
  const whiteboardFile = report?.files.find((file) => file.kind === "pdf");

  return (
    <>
      <PageHeader
        eyebrow="Lesson summary"
        title={lesson.title}
        subtitle={meta}
        backHref="/student/lessons"
        backLabel="Back to my lessons"
        actions={attendance ? <StatusPill tone={attendance.tone}>{attendance.label}</StatusPill> : null}
      />

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <div className="flex flex-col gap-4">
          {!report ? (
            <EmptyState
              title="Your summary isn’t ready yet"
              description={`${tutorShort} sends a short report after each lesson. It will show here.`}
              action={
                <Link href="/student/lessons" className={buttonVariants({ variant: "outline", size: "sm" })}>
                  Back to my lessons
                </Link>
              }
            />
          ) : (
            <>
              {showTakeaways ? (
                <SectionCard title="Key takeaways">
                  <ul className="flex list-disc flex-col gap-2 pl-5 text-sm text-foreground">
                    {report.takeaways?.map((takeaway) => <li key={takeaway}>{takeaway}</li>)}
                  </ul>
                  {report.aiDrafted && report.tutorApproved ? (
                    <p className="mt-3 text-xs text-muted-foreground">
                      Drafted from the lesson by the study helper and checked by {tutorShort}.
                    </p>
                  ) : null}
                </SectionCard>
              ) : null}

              {report.agenda?.length ? (
                <SectionCard title="What you covered">
                  <ol className="divide-y divide-border">
                    {report.agenda.map((item) => (
                      <li key={item.time} className="flex gap-6 py-3 first:pt-0 last:pb-0">
                        <span className="w-12 shrink-0 text-sm font-bold text-primary">{item.time}</span>
                        <span className="min-w-0">
                          <span className="block text-sm font-semibold text-foreground">{item.title}</span>
                          <span className="block text-xs text-muted-foreground">{item.detail}</span>
                        </span>
                      </li>
                    ))}
                  </ol>
                </SectionCard>
              ) : null}

              {pages.length > 0 || whiteboardFile ? (
                <SectionCard
                  title="Whiteboard pages"
                  action={
                    whiteboardFile ? (
                      <a
                        href={whiteboardFile.url ?? "#"}
                        download={whiteboardFile.name}
                        className={buttonVariants({ variant: "outline", size: "sm" })}
                      >
                        Download all (PDF · {formatFileSize(whiteboardFile.sizeKb)})
                      </a>
                    ) : null
                  }
                >
                  {pages.length > 0 ? (
                    <div className="grid gap-3 sm:grid-cols-3">
                      {pages.map((page) => (
                        <WhiteboardThumb key={page.caption} page={page} />
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">{whiteboardFile?.name}</p>
                  )}
                </SectionCard>
              ) : null}

              <SectionCard title={`Note from ${tutorShort}`}>
                <blockquote className="text-[15px] leading-relaxed text-foreground">“{report.comment}”</blockquote>
              </SectionCard>
            </>
          )}
        </div>

        <div className="flex flex-col gap-4">
          {report?.homework ? (
            <HomeworkCard
              lessonId={lesson.id}
              eyebrow={report.homework.due ? `Homework · due ${formatDateShort(report.homework.due)}` : "Homework"}
              task={report.homework.text}
              minutes={report.homework.minutes}
              done={report.homework.done}
              pastPaperHref="/student/library?tab=past-papers"
            />
          ) : null}

          {next ? (
            <NavyCard eyebrow="Next lesson">
              <h2 className="text-[17px] font-bold text-on-navy">{next.title}</h2>
              <p className="mt-1 text-[13px] text-on-navy-muted">
                {formatLessonWhen(next.start, now)} · {nextTutor?.fullName ?? "your tutor"}
              </p>
              <div className="mt-4">
                <JoinLessonButton lessonId={next.id} start={next.start} durationMin={next.durationMin} now={now} />
              </div>
            </NavyCard>
          ) : null}

          <SectionCard title="Still unsure about something?">
            <ul className="flex flex-col gap-1 text-sm">
              {[
                { href: "/student/library", label: "Ask the study helper about this lesson" },
                { href: "/student/messages", label: `Message ${tutorShort}` },
                { href: "/student/community", label: "Ask the community" },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="inline-flex min-h-8 items-center font-semibold text-primary underline underline-offset-2">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </SectionCard>

          <SectionCard title="How was this lesson?">
            <RatingStars />
          </SectionCard>
        </div>
      </div>
    </>
  );
}

export default function StudentLessonSummaryPage({ params }: { params: Params }) {
  return (
    <Suspense fallback={<div className="h-96 rounded-xl bg-divider-soft" aria-busy="true" />}>
      <LessonSummary params={params} />
    </Suspense>
  );
}
