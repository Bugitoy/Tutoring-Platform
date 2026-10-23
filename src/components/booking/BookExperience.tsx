"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { payAndBook, sendParentRequest } from "@/lib/actions/booking";
import { CardSection } from "@/components/booking/CardSection";
import { OrderSummary } from "@/components/booking/OrderSummary";
import { SlotPicker } from "@/components/booking/SlotPicker";
import { WhoPaysPicker } from "@/components/booking/WhoPaysPicker";
import { SectionCard } from "@/components/shared/SectionCard";
import { PageHeader } from "@/components/shell/PageHeader";
import { gaboroneDate, formatMoney } from "@/lib/format";
import { offeringTag } from "@/lib/matching";
import type { BookingDay } from "@/lib/slots";
import type { BookingInput, SavedCard } from "@/lib/types";

type BookExperienceProps = {
  role: "student" | "parent";
  backHref: string;
  tutorId: string;
  tutorName: string;
  initials: string;
  days: BookingDay[];
  initialStart: string | null;
  /** The tutor's lesson offer from Messages that this checkout accepts. */
  offerId?: string;
  curriculumId: string;
  subjectId: string;
  price: number;
  allowSelf: boolean;
  allowParent: boolean;
  parentName: string | null;
  linked: boolean;
  cardName: string;
  savedCard?: SavedCard;
  paymentsHref: string;
  calendarHref: string;
  studentId: string;
};

export function BookExperience({
  role,
  backHref,
  tutorId,
  tutorName,
  initials,
  days,
  initialStart,
  offerId,
  curriculumId,
  subjectId,
  price,
  allowSelf,
  allowParent,
  parentName,
  linked,
  cardName,
  savedCard,
  paymentsHref,
  calendarHref,
  studentId,
}: BookExperienceProps) {
  const router = useRouter();
  const [start, setStart] = useState<string | null>(initialStart);
  const [goal, setGoal] = useState("");
  const [payer, setPayer] = useState<"student" | "parent">(allowSelf ? "student" : "parent");
  const [pending, setPending] = useState(false);

  const askingParent = role === "student" && payer === "parent";
  const showCard = !askingParent;
  const subjectLabel = offeringTag({ curriculumId, subjectId });
  const amount = formatMoney(price, true);

  const policy =
    role === "parent"
      ? "Free cancellation up to 12 hours before the lesson. Your parent dashboard gets the tutor’s notes after class."
      : linked && parentName
        ? `Free cancellation up to 12 hours before the lesson. You get a lesson summary after class. Because your account is linked, ${parentName} sees it too.`
        : "Free cancellation up to 12 hours before the lesson. You get a lesson summary after class.";

  function input(): BookingInput | null {
    if (!start) return null;
    return {
      studentId,
      tutorId,
      start,
      durationMin: 60,
      curriculumId,
      subjectId,
      title: subjectLabel.split(" · ")[1] || "Lesson",
      goal: goal.trim() || undefined,
      payer: role === "parent" || askingParent ? "parent" : "student",
    };
  }

  async function pay() {
    const booking = input();
    if (!booking || pending) return;
    setPending(true);
    try {
      const result = await payAndBook(booking, start === initialStart ? offerId : undefined);
      toast.success("Lesson booked");
      router.push(`${calendarHref}?date=${gaboroneDate(result.start)}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not book this lesson.");
      setPending(false);
    }
  }

  async function requestPay() {
    const booking = input();
    if (!booking || pending) return;
    setPending(true);
    try {
      const result = await sendParentRequest(booking, start === initialStart ? offerId : undefined);
      toast.success("Request sent. We’ll hold this time for 12 hours.");
      router.push(`${calendarHref}?date=${gaboroneDate(result.start)}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not send the request.");
      setPending(false);
    }
  }

  const stepTwo = role === "student" && allowParent ? 2 : null;
  const cardStep = showCard ? (stepTwo ? 3 : 2) : null;

  return (
    <>
      <PageHeader title="Book your lesson" backHref={backHref} backLabel="Back to tutors" />
      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="flex flex-col gap-4">
          <SectionCard title="1. Pick a time">
            <SlotPicker days={days} start={start} goal={goal} onStartChange={setStart} onGoalChange={setGoal} />
          </SectionCard>

          {stepTwo && parentName ? (
            <SectionCard title="2. Who’s paying?">
              <WhoPaysPicker
                value={payer}
                parentName={parentName}
                allowSelf={allowSelf}
                allowParent={allowParent}
                onChange={setPayer}
              />
            </SectionCard>
          ) : null}

          {showCard && cardStep ? (
            <CardSection
              step={cardStep}
              formId="card-form"
              cardName={cardName}
              savedCard={savedCard}
              onSubmit={() => void pay()}
            />
          ) : null}
        </div>

        <OrderSummary
          initials={initials}
          name={tutorName}
          subjectLabel={subjectLabel}
          start={start}
          price={price}
          policy={policy}
          pending={pending}
          disabled={!start}
          paymentsHref={paymentsHref}
          submitLabel={askingParent && parentName ? `Send request to ${parentName}` : `Pay ${amount} and book`}
          formId={showCard ? "card-form" : undefined}
          onPress={askingParent ? () => void requestPay() : undefined}
        />
      </div>
    </>
  );
}
