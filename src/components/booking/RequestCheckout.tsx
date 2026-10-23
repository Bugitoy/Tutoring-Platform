"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CardSection } from "@/components/booking/CardSection";
import { OrderSummary } from "@/components/booking/OrderSummary";
import { SectionCard } from "@/components/shared/SectionCard";
import { PageHeader } from "@/components/shell/PageHeader";
import { payRequest } from "@/lib/actions/booking";
import { formatMoney, gaboroneDate } from "@/lib/format";
import type { SavedCard } from "@/lib/types";

type RequestCheckoutProps = {
  requestId: string;
  childName: string;
  tutorName: string;
  initials: string;
  subjectLabel: string;
  /** "Physics with Thato Sebego · Sun 1 Nov, 10:00 · 60 min" */
  lessonLine: string;
  goal?: string;
  start: string;
  price: number;
  cardName: string;
  savedCard?: SavedCard;
};

export function RequestCheckout({
  requestId,
  childName,
  tutorName,
  initials,
  subjectLabel,
  lessonLine,
  goal,
  start,
  price,
  cardName,
  savedCard,
}: RequestCheckoutProps) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function pay() {
    if (pending) return;
    setPending(true);
    try {
      const result = await payRequest(requestId);
      toast.success("Lesson booked");
      router.push(`/parent/calendar?date=${gaboroneDate(result.start)}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not pay for this lesson.");
      setPending(false);
    }
  }

  return (
    <>
      <PageHeader title="Review and pay" backHref="/parent" backLabel="Back to home" />
      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="flex flex-col gap-4">
          <SectionCard title={`1. The lesson ${childName} booked`}>
            <p className="text-sm font-semibold text-foreground">{lessonLine}</p>
            {goal ? <p className="mt-1 text-[13px] text-muted-foreground">{childName}’s goal: “{goal}”</p> : null}
            <p className="mt-2 text-[13px] text-muted-foreground">
              {childName} booked this lesson himself. The time is held for 12 hours.
            </p>
          </SectionCard>
          <CardSection step={2} formId="request-card-form" cardName={cardName} savedCard={savedCard} onSubmit={() => void pay()} />
        </div>
        <OrderSummary
          initials={initials}
          name={tutorName}
          subjectLabel={subjectLabel}
          start={start}
          price={price}
          policy="Free cancellation up to 12 hours before the lesson. Your parent dashboard gets the tutor’s notes after class."
          pending={pending}
          disabled={false}
          paymentsHref="/parent/payments"
          submitLabel={`Pay ${formatMoney(price, true)} and book`}
          formId="request-card-form"
        />
      </div>
    </>
  );
}
