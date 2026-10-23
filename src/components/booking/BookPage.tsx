import Link from "next/link";
import { notFound } from "next/navigation";
import { BookExperience } from "@/components/booking/BookExperience";
import { RequestCheckout } from "@/components/booking/RequestCheckout";
import { EmptyState } from "@/components/shared/EmptyState";
import { PageHeader } from "@/components/shell/PageHeader";
import { buttonVariants } from "@/components/ui/button";
import { pickChild } from "@/lib/children";
import { getCurriculum } from "@/lib/curricula";
import { getLesson, getPaymentRequest } from "@/lib/data/lessons";
import { getMessage } from "@/lib/data/messages";
import { getTutor } from "@/lib/data/tutors";
import { getChildrenForParent, getDemoSession, getParent, getStudent } from "@/lib/data/profiles";
import { formatBookingWhen } from "@/lib/format";
import { subjectShort } from "@/lib/lessonStatus";
import { offeringTag } from "@/lib/matching";
import { canAskParentToPay, canBook, canPayOwnCard } from "@/lib/permissions";
import { buildBookingDays, firstOpenSlot } from "@/lib/slots";
import type { Parent, Tutor, TutorOffering } from "@/lib/types";

type Role = "student" | "parent";

type BookPageProps = {
  role: Role;
  params: Promise<{ tutorId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function one(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function queryString(params: Record<string, string | string[] | undefined>) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    const item = one(value);
    if (item) search.set(key, item);
  }
  const text = search.toString();
  return text ? `?${text}` : "";
}

function resolveSubject(tutor: Tutor, curriculumParam?: string, subjectParam?: string) {
  const curriculumId =
    curriculumParam && curriculumParam !== "any" ? curriculumParam : (tutor.offerings[0]?.curriculumId ?? "bgcse");
  if (subjectParam && subjectParam !== "any") return { curriculumId, subjectId: subjectParam };
  const offering =
    tutor.offerings.find((item) => item.curriculumId === curriculumId && item.subjectId) ??
    tutor.offerings.find((item): item is TutorOffering & { subjectId: string } => Boolean(item.subjectId));
  return {
    curriculumId: offering?.curriculumId ?? curriculumId,
    subjectId: offering?.subjectId ?? getCurriculum(curriculumId)?.subjects[0]?.id ?? "mathematics",
  };
}

async function RequestCheckoutPage({ requestId, tutor, parent }: { requestId: string; tutor: Tutor; parent: Parent }) {
  const request = await getPaymentRequest(requestId);
  const lesson = request ? await getLesson(request.lessonId) : undefined;
  const child = request ? await getStudent(request.fromStudentId) : undefined;

  if (!request || !lesson || !child || request.toParentId !== parent.id || lesson.tutorId !== tutor.id || request.status !== "pending") {
    return (
      <>
        <PageHeader title="Review and pay" backHref="/parent" backLabel="Back to home" />
        <EmptyState
          title="This request is no longer waiting"
          description="It may have been paid, declined or expired. Your calendar shows the latest."
          action={
            <Link href="/parent/calendar" className={buttonVariants({ variant: "outline", size: "sm" })}>
              Open calendar
            </Link>
          }
        />
      </>
    );
  }

  const subject = subjectShort(lesson.curriculumId, lesson.subjectId);
  return (
    <RequestCheckout
      requestId={request.id}
      childName={child.firstName}
      tutorName={tutor.fullName}
      initials={tutor.initials}
      subjectLabel={offeringTag({ curriculumId: lesson.curriculumId, subjectId: lesson.subjectId })}
      lessonLine={`${subject} with ${tutor.fullName} · ${formatBookingWhen(lesson.start)} · ${lesson.durationMin} min`}
      goal={lesson.goal}
      start={lesson.start}
      price={request.amount}
      cardName={parent.fullName}
      savedCard={parent.cards.find((card) => card.isDefault) ?? parent.cards[0]}
    />
  );
}

export async function BookPage({ role, params, searchParams }: BookPageProps) {
  const [{ tutorId }, query] = await Promise.all([params, searchParams]);
  const tutor = await getTutor(tutorId);
  if (!tutor) notFound();

  const session = await getDemoSession();
  const base = role === "student" ? "/student/tutors" : "/parent/tutors";
  const backHref = `${base}${queryString(query)}`;

  if (role === "student" && !canBook(session.student)) {
    return (
      <>
        <PageHeader title="Book your lesson" backHref={backHref} backLabel="Back to tutors" />
        <p className="text-sm text-muted-foreground">Ask a parent to book this lesson.</p>
      </>
    );
  }

  const requestId = one(query.request);
  if (role === "parent" && requestId) {
    return <RequestCheckoutPage requestId={requestId} tutor={tutor} parent={session.parent} />;
  }

  const kids = role === "parent" ? await getChildrenForParent(session.parent.id) : [];
  const initialChild =
    role === "student" ? session.student : (pickChild(kids, one(query.child)) ?? kids[0] ?? session.student);

  const linkedParent = initialChild.linkedParentId ? await getParent(initialChild.linkedParentId) : undefined;
  const payingParent = role === "parent" ? session.parent : linkedParent;
  const subject = resolveSubject(tutor, one(query.curriculum), one(query.subject));
  const days = buildBookingDays(tutor.id);
  const requestedStart = one(query.start);
  const startOpen = days.some((day) => day.slots.some((slot) => slot.start === requestedStart && slot.state === "open"));
  const offerMessage = one(query.offer) ? await getMessage(one(query.offer)!) : undefined;
  const offerId =
    offerMessage?.offer?.status === "open" && offerMessage.senderId === tutor.id && offerMessage.offer.start === requestedStart
      ? offerMessage.id
      : undefined;
  const savedCard =
    role === "parent"
      ? (session.parent.cards.find((card) => card.isDefault) ?? session.parent.cards[0])
      : session.student.card;

  return (
    <BookExperience
      role={role}
      backHref={backHref}
      tutorId={tutor.id}
      tutorName={tutor.fullName}
      initials={tutor.initials}
      days={days}
      initialStart={startOpen && requestedStart ? requestedStart : firstOpenSlot(days)}
      offerId={startOpen ? offerId : undefined}
      curriculumId={subject.curriculumId}
      subjectId={subject.subjectId}
      price={tutor.prices.min60}
      allowSelf={role === "student" && canPayOwnCard(session.student)}
      allowParent={role === "student" && canAskParentToPay(session.student)}
      parentName={payingParent?.firstName ?? null}
      linked={Boolean(initialChild.linkedParentId)}
      cardName={role === "parent" ? session.parent.fullName : session.student.fullName}
      savedCard={savedCard}
      paymentsHref={role === "parent" ? "/parent/payments" : "/student/payments"}
      calendarHref={role === "parent" ? "/parent/calendar" : "/student/lessons"}
      studentId={initialChild.id}
    />
  );
}
