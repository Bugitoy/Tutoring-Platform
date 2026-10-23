import { Suspense } from "react";
import { io } from "next/cache";
import { AddCardDialog } from "@/components/payments/AddCardDialog";
import { PaymentHistoryTable } from "@/components/payments/PaymentHistoryTable";
import { SavedCards } from "@/components/payments/SavedCards";
import { Avatar } from "@/components/shared/Avatar";
import { PageHeader } from "@/components/shell/PageHeader";
import { getPaymentsForStudent, getStudentCards, getStudentMonthTotals } from "@/lib/data/payments";
import { getDemoSession, getParent } from "@/lib/data/profiles";
import { formatMoney } from "@/lib/format";

const MONTH = "October";

async function StudentPayments() {
  await io();
  const { student } = await getDemoSession();
  const [payments, totals, cards, parent] = await Promise.all([
    getPaymentsForStudent(student.id),
    getStudentMonthTotals(student.id),
    getStudentCards(student),
    student.linkedParentId ? getParent(student.linkedParentId) : undefined,
  ]);

  return (
    <>
      <PageHeader
        title="Payments"
        subtitle={
          parent
            ? "Lessons you pay for yourself, and lessons your parent pays for, in one place."
            : "Lessons you pay for, in one place."
        }
      />
      <div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <section className="rounded-xl border border-border bg-card p-5">
          <h2 className="mb-3 text-[15px] font-bold text-foreground">{MONTH} so far</h2>
          <dl className="flex flex-col gap-2 text-sm">
            <div className="flex justify-between gap-3">
              <dt className="text-text-secondary">Paid by you</dt>
              <dd className="font-bold text-foreground">{formatMoney(totals.paidByStudent, true)}</dd>
            </div>
            {parent ? (
              <>
                <div className="flex justify-between gap-3">
                  <dt className="text-text-secondary">Paid by {parent.firstName}</dt>
                  <dd className="font-bold text-foreground">{formatMoney(totals.paidByParent, true)}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-text-secondary">Waiting for {parent.firstName}</dt>
                  <dd className="font-bold text-status-warning-fg">{formatMoney(totals.waiting, true)}</dd>
                </div>
              </>
            ) : null}
          </dl>
        </section>

        <section className="rounded-xl border border-border bg-card p-5">
          <h2 className="mb-3 text-[15px] font-bold text-foreground">{cards.length > 1 ? "Your cards" : "Your card"}</h2>
          {cards.length > 0 ? (
            <SavedCards cards={cards} variant="student" />
          ) : (
            <p className="text-sm text-muted-foreground">Add a card to pay for lessons yourself.</p>
          )}
          <div className="mt-3">
            <AddCardDialog role="student" cardName={student.fullName} />
          </div>
        </section>

        {parent ? (
          <section className="rounded-xl bg-accent p-5 md:col-span-2 xl:col-span-1">
            <h2 className="mb-3 text-[15px] font-bold text-foreground">Linked parent</h2>
            <div className="flex items-start gap-3">
              <Avatar initials={parent.initials} size={36} className="bg-card" />
              <div>
                <p className="text-[15px] font-bold text-foreground">{parent.fullName}</p>
                <p className="text-[13px] text-text-secondary">Can pay for your lessons and sees your reports</p>
              </div>
            </div>
            <p className="mt-3 text-[13px] text-text-secondary">
              At checkout you choose “I’ll pay” or “Ask {parent.firstName} to pay” for each lesson.
            </p>
          </section>
        ) : null}
      </div>

      <PaymentHistoryTable payments={payments} variant="student" />
    </>
  );
}

export default function StudentPaymentsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col gap-6" aria-busy="true" aria-label="Loading">
          <div className="h-16 rounded-xl bg-divider-soft" />
          <div className="grid gap-4 md:grid-cols-3">
            <div className="h-40 rounded-xl bg-divider-soft" />
            <div className="h-40 rounded-xl bg-divider-soft" />
            <div className="h-40 rounded-xl bg-divider-soft" />
          </div>
          <div className="h-72 rounded-xl bg-divider-soft" />
        </div>
      }
    >
      <StudentPayments />
    </Suspense>
  );
}
