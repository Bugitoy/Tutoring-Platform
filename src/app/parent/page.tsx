import { Suspense } from "react";
import Link from "next/link";
import { Check } from "lucide-react";
import { PaymentRequestBanner } from "@/components/parent/PaymentRequestBanner";
import { ReportCard } from "@/components/reports/ReportCard";
import { Avatar } from "@/components/shared/Avatar";
import { EmptyState } from "@/components/shared/EmptyState";
import { StatCard } from "@/components/shared/StatCard";
import { UrlSegmentedControl } from "@/components/shared/UrlSegmentedControl";
import { PageHeader } from "@/components/shell/PageHeader";
import { Progress } from "@/components/ui/progress";
import { buttonVariants } from "@/components/ui/button";
import { childKey, childLabel, pickChild } from "@/lib/children";
import { nowIso } from "@/lib/clock";
import { getCurriculum } from "@/lib/curricula";
import { getLesson, getMainTutorId, getNextLesson, getPendingPaymentRequests } from "@/lib/data/lessons";
import { getChildrenForParent, getDemoSession, getStudent } from "@/lib/data/profiles";
import { getReportsForParent, getTermProgress, getTopics } from "@/lib/data/reports";
import { listTutors } from "@/lib/data/tutors";
import { formatBookingWhen, formatLessonWhen, formatMoney, gaboroneDate, tutorShortName } from "@/lib/format";
import { subjectShort } from "@/lib/lessonStatus";
import type { Tutor } from "@/lib/types";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function joinAnd(items: string[]): string {
  if (items.length <= 1) return items.join("");
  return `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
}

/** "Teaches BGCSE, JCE and IGCSE Maths" */
function teachesLine(tutor: Tutor, curriculumId: string, subjectId: string): string {
  const names = tutor.offerings.flatMap((offering) => {
    const curriculum = getCurriculum(offering.curriculumId);
    if (!curriculum) return [];
    const covers =
      offering.subjectId === subjectId ||
      (offering.entireCurriculum && curriculum.subjects.some((subject) => subject.id === subjectId));
    return covers ? [curriculum.name] : [];
  });
  return `Teaches ${joinAnd([...new Set(names)])} ${subjectShort(curriculumId, subjectId)}`;
}

async function ParentHome({ searchParams }: { searchParams: SearchParams }) {
  const query = await searchParams;
  const now = nowIso();
  const { parent } = await getDemoSession();
  const children = await getChildrenForParent(parent.id);
  const childParam = Array.isArray(query.child) ? query.child[0] : query.child;
  const child = pickChild(children, childParam) ?? children[0];

  if (!child) {
    return (
      <>
        <PageHeader title="Home" />
        <EmptyState title="No children linked yet" description="Add a child to see their lessons and reports." />
      </>
    );
  }

  const [tutors, requests, progress, topics, reports, next, mainTutorId] = await Promise.all([
    listTutors(),
    getPendingPaymentRequests(parent.id),
    getTermProgress(child.id),
    getTopics(child.id),
    getReportsForParent(parent.id, child.id),
    getNextLesson(child.id, now),
    getMainTutorId(child.id),
  ]);
  const tutorOf = (id: string) => tutors.find((tutor) => tutor.id === id);

  const banners = await Promise.all(
    requests.map(async (request) => {
      const [lesson, student] = await Promise.all([getLesson(request.lessonId), getStudent(request.fromStudentId)]);
      if (!lesson || !student) return null;
      const tutor = tutorOf(lesson.tutorId);
      return {
        id: request.id,
        childName: student.firstName,
        summary: `${subjectShort(lesson.curriculumId, lesson.subjectId)} with ${tutor?.fullName ?? "a tutor"} · ${formatBookingWhen(lesson.start)} · ${formatMoney(request.amount)}`,
        note: `${student.firstName} booked this lesson himself. The time is held for 12 hours.`,
        reviewHref: `/parent/tutors/${lesson.tutorId}/book?request=${request.id}`,
      };
    }),
  );

  const [latest, ...older] = reports;
  const mainTutor = mainTutorId ? tutorOf(mainTutorId) : undefined;
  const mainSubject = reports.find((item) => item.lesson.tutorId === mainTutorId)?.lesson ?? next;
  const key = childKey(child);
  const nextTutor = next ? tutorOf(next.tutorId) : undefined;

  return (
    <>
      <PageHeader
        eyebrow={progress?.termLabel}
        eyebrowStyle="plain"
        title={`${child.firstName}’s progress`}
        actions={
          <UrlSegmentedControl
            param="child"
            label="Choose a child"
            value={key}
            options={children.map((item) => ({ value: childKey(item), label: childLabel(item) }))}
            className="w-full sm:w-72"
          />
        }
      />

      <div className="flex flex-col gap-6">
        {banners.map((banner) =>
          banner ? (
            <PaymentRequestBanner
              key={banner.id}
              requestId={banner.id}
              childName={banner.childName}
              summary={banner.summary}
              note={banner.note}
              reviewHref={banner.reviewHref}
            />
          ) : null,
        )}

        <div className="grid gap-4 md:grid-cols-3">
          <StatCard
            label="Lessons attended this term"
            value={progress ? `${progress.attended} of ${progress.scheduled}` : "—"}
            progress={progress && progress.scheduled > 0 ? Math.round((progress.attended / progress.scheduled) * 100) : undefined}
          />
          <StatCard
            label="Homework completed"
            value={progress ? `${progress.homeworkDone} of ${progress.homeworkSet}` : "—"}
            progress={
              progress && progress.homeworkSet > 0 ? Math.round((progress.homeworkDone / progress.homeworkSet) * 100) : undefined
            }
          />
          <StatCard
            label="Next lesson"
            value={next ? formatLessonWhen(next.start, now) : "None booked"}
            subline={
              <>
                {next ? (
                  <p>
                    {subjectShort(next.curriculumId, next.subjectId)} with{" "}
                    {nextTutor ? tutorShortName(nextTutor.fullName) : "the tutor"} · video
                  </p>
                ) : null}
                <Link
                  href={`/parent/calendar?child=${key}${next ? `&date=${gaboroneDate(next.start)}` : ""}`}
                  className="mt-1 inline-flex font-semibold text-primary underline underline-offset-2"
                >
                  Open calendar
                </Link>
              </>
            }
          />
        </div>

        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
          <section className="flex flex-col gap-3" aria-labelledby="latest-reports">
            <div className="flex items-center justify-between gap-3">
              <h2 id="latest-reports" className="text-[17px] font-bold text-foreground">
                Latest tutor reports
              </h2>
              <Link href={`/parent/reports?child=${key}`} className="text-[13px] font-semibold text-primary underline underline-offset-2">
                All reports
              </Link>
            </div>
            {latest ? (
              <>
                <ReportCard variant="feature" report={latest.report} lesson={latest.lesson} tutor={tutorOf(latest.lesson.tutorId)} now={now} />
                {older.slice(0, 2).map((item) => (
                  <ReportCard
                    key={item.report.id}
                    variant="compact"
                    report={item.report}
                    lesson={item.lesson}
                    tutor={tutorOf(item.lesson.tutorId)}
                    now={now}
                    href={`/parent/reports?child=${key}#report-${item.lesson.id}`}
                  />
                ))}
              </>
            ) : (
              <EmptyState
                title="No reports yet"
                description={`Tutors write a short report after each of ${child.firstName}’s lessons.`}
                action={
                  <Link href={`/parent/calendar?child=${key}`} className={buttonVariants({ variant: "outline", size: "sm" })}>
                    Open calendar
                  </Link>
                }
              />
            )}
          </section>

          <div className="flex flex-col gap-6">
            {mainTutor ? (
              <section className="flex flex-col gap-3" aria-labelledby="who-teaches">
                <h2 id="who-teaches" className="text-[17px] font-bold text-foreground">
                  Who is teaching {child.firstName}
                </h2>
                <div className="rounded-xl border border-border bg-card p-5">
                  <div className="flex items-center gap-3">
                    <Avatar initials={mainTutor.initials} size={36} />
                    <div>
                      <p className="text-[15px] font-bold text-foreground">{mainTutor.fullName}</p>
                      <p className="text-xs text-muted-foreground">{mainTutor.headline}</p>
                    </div>
                  </div>
                  <ul className="mt-4 flex flex-col gap-1.5 text-[13px] text-foreground">
                    {[
                      mainTutor.verification.id === "verified" && mainTutor.verification.qualification === "verified"
                        ? "ID and teaching qualification checked"
                        : mainTutor.verification.id === "verified"
                          ? "ID checked"
                          : null,
                      mainSubject ? teachesLine(mainTutor, mainSubject.curriculumId, mainSubject.subjectId) : null,
                      "Lessons happen only in the app",
                    ]
                      .filter((line): line is string => Boolean(line))
                      .map((line) => (
                        <li key={line} className="flex items-start gap-2">
                          <Check aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-status-success-fg" />
                          {line}
                        </li>
                      ))}
                  </ul>
                </div>
              </section>
            ) : null}

            {topics.length > 0 ? (
              <section className="flex flex-col gap-3" aria-labelledby="topics">
                <h2 id="topics" className="text-[17px] font-bold text-foreground">
                  Topics this term
                </h2>
                <ul className="flex flex-col gap-3 rounded-xl border border-border bg-card p-5">
                  {topics.map((topic) => (
                    <li key={topic.topic}>
                      <div className="flex justify-between gap-3 text-[13px]">
                        <span className="text-foreground">{topic.topic}</span>
                        <span className="text-muted-foreground">{topic.label}</span>
                      </div>
                      <Progress
                        value={topic.percent}
                        aria-label={`${topic.topic}: ${topic.label}`}
                        className="mt-1.5 gap-0 [&_[data-slot=progress-track]]:h-2 [&_[data-slot=progress-track]]:bg-border"
                      />
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}
          </div>
        </div>
      </div>
    </>
  );
}

export default function ParentHomePage({ searchParams }: { searchParams: SearchParams }) {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col gap-6" aria-busy="true" aria-label="Loading">
          <div className="h-16 rounded-xl bg-divider-soft" />
          <div className="h-24 rounded-xl bg-divider-soft" />
          <div className="grid gap-4 md:grid-cols-3">
            <div className="h-28 rounded-xl bg-divider-soft" />
            <div className="h-28 rounded-xl bg-divider-soft" />
            <div className="h-28 rounded-xl bg-divider-soft" />
          </div>
        </div>
      }
    >
      <ParentHome searchParams={searchParams} />
    </Suspense>
  );
}
