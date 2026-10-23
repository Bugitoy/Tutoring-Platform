import { EmptyState } from "@/components/shared/EmptyState";
import { StatusPill, type StatusTone } from "@/components/shared/StatusPill";
import { PLACEHOLDERS } from "@/config/placeholders";
import { formatDayMonth, formatMoney } from "@/lib/format";
import type { Payment } from "@/lib/types";
import { ReceiptButton } from "./ReceiptButton";

type PaymentHistoryTableProps = {
  payments: Payment[];
  /** Students see who paid; parents see which card was charged. */
  variant: "student" | "parent";
};

const STATUS: Record<Payment["status"], { label: string; tone: StatusTone }> = {
  paid: { label: "Paid", tone: "success" },
  waiting: { label: "Waiting", tone: "warning" },
  refunded: { label: "Refunded", tone: "neutral" },
};

const HEAD = "px-4 py-3 text-left text-[11px] font-bold tracking-[0.07em] text-muted-foreground uppercase";

export function PaymentHistoryTable({ payments, variant }: PaymentHistoryTableProps) {
  return (
    <section aria-labelledby="payment-history" className="overflow-hidden rounded-xl border border-border bg-card">
      <h2 id="payment-history" className="px-5 pt-5 pb-4 text-[17px] font-bold text-foreground">
        Payment history
      </h2>
      {payments.length === 0 ? (
        <div className="px-5 pb-5">
          <EmptyState title="No payments yet" description="Lessons you book and pay for appear here with a receipt." />
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-sm">
            <thead className="bg-surface-subtle">
              <tr>
                <th scope="col" className={HEAD}>Date</th>
                <th scope="col" className={HEAD}>{variant === "student" ? "Lesson" : "For"}</th>
                <th scope="col" className={HEAD}>{variant === "student" ? "Paid by" : "Card"}</th>
                <th scope="col" className={HEAD}>Status</th>
                <th scope="col" className={`${HEAD} text-right`}>Amount</th>
                <th scope="col" className={`${HEAD} text-right`}>Receipt</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment) => {
                const status = STATUS[payment.status];
                return (
                  <tr key={payment.id} className="border-t border-border">
                    <td className="px-4 py-3.5 whitespace-nowrap text-text-secondary">{formatDayMonth(payment.date)}</td>
                    <td className="px-4 py-3.5">
                      <p className="font-semibold text-foreground">{payment.description}</p>
                      <p className="text-xs text-muted-foreground">{payment.detail}</p>
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap text-text-secondary">
                      {variant === "student" ? payment.payerLabel : payment.cardLabel || "—"}
                    </td>
                    <td className="px-4 py-3.5">
                      <StatusPill tone={status.tone}>{status.label}</StatusPill>
                    </td>
                    <td className="px-4 py-3.5 text-right font-bold whitespace-nowrap text-foreground">
                      {payment.amount === null ? PLACEHOLDERS.PLUS_PRICE : formatMoney(payment.amount, true)}
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      {payment.receiptUrl ? (
                        <ReceiptButton label={`${payment.description}, ${formatDayMonth(payment.date)}`} />
                      ) : (
                        <span aria-label="No receipt yet" className="text-muted-foreground">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
