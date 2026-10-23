import { Suspense } from "react";
import { ApplyToTutorButton } from "@/components/community/ApplyToTutorButton";
import { LeaderboardFilters } from "@/components/community/LeaderboardFilters";
import { LeaderboardTable } from "@/components/community/LeaderboardTable";
import { EmptyState } from "@/components/shared/EmptyState";
import { NavyCard } from "@/components/shared/NavyCard";
import { PageHeader } from "@/components/shell/PageHeader";
import { LEVELS } from "@/lib/community";
import { getCurriculum } from "@/lib/curricula";
import { getLeaderboard, getSchoolOfTheMonth } from "@/lib/data/community";
import { getDemoSession } from "@/lib/data/profiles";
import type { LeaderboardPeriod, LeaderboardScope } from "@/lib/types";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const SCOPES: LeaderboardScope[] = ["school", "botswana", "global"];
const PERIODS: LeaderboardPeriod[] = ["month", "all"];
const TOP_HELPERS_WHO_CAN_APPLY = 10;

function one(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

async function Leaderboard({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const { student } = await getDemoSession();
  const profile = student.learningProfile;
  const curriculum = getCurriculum(profile.curriculumId);
  const subjects = profile.subjectIds.map((subjectId) => ({
    value: subjectId,
    label: curriculum?.subjects.find((subject) => subject.id === subjectId)?.name ?? subjectId,
  }));

  const scopeParam = one(params.scope) as LeaderboardScope | undefined;
  const periodParam = one(params.period) as LeaderboardPeriod | undefined;
  const subjectParam = one(params.subject);
  const scope = scopeParam && SCOPES.includes(scopeParam) ? scopeParam : "botswana";
  const period = periodParam && PERIODS.includes(periodParam) ? periodParam : "month";
  const subject =
    subjectParam && subjects.some((item) => item.value === subjectParam)
      ? subjectParam
      : (profile.goals[0]?.subjectId ?? subjects[0]?.value ?? "mathematics");
  const subjectLabel = subjects.find((item) => item.value === subject)?.label ?? subject;

  const [rows, school] = await Promise.all([
    getLeaderboard({ scope, subjectId: subject, period, viewerId: student.id }),
    getSchoolOfTheMonth(),
  ]);
  const you = rows.find((row) => row.isYou);
  const hidden = !student.preferences?.showOnLeaderboard;

  return (
    <>
      <PageHeader
        title="Top helpers"
        subtitle="Ranked by points from helpful and tutor-verified answers."
        backHref="/student/community"
        backLabel="Back to community"
        actions={<LeaderboardFilters scope={scope} subject={subject} period={period} subjects={subjects} />}
      />
      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="flex min-w-0 flex-col gap-3">
          {rows.length === 0 ? (
            <EmptyState
              title={`No ${subjectLabel} helpers yet`}
              description="Answer a question in this subject to be the first on the board."
            />
          ) : (
            <LeaderboardTable
              rows={rows}
              caption={`Top ${subjectLabel} helpers, ${scope === "school" ? "your school" : scope === "global" ? "global" : "Botswana"}, ${period === "month" ? "this month" : "all time"}`}
            />
          )}
          {you && hidden ? (
            <p className="text-[13px] text-muted-foreground">
              Only you can see your row. Turn on “Show my name on the community leaderboard” in your profile to appear for
              others.
            </p>
          ) : null}
        </div>

        <aside className="flex flex-col gap-4">
          <NavyCard eyebrow="Become a tutor">
            <p className="text-[17px] leading-snug font-bold text-on-navy">
              Top {TOP_HELPERS_WHO_CAN_APPLY} helpers each month can apply to tutor on Thanodi and earn from lessons.
            </p>
            <ApplyToTutorButton eligible={Boolean(you && you.rank <= TOP_HELPERS_WHO_CAN_APPLY && period === "month")} />
          </NavyCard>

          <section className="rounded-xl border border-border bg-card p-5">
            <h2 className="mb-3 text-[15px] font-bold text-foreground">Levels</h2>
            <dl className="flex flex-col gap-2 text-sm">
              {LEVELS.map((level) => (
                <div key={level.level} className="flex justify-between gap-3">
                  <dt className="text-text-secondary">
                    Level {level.level} · {level.label}
                  </dt>
                  <dd className="text-text-secondary">{level.min.toLocaleString("en-GB")}+</dd>
                </div>
              ))}
            </dl>
          </section>

          <section className="rounded-xl bg-accent p-5">
            <p className="text-xs font-bold tracking-[0.07em] text-primary uppercase">School of the month</p>
            <h2 className="mt-1 text-[17px] font-bold text-foreground">{school.name}</h2>
            <p className="mt-1 text-[13px] text-text-secondary">
              {school.verifiedAnswers} verified answers from its students this month
            </p>
          </section>
        </aside>
      </div>
    </>
  );
}

export default function StudentLeaderboardPage({ searchParams }: { searchParams: SearchParams }) {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col gap-6" aria-busy="true" aria-label="Loading">
          <div className="h-24 rounded-xl bg-divider-soft" />
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
            <div className="h-[28rem] rounded-xl bg-divider-soft" />
            <div className="h-80 rounded-xl bg-divider-soft" />
          </div>
        </div>
      }
    >
      <Leaderboard searchParams={searchParams} />
    </Suspense>
  );
}
