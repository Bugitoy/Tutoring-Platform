import { Suspense } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { PageHeader } from "@/components/shell/PageHeader";
import { AddOpenSlotsHint } from "@/components/tutor/AddOpenSlotsHint";
import { BookingSettingsForm } from "@/components/tutor/BookingSettingsForm";
import { WeekAvailabilityGrid, type BookedLessonDetail } from "@/components/tutor/WeekAvailabilityGrid";
import { buttonVariants } from "@/components/ui/button";
import { isYmd } from "@/lib/calendar";
import { nowIso } from "@/lib/clock";
import { getTutorWeek } from "@/lib/data/lessons";
import { getDemoSession, listStudents } from "@/lib/data/profiles";
import { getBookingSettings } from "@/lib/data/tutorWorkspace";
import { TIMEZONE_LABEL, addGaboroneDays, formatDateShort, formatTimeRange, gaboroneDate } from "@/lib/format";
import { courseLabel, lessonStatusView } from "@/lib/lessonStatus";
import { buildWeekGrid, formatWeekTitle, shortStudentName, weekStartOf } from "@/lib/tutorWeek";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function one(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

async function TutorCalendar({ searchParams }: { searchParams: SearchParams }) {
  const query = await searchParams;
  const now = nowIso();
  const today = gaboroneDate(now);
  const thisWeek = weekStartOf(today);
  const weekParam = one(query.week);
  const weekStart = isYmd(weekParam) ? weekStartOf(weekParam) : thisWeek;

  const { tutor } = await getDemoSession();
  const [week, students, settings] = await Promise.all([
    getTutorWeek(tutor.id, weekStart),
    listStudents(),
    getBookingSettings(tutor.id),
  ]);
  const grid = buildWeekGrid({ weekStart, lessons: week.lessons, open: week.open, now });

  const booked: Record<string, BookedLessonDetail> = {};
  for (const cell of grid.cells.flat()) {
    if (!cell.lesson) continue;
    const name = students.find((student) => student.id === cell.lesson?.studentId)?.fullName ?? "Student";
    const status = lessonStatusView(cell.lesson, "tutor", { now });
    booked[cell.lesson.id] = {
      studentName: name,
      shortName: shortStudentName(name),
      course: courseLabel(cell.lesson.curriculumId, cell.lesson.subjectId),
      title: cell.lesson.title,
      when: `${formatDateShort(cell.lesson.start)} · ${formatTimeRange(cell.lesson.start, cell.lesson.durationMin)}`,
      status: { label: status.label, tone: status.tone },
    };
  }

  const weekHref = (start: string) => (start === thisWeek ? "/tutor/calendar" : `/tutor/calendar?week=${start}`);

  return (
    <>
      <PageHeader
        title="Calendar"
        subtitle={`${formatWeekTitle(weekStart)} · ${TIMEZONE_LABEL}`}
        actions={
          <>
            <Link
              href={weekHref(addGaboroneDays(weekStart, -7))}
              aria-label="Previous week"
              className={buttonVariants({ variant: "outline", size: "icon" })}
            >
              <ChevronLeft aria-hidden="true" />
            </Link>
            <Link
              href={weekHref(thisWeek)}
              aria-current={weekStart === thisWeek ? "page" : undefined}
              className={buttonVariants({ variant: "outline" })}
            >
              This week
            </Link>
            <Link
              href={weekHref(addGaboroneDays(weekStart, 7))}
              aria-label="Next week"
              className={buttonVariants({ variant: "outline", size: "icon" })}
            >
              <ChevronRight aria-hidden="true" />
            </Link>
            <AddOpenSlotsHint />
          </>
        }
      />
      <WeekAvailabilityGrid
        key={weekStart}
        grid={grid}
        today={today}
        booked={booked}
        isThisWeek={weekStart === thisWeek}
        settings={<BookingSettingsForm initial={settings} />}
      />
    </>
  );
}

export default function TutorCalendarPage({ searchParams }: { searchParams: SearchParams }) {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col gap-6" aria-busy="true" aria-label="Loading">
          <div className="h-16 rounded-xl bg-divider-soft" />
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_260px]">
            <div className="h-[520px] rounded-xl bg-divider-soft" />
            <div className="h-80 rounded-xl bg-divider-soft" />
          </div>
        </div>
      }
    >
      <TutorCalendar searchParams={searchParams} />
    </Suspense>
  );
}
