import { Suspense } from "react";
import { CalendarSkeleton } from "@/components/calendar/CalendarSkeleton";
import { CalendarWithDayPanel } from "@/components/calendar/CalendarWithDayPanel";
import { CheckboxCard } from "@/components/shared/CheckboxCard";
import { SectionCard } from "@/components/shared/SectionCard";
import { UrlSegmentedControl } from "@/components/shared/UrlSegmentedControl";
import { PageHeader } from "@/components/shell/PageHeader";
import { childCat, isYmd, monthOf } from "@/lib/calendar";
import { childKey, pickChild } from "@/lib/children";
import { nowIso } from "@/lib/clock";
import { getLessonsForParent, getParentMonthSummary } from "@/lib/data/lessons";
import { getChildrenForParent, getDemoSession } from "@/lib/data/profiles";
import { listTutors } from "@/lib/data/tutors";
import { formatMoney, formatMonthTitle, gaboroneDate } from "@/lib/format";
import { parentCalendarEvents, parentLegend, type ChildColour } from "@/lib/lessonEvents";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function one(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

async function ParentCalendar({ searchParams }: { searchParams: SearchParams }) {
  const query = await searchParams;
  const now = nowIso();
  const today = gaboroneDate(now);
  const dateParam = one(query.date);
  const date = isYmd(dateParam) ? dateParam : today;
  const month = monthOf(date);

  const { parent } = await getDemoSession();
  const children = await getChildrenForParent(parent.id);
  const only = pickChild(children, one(query.child));
  const colours: ChildColour[] = children.map((student, index) => ({ student, key: childKey(student), cat: childCat(index) }));

  const [tutors, lessons, summary] = await Promise.all([
    listTutors(),
    getLessonsForParent(parent.id, month, only?.id),
    getParentMonthSummary(
      parent.id,
      children.map((child) => child.id),
      monthOf(today),
      now,
    ),
  ]);
  const tutorOf = (id: string) => tutors.find((tutor) => tutor.id === id);

  return (
    <>
      <PageHeader
        title="Calendar"
        subtitle="Every lesson your children have had and have coming up. Tap a day for details."
        actions={
          <UrlSegmentedControl
            param="child"
            label="Show lessons for"
            value={only ? childKey(only) : "both"}
            options={[
              { value: "both", label: children.length === 2 ? "Both children" : "All children" },
              ...children.map((child) => ({ value: childKey(child), label: child.firstName })),
            ]}
            className="w-full sm:w-80"
          />
        }
      />
      <CalendarWithDayPanel
        month={month}
        today={today}
        selectedDate={date}
        events={parentCalendarEvents(lessons, tutorOf, colours, now)}
        legend={parentLegend(colours)}
        emptyDescription="Pick another day to see its lessons."
      >
        <SectionCard title={`${formatMonthTitle(monthOf(today), today)} so far`}>
          <dl className="flex flex-col gap-2 text-[13px]">
            {summary.children.map((row) => {
              const child = children.find((item) => item.id === row.studentId);
              return (
                <div key={row.studentId} className="flex justify-between gap-3">
                  <dt className="text-muted-foreground">{child?.firstName} · lessons attended</dt>
                  <dd className="font-bold text-foreground">
                    {row.attended} of {row.held}
                  </dd>
                </div>
              );
            })}
            <div className="flex justify-between gap-3">
              <dt className="text-muted-foreground">Still to come this month</dt>
              <dd className="font-bold text-foreground">
                {summary.stillToCome} {summary.stillToCome === 1 ? "lesson" : "lessons"}
              </dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-muted-foreground">Waiting for your payment</dt>
              <dd className={summary.waiting.count > 0 ? "font-bold text-status-warning-fg" : "font-bold text-foreground"}>
                {summary.waiting.count > 0 ? `${summary.waiting.count} · ${formatMoney(summary.waiting.amount)}` : "None"}
              </dd>
            </div>
          </dl>
        </SectionCard>
        <CheckboxCard label="Remind me an hour before each lesson, and tell me if a lesson is missed" />
      </CalendarWithDayPanel>
    </>
  );
}

export default function ParentCalendarPage({ searchParams }: { searchParams: SearchParams }) {
  return (
    <Suspense fallback={<CalendarSkeleton />}>
      <ParentCalendar searchParams={searchParams} />
    </Suspense>
  );
}
