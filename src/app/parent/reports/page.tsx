import { Suspense } from "react";
import Link from "next/link";
import { ReportCard } from "@/components/reports/ReportCard";
import { ReportFilters, type ReportPeriod } from "@/components/reports/ReportFilters";
import { CheckboxCard } from "@/components/shared/CheckboxCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { NoticeBox } from "@/components/shared/NoticeBox";
import { SectionCard } from "@/components/shared/SectionCard";
import { UrlSegmentedControl } from "@/components/shared/UrlSegmentedControl";
import { PageHeader } from "@/components/shell/PageHeader";
import { buttonVariants } from "@/components/ui/button";
import { addGaboroneDays, gaboroneDate } from "@/lib/format";
import { childKey, childLabel, pickChild } from "@/lib/children";
import { nowIso } from "@/lib/clock";
import { getChildrenForParent, getDemoSession } from "@/lib/data/profiles";
import { getReportsForParent, getTermProgress } from "@/lib/data/reports";
import { listTutors } from "@/lib/data/tutors";
import { subjectShort } from "@/lib/lessonStatus";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function one(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function asPeriod(value: string | undefined): ReportPeriod {
  return value === "30d" || value === "all" ? value : "term";
}

async function ParentReports({ searchParams }: { searchParams: SearchParams }) {
  const query = await searchParams;
  const now = nowIso();
  const today = gaboroneDate(now);
  const { parent } = await getDemoSession();
  const children = await getChildrenForParent(parent.id);

  const childParam = one(query.child);
  const only = childParam === "both" ? undefined : (pickChild(children, childParam) ?? children[0]);
  const shown = only ? [only] : children;
  const period = asPeriod(one(query.period));

  const [tutors, all, progress] = await Promise.all([
    listTutors(),
    getReportsForParent(parent.id, only?.id),
    Promise.all(shown.map(async (child) => ({ child, progress: await getTermProgress(child.id) }))),
  ]);
  const tutorOf = (id: string) => tutors.find((tutor) => tutor.id === id);

  const subjects = [...new Map(all.map(({ lesson }) => [lesson.subjectId, subjectShort(lesson.curriculumId, lesson.subjectId)])).entries()].map(
    ([value, label]) => ({ value, label }),
  );
  const subjectParam = one(query.subject);
  const subject = subjects.some((item) => item.value === subjectParam) ? (subjectParam as string) : "all";
  const termStart = progress.find((item) => item.progress)?.progress?.termStart;
  const from = period === "30d" ? addGaboroneDays(today, -30) : period === "term" ? termStart : undefined;

  const reports = all.filter(({ lesson }) => {
    if (subject !== "all" && lesson.subjectId !== subject) return false;
    if (from && gaboroneDate(lesson.start) < from) return false;
    return true;
  });

  return (
    <>
      <PageHeader
        title="Reports"
        subtitle="Every tutor writes a short report after each lesson. They all collect here."
        actions={
          <a href="#" className={buttonVariants({ variant: "outline" })}>
            Download term summary (PDF)
          </a>
        }
      />

      <div className="mb-6 flex flex-wrap items-end gap-3">
        <UrlSegmentedControl
          param="child"
          label="Show reports for"
          value={only ? childKey(only) : "both"}
          options={[
            { value: "both", label: children.length === 2 ? "Both children" : "All children" },
            ...children.map((child) => ({ value: childKey(child), label: childLabel(child) })),
          ]}
          className="w-full sm:w-auto sm:min-w-96"
        />
        <ReportFilters subject={subject} subjects={subjects} period={period} />
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <div className="flex flex-col gap-4">
          {reports.length === 0 ? (
            <EmptyState
              title="No reports match"
              description="Try another subject or a longer period."
              action={
                <Link href="/parent/reports?child=both&period=all" className={buttonVariants({ variant: "outline", size: "sm" })}>
                  Show all reports
                </Link>
              }
            />
          ) : (
            reports.map(({ report, lesson }) => (
              <ReportCard key={report.id} variant="list" report={report} lesson={lesson} tutor={tutorOf(lesson.tutorId)} now={now} />
            ))
          )}
        </div>

        <div className="flex flex-col gap-4">
          {progress.map(({ child, progress: term }) =>
            term ? (
              <SectionCard key={child.id} title={`${child.firstName} this term`}>
                <dl className="flex flex-col gap-2 text-[13px]">
                  <div className="flex justify-between gap-3">
                    <dt className="text-muted-foreground">Lessons attended</dt>
                    <dd className="font-bold text-foreground">
                      {term.attended} of {term.scheduled}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-muted-foreground">Homework handed in</dt>
                    <dd className="font-bold text-foreground">
                      {term.homeworkDone} of {term.homeworkSet}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-muted-foreground">Tutors</dt>
                    <dd className="font-bold text-foreground">{term.tutors}</dd>
                  </div>
                </dl>
              </SectionCard>
            ) : null,
          )}
          <NoticeBox lead="Questions about a report?">
            <p>Message the tutor directly. Replies usually arrive within a few hours.</p>
            <Link href="/parent/messages" className="mt-1 inline-flex font-semibold underline underline-offset-2">
              Open messages
            </Link>
          </NoticeBox>
          <CheckboxCard tone="card" label="Email me each new report as soon as the tutor sends it" />
        </div>
      </div>
    </>
  );
}

export default function ParentReportsPage({ searchParams }: { searchParams: SearchParams }) {
  return (
    <Suspense fallback={<div className="h-96 rounded-xl bg-divider-soft" aria-busy="true" />}>
      <ParentReports searchParams={searchParams} />
    </Suspense>
  );
}
