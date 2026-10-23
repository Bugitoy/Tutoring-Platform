import { Suspense } from "react";
import Link from "next/link";
import { CalendarSkeleton } from "@/components/calendar/CalendarSkeleton";
import { CalendarWithDayPanel } from "@/components/calendar/CalendarWithDayPanel";
import { NextLessonHero } from "@/components/lessons/NextLessonHero";
import { DateTile } from "@/components/shared/DateTile";
import { EmptyState } from "@/components/shared/EmptyState";
import { SectionCard } from "@/components/shared/SectionCard";
import { PageHeader } from "@/components/shell/PageHeader";
import { buttonVariants } from "@/components/ui/button";
import { isYmd, monthOf } from "@/lib/calendar";
import { nowIso } from "@/lib/clock";
import { getLessonsForStudent, getNextLesson, getPastLessons, getUpcomingLessons } from "@/lib/data/lessons";
import { getDemoSession, getParent } from "@/lib/data/profiles";
import { getReportForLesson } from "@/lib/data/reports";
import { listTutors } from "@/lib/data/tutors";
import {
  formatDateLong,
  formatLessonDay,
  formatTime,
  formatTimeRange,
  formatWeekday,
  gaboroneDate,
  relativeDayWord,
} from "@/lib/format";
import { studentCalendarEvents, studentLegend } from "@/lib/lessonEvents";
import { courseLabel, subjectShort } from "@/lib/lessonStatus";
import { canBook } from "@/lib/permissions";
import { buildBookingDays } from "@/lib/slots";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

async function MyLessons({ searchParams }: { searchParams: SearchParams }) {
  const query = await searchParams;
  const now = nowIso();
  const today = gaboroneDate(now);
  const dateParam = Array.isArray(query.date) ? query.date[0] : query.date;
  const date = isYmd(dateParam) ? dateParam : today;
  const month = monthOf(date);

  const { student } = await getDemoSession();
  const [parent, tutors, lessons, next] = await Promise.all([
    student.linkedParentId ? getParent(student.linkedParentId) : undefined,
    listTutors(),
    getLessonsForStudent(student.id, month),
    getNextLesson(student.id, now),
  ]);
  const [upcoming, past] = await Promise.all([
    getUpcomingLessons(student.id, now, 4, next?.id),
    getPastLessons(student.id, now, 3),
  ]);
  const pastReports = await Promise.all(past.map((lesson) => getReportForLesson(lesson.id)));

  const tutorOf = (id: string) => tutors.find((tutor) => tutor.id === id);
  const parentName = parent?.firstName;
  const bookable = canBook(student);
  const nextTutor = next ? tutorOf(next.tutorId) : undefined;

  const bookLink = bookable ? (
    <Link href="/student/tutors" className={buttonVariants({ size: "sm" })}>
      + Book a lesson
    </Link>
  ) : null;

  return (
    <div className="flex flex-col gap-6">
      {next ? (
        <NextLessonHero
          lessonId={next.id}
          title={next.title}
          timeLine={[
            `${formatLessonDay(next.start, now)}, ${formatTimeRange(next.start, next.durationMin)}`,
            nextTutor?.fullName,
            courseLabel(next.curriculumId, next.subjectId),
          ]
            .filter(Boolean)
            .join(" · ")}
          goal={next.goal}
          start={next.start}
          durationMin={next.durationMin}
          now={now}
          tutorName={nextTutor?.fullName ?? "your tutor"}
          rescheduleDays={buildBookingDays(next.tutorId, now)}
        />
      ) : (
        <EmptyState
          title="No lessons booked"
          description={bookable ? "Find a tutor and book your next lesson." : "Ask a parent to book your next lesson."}
          action={bookLink}
        />
      )}

      <CalendarWithDayPanel
        month={month}
        today={today}
        selectedDate={date}
        events={studentCalendarEvents(lessons, tutorOf, { now, parentName })}
        legend={studentLegend(lessons)}
        calendarAction={bookLink}
        emptyDescription={bookable ? "Pick another day, or book a lesson with a tutor." : "Pick another day to see its lessons."}
      >
        <SectionCard title="Upcoming">
          {upcoming.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nothing else booked yet.</p>
          ) : (
            <ul className="divide-y divide-border">
              {upcoming.map((lesson) => {
                const who =
                  lesson.status === "awaiting_payment"
                    ? `waiting for ${parentName ?? "your parent"} to pay`
                    : (tutorOf(lesson.tutorId)?.fullName ?? "");
                return (
                  <li key={lesson.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                    <DateTile iso={lesson.start} />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground">
                        <span className="sr-only">{formatDateLong(lesson.start)}: </span>
                        {lesson.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatTime(lesson.start)} · {subjectShort(lesson.curriculumId, lesson.subjectId)} · {who}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </SectionCard>

        <SectionCard title="Past lessons">
          {past.length === 0 ? (
            <p className="text-sm text-muted-foreground">Your finished lessons will show here.</p>
          ) : (
            <ul className="divide-y divide-border">
              {past.map((lesson, index) => {
                const homework = pastReports[index]?.homework;
                const when =
                  relativeDayWord(lesson.start, now) === "Today"
                    ? `Today, ${formatTime(lesson.start)}`
                    : formatLessonDay(lesson.start, now);
                const homeworkNote = homework
                  ? homework.done
                    ? "homework done"
                    : homework.due
                      ? `homework due ${formatWeekday(homework.due)}`
                      : "homework set"
                  : null;
                return (
                  <li key={lesson.id} className="flex items-start justify-between gap-3 py-3 first:pt-0 last:pb-0">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground">{lesson.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {[when, subjectShort(lesson.curriculumId, lesson.subjectId), homeworkNote].filter(Boolean).join(" · ")}
                      </p>
                    </div>
                    <Link
                      href={`/student/lessons/${lesson.id}`}
                      className="shrink-0 text-[13px] font-semibold text-primary underline underline-offset-2"
                    >
                      View summary
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </SectionCard>
      </CalendarWithDayPanel>
    </div>
  );
}

export default function StudentLessonsPage({ searchParams }: { searchParams: SearchParams }) {
  return (
    <>
      <PageHeader title="My lessons" />
      <Suspense fallback={<CalendarSkeleton hero />}>
        <MyLessons searchParams={searchParams} />
      </Suspense>
    </>
  );
}
