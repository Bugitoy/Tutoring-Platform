import Link from "next/link";
import { RateLessonButton } from "@/components/reports/RateLessonButton";
import { Avatar } from "@/components/shared/Avatar";
import { StatusPill } from "@/components/shared/StatusPill";
import { buttonVariants } from "@/components/ui/button";
import {
  formatBookingWhen,
  formatTime,
  formatWeekday,
  relativeDayWord,
} from "@/lib/format";
import { attendanceView, subjectShort } from "@/lib/lessonStatus";
import type { Lesson, Report, Tutor } from "@/lib/types";

type ReportCardProps = {
  report: Report;
  lesson: Lesson;
  tutor?: Tutor;
  now: string;
  /** Link to the full report (compact variant). */
  href?: string;
  variant: "feature" | "list" | "compact";
};

function homeworkNote(report: Report): string | null {
  const homework = report.homework;
  if (!homework) return null;
  if (homework.done) return `${homework.text} · handed in`;
  return homework.due ? `${homework.text} · due ${formatWeekday(homework.due)}` : homework.text;
}

function FileLink({ report }: { report: Report }) {
  const file = report.files[0];
  if (!file) return null;
  return (
    <a href={file.url ?? "#"} download={file.name} className="font-semibold text-primary underline underline-offset-2">
      {file.name}
    </a>
  );
}

export function ReportCard({ report, lesson, tutor, now, href, variant }: ReportCardProps) {
  const tutorName = tutor?.fullName ?? "Tutor";
  const subject = subjectShort(lesson.curriculumId, lesson.subjectId);
  const homework = homeworkNote(report);

  if (variant === "compact") {
    const day = relativeDayWord(lesson.start, now) ?? formatWeekday(lesson.start, "long");
    return (
      <article className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card p-4">
        <div className="min-w-0">
          <p className="text-sm font-bold text-foreground">
            {tutorName} · {day}
          </p>
          <p className="text-[13px] text-muted-foreground">
            {lesson.title}
            {report.homework ? ` · homework ${report.homework.done ? "handed in" : "set"}` : ""}
          </p>
        </div>
        {href ? (
          <Link href={href} className="shrink-0 text-[13px] font-semibold text-primary underline underline-offset-2">
            Read report
          </Link>
        ) : null}
      </article>
    );
  }

  if (variant === "feature") {
    const attendance = attendanceView(report, "long");
    const when =
      relativeDayWord(lesson.start, now) === "Today" ? `today, ${formatTime(lesson.start)}` : formatBookingWhen(lesson.start);
    return (
      <article className="rounded-xl border border-border bg-card p-5">
        <header className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <Avatar initials={tutor?.initials ?? "T"} size={36} />
            <div>
              <p className="text-[15px] font-bold text-foreground">{tutorName}</p>
              <p className="text-xs text-muted-foreground">
                {subject} · {when} · {lesson.durationMin} min
              </p>
            </div>
          </div>
          <StatusPill tone={attendance.tone}>{attendance.label}</StatusPill>
        </header>
        <blockquote className="mt-4 text-[15px] leading-relaxed text-foreground">“{report.comment}”</blockquote>
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          {homework ? (
            <div className="rounded-lg bg-surface-subtle p-3">
              <p className="text-[11px] font-bold tracking-[0.07em] text-muted-foreground uppercase">Homework</p>
              <p className="mt-1 text-[13px] text-foreground">{homework}</p>
            </div>
          ) : null}
          {report.files[0] ? (
            <div className="rounded-lg bg-surface-subtle p-3">
              <p className="text-[11px] font-bold tracking-[0.07em] text-muted-foreground uppercase">Lesson notes</p>
              <p className="mt-1 text-[13px]">
                <FileLink report={report} />
              </p>
            </div>
          ) : null}
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link href="/parent/messages" className={buttonVariants({ variant: "outline" })}>
            Message tutor
          </Link>
          <RateLessonButton />
        </div>
      </article>
    );
  }

  const attendance = attendanceView(report, "short");
  return (
    <article id={`report-${lesson.id}`} className="scroll-mt-24 rounded-xl border border-border bg-card p-5">
      <header className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <Avatar initials={tutor?.initials ?? "T"} size={36} />
          <div>
            <h2 className="text-[15px] font-bold text-foreground">
              {subject} · {lesson.title}
            </h2>
            <p className="text-xs text-muted-foreground">
              {tutorName} · {formatBookingWhen(lesson.start)} · {lesson.durationMin} min
            </p>
          </div>
        </div>
        <StatusPill tone={attendance.tone}>{attendance.label}</StatusPill>
      </header>
      <p className="mt-3 text-sm leading-relaxed text-foreground">{report.comment}</p>
      <p className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[13px] text-foreground">
        {homework ? (
          <span>
            <strong>Homework:</strong> {homework}
          </span>
        ) : null}
        <FileLink report={report} />
      </p>
    </article>
  );
}
