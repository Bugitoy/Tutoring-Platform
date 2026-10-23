import { Suspense } from "react";
import { io } from "next/cache";
import { AddCardDialog } from "@/components/payments/AddCardDialog";
import { MonthlyStatementCheckbox } from "@/components/payments/MonthlyStatementCheckbox";
import { PaymentHistoryTable } from "@/components/payments/PaymentHistoryTable";
import { PlanActions } from "@/components/payments/PlanActions";
import { SavedCards } from "@/components/payments/SavedCards";
import { NavyCard } from "@/components/shared/NavyCard";
import { PageHeader } from "@/components/shell/PageHeader";
import { PLACEHOLDERS } from "@/config/placeholders";
import { defaultCard, getParentMonthTotals, getPaymentsForParent } from "@/lib/data/payments";
import { getChildrenForParent, getDemoSession } from "@/lib/data/profiles";
import { formatInTimeZone } from "date-fns-tz";
import { TIMEZONE, formatMoney, listNames } from "@/lib/format";

const MONTH = "October";

async function ParentPayments() {
  await io();
  const { parent } = await getDemoSession();
  const [payments, totals, children] = await Promise.all([
    getPaymentsForParent(parent.id),
    getParentMonthTotals(parent.id),
    getChildrenForParent(parent.id),
  ]);
  const card = defaultCard(parent);
  const plan = parent.plan;
  const covered = children.filter((child) => plan?.covers.includes(child.id)).map((child) => child.firstName);

  return (
    <>
      <PageHeader title="Payments" />
      <div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {plan ? (
          <NavyCard eyebrow={`${plan.name} · Active`} className="md:col-span-2 xl:col-span-1">
            <p className="text-[22px] font-bold text-on-navy">{PLACEHOLDERS.PLUS_PRICE} / month</p>
            <p className="mt-2 text-sm text-on-navy-muted">
              Covers {listNames(covered)}: past papers, saved lesson notes and the AI study helper.
            </p>
            <p className="mt-2 text-xs text-on-navy-faint">
              Renews {formatInTimeZone(new Date(`${plan.renewsOn}T12:00:00+02:00`), TIMEZONE, "d MMMM")}
              {card ? ` on card ending ${card.last4}` : ""}
            </p>
            <PlanActions />
          </NavyCard>
        ) : null}

        <section className="rounded-xl border border-border bg-card p-5">
          <h2 className="mb-3 text-[15px] font-bold text-foreground">Saved cards</h2>
          {parent.cards.length > 0 ? (
            <SavedCards cards={parent.cards} variant="parent" />
          ) : (
            <p className="text-sm text-muted-foreground">Add a card to pay for lessons.</p>
          )}
          <div className="mt-3">
            <AddCardDialog role="parent" cardName={parent.fullName} />
          </div>
        </section>

        <section className="rounded-xl border border-border bg-card p-5">
          <h2 className="mb-2 text-[15px] font-bold text-foreground">{MONTH} so far</h2>
          <p className="mb-3 text-[28px] leading-none font-bold text-foreground">{PLACEHOLDERS.MONTH_TOTAL}</p>
          <dl className="mb-4 flex flex-col gap-1.5 text-sm">
            <div className="flex justify-between gap-3">
              <dt className="text-text-secondary">Lessons ({totals.lessonsCount})</dt>
              <dd className="font-bold text-foreground">{formatMoney(totals.lessonsAmount)}</dd>
            </div>
            {plan ? (
              <div className="flex justify-between gap-3">
                <dt className="text-text-secondary">{plan.name}</dt>
                <dd className="font-bold text-foreground">{PLACEHOLDERS.PLUS_PRICE}</dd>
              </div>
            ) : null}
          </dl>
          <MonthlyStatementCheckbox checked={parent.monthlyStatement ?? false} />
        </section>
      </div>

      <PaymentHistoryTable payments={payments} variant="parent" />
    </>
  );
}

export default function ParentPaymentsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col gap-6" aria-busy="true" aria-label="Loading">
          <div className="h-12 rounded-xl bg-divider-soft" />
          <div className="grid gap-4 md:grid-cols-3">
            <div className="h-52 rounded-xl bg-divider-soft" />
            <div className="h-52 rounded-xl bg-divider-soft" />
            <div className="h-52 rounded-xl bg-divider-soft" />
          </div>
          <div className="h-72 rounded-xl bg-divider-soft" />
        </div>
      }
    >
      <ParentPayments />
    </Suspense>
  );
}
