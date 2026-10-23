import { Suspense } from "react";
import { io } from "next/cache";
import { NavyCard } from "@/components/shared/NavyCard";
import { PageHeader } from "@/components/shell/PageHeader";
import { DownloadStatementButton } from "@/components/tutor/DownloadStatementButton";
import { EarningsChart } from "@/components/tutor/EarningsChart";
import { PayoutActions } from "@/components/tutor/PayoutActions";
import { PLACEHOLDERS } from "@/config/placeholders";
import { nowIso } from "@/lib/clock";
import { getStatementRows, getTutorEarnings } from "@/lib/data/earnings";
import { getDemoSession } from "@/lib/data/profiles";
import { formatDateShort, formatDayMonth, formatMoney, formatWeekday, gaboroneDate } from "@/lib/format";

const STATEMENT_ROWS = 5;

async function TutorEarnings() {
  await io();
  const now = nowIso();
  const { tutor } = await getDemoSession();
  const [earnings, rows] = await Promise.all([getTutorEarnings(tutor.id), getStatementRows(tutor.id, now, STATEMENT_ROWS)]);
  const payoutDay = `${formatWeekday(earnings.nextPayoutAt, "long")} ${formatDayMonth(earnings.nextPayoutAt)}`;

  const csv = [
    ["Date", "Student", "Lesson", "Minutes", "Paid", `Thanodi fee (${PLACEHOLDERS.FEE_RATE}%)`, "You earn"],
    ...rows.map((row) => [
      gaboroneDate(row.date),
      row.studentName,
      row.title,
      String(row.durationMin),
      (row.paid / 100).toFixed(2),
      PLACEHOLDERS.FEE_AMOUNT,
      PLACEHOLDERS.TUTOR_NET,
    ]),
  ];

  return (
    <>
      <PageHeader title="Earnings" />
      <div className="flex flex-col gap-6">
        <div className="grid items-stretch gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
          <NavyCard className="flex flex-col justify-center">
            <p className="text-[13px] text-on-navy-muted">Ready to pay out</p>
            <p className="mt-1 text-[34px] leading-tight font-bold">{formatMoney(earnings.readyToPayout, true)}</p>
            <p className="mt-1 text-sm text-on-navy-muted">
              {earnings.readyToPayout > 0
                ? `Next automatic payout: ${payoutDay} to bank account ending ${earnings.bankLast4}`
                : `You’re all paid out. New earnings appear here after each lesson.`}
            </p>
            <PayoutActions canPayOut={earnings.readyToPayout > 0} />
          </NavyCard>

          <section className="rounded-xl border border-border bg-card p-5">
            <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="text-[17px] font-bold text-foreground">Your earnings, last 8 weeks</h2>
              <p className="text-xs text-muted-foreground">After Thanodi’s fee</p>
            </div>
            <EarningsChart weeks={earnings.weeks} />
          </section>
        </div>

        <section className="overflow-hidden rounded-xl border border-border bg-card">
          <div className="flex flex-wrap items-center justify-between gap-3 p-5">
            <h2 className="text-[17px] font-bold text-foreground">Recent lessons</h2>
            <DownloadStatementButton fileName={`thanodi-statement-${gaboroneDate(now)}.csv`} rows={csv} />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-[13px]">
              <thead className="border-y border-border bg-surface-subtle text-[11px] font-bold tracking-[0.07em] whitespace-nowrap text-muted-foreground uppercase">
                <tr>
                  <th scope="col" className="px-5 py-3">Date</th>
                  <th scope="col" className="px-3 py-3">Student</th>
                  <th scope="col" className="px-3 py-3">Lesson</th>
                  <th scope="col" className="px-3 py-3 text-right">Paid by parent</th>
                  <th scope="col" className="px-3 py-3 text-right">Thanodi fee ({PLACEHOLDERS.FEE_RATE}%)</th>
                  <th scope="col" className="px-5 py-3 text-right">You earn</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {rows.map((row) => (
                  <tr key={row.lessonId}>
                    <td className="px-5 py-3 whitespace-nowrap text-text-secondary">{formatDateShort(row.date)}</td>
                    <td className="px-3 py-3 font-semibold whitespace-nowrap text-foreground">{row.studentName}</td>
                    <td className="px-3 py-3 text-text-secondary">
                      {row.title} · {row.durationMin} min
                    </td>
                    <td className="px-3 py-3 text-right text-foreground tabular-nums">{formatMoney(row.paid, true)}</td>
                    <td className="px-3 py-3 text-right text-muted-foreground">{PLACEHOLDERS.FEE_AMOUNT}</td>
                    <td className="px-5 py-3 text-right font-bold text-foreground">{PLACEHOLDERS.TUTOR_NET}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </>
  );
}

export default function TutorEarningsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col gap-6" aria-busy="true" aria-label="Loading">
          <div className="h-10 w-40 rounded-xl bg-divider-soft" />
          <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
            <div className="h-56 rounded-2xl bg-divider-soft" />
            <div className="h-56 rounded-xl bg-divider-soft" />
          </div>
          <div className="h-80 rounded-xl bg-divider-soft" />
        </div>
      }
    >
      <TutorEarnings />
    </Suspense>
  );
}
