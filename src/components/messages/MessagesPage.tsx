import { Suspense } from "react";
import { childKey } from "@/lib/children";
import { nowIso } from "@/lib/clock";
import { getLesson, getLessonsBetween } from "@/lib/data/lessons";
import { getMessages, getParticipant, getThreads, type Participant } from "@/lib/data/messages";
import { getDemoSession, getParent, getStudent } from "@/lib/data/profiles";
import { getTutor } from "@/lib/data/tutors";
import { getLessonsTogether, getTutorRoster } from "@/lib/data/tutorWorkspace";
import {
  formatBookingWhen,
  formatDateShort,
  formatFileSize,
  formatLessonWhen,
  formatMoney,
  formatThreadTime,
  formatTime,
  formatTimeRange,
  gaboroneDate,
  relativeDayWord,
} from "@/lib/format";
import { courseLabel, lessonStatusView, subjectShort } from "@/lib/lessonStatus";
import { canBook } from "@/lib/permissions";
import { buildBookingDays } from "@/lib/slots";
import type { Lesson, Message, Student, Thread } from "@/lib/types";
import { MessagesLayout } from "./MessagesLayout";
import type {
  ChatItem,
  ContextCard,
  ConversationView,
  MessagesViewer,
  OfferComposer,
  OfferView,
  ThreadSummary,
} from "./types";

type SearchParams = Record<string, string | string[] | undefined>;

type MessagesPageProps = {
  viewer: MessagesViewer;
  searchParams: Promise<SearchParams>;
};

const SEARCH_PLACEHOLDER: Record<MessagesViewer, string> = {
  student: "Search tutors",
  parent: "Search",
  tutor: "Search parents and students",
};

const REPLIES = "usually replies within a few hours";

function one(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function lowerFirst(text: string) {
  return text.charAt(0).toLowerCase() + text.slice(1);
}

function plural(count: number, word: string) {
  return `${count} ${word}${count === 1 ? "" : "s"}`;
}

function endMs(lesson: Lesson) {
  return new Date(lesson.start).getTime() + lesson.durationMin * 60000;
}

/** The course they work on together: the latest lesson that wasn't cancelled. */
function currentCourse(lessons: Lesson[]) {
  return [...lessons].reverse().find((lesson) => lesson.status !== "cancelled") ?? lessons.at(-1);
}

function upcoming(lessons: Lesson[], now: string, statuses: Lesson["status"][]) {
  const nowMs = new Date(now).getTime();
  return lessons.find((lesson) => statuses.includes(lesson.status) && endMs(lesson) > nowMs);
}

function bookQuery(params: Record<string, string | undefined>) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) if (value) search.set(key, value);
  return search.toString();
}

type ThreadContext = {
  thread: Thread;
  other: Participant;
  about?: Student;
  tutorId?: string;
  lessons: Lesson[];
};

async function threadContext(thread: Thread, meId: string, viewer: MessagesViewer): Promise<ThreadContext | undefined> {
  const otherId = thread.participantIds.find((id) => id !== meId);
  const other = otherId ? await getParticipant(otherId) : undefined;
  if (!other) return undefined;
  const about = thread.aboutStudentId ? await getStudent(thread.aboutStudentId) : undefined;
  const tutorId = other.role === "tutor" ? other.id : viewer === "tutor" && other.role !== "support" ? meId : undefined;
  const lessons = tutorId && about ? await getLessonsBetween(tutorId, about.id) : [];
  return { thread, other, about, tutorId, lessons };
}

function threadRoleLine(viewer: MessagesViewer, ctx: ThreadContext): string | undefined {
  const { other, about, lessons } = ctx;
  if (other.role === "support") return viewer === "parent" ? undefined : "Support";
  const course = currentCourse(lessons);
  if (viewer === "student" && other.role === "tutor") {
    return course ? `${subjectShort(course.curriculumId, course.subjectId)} tutor` : "Tutor";
  }
  if (viewer === "tutor" && about) {
    return other.role === "parent" ? `Parent of ${about.firstName}` : `Student · ${about.learningProfile.year}`;
  }
  return undefined;
}

function headerRoleLine(viewer: MessagesViewer, ctx: ThreadContext): string | undefined {
  const { other, about, lessons } = ctx;
  if (other.role === "support") return "Support";
  const course = currentCourse(lessons);
  const subject = course ? subjectShort(course.curriculumId, course.subjectId) : undefined;
  const label = course ? courseLabel(course.curriculumId, course.subjectId) : undefined;
  if (viewer === "student") return subject ? `Your ${subject} tutor · ${REPLIES}` : `Tutor · ${REPLIES}`;
  if (viewer === "parent") {
    return about && subject ? `${about.firstName}’s ${subject} tutor · ${REPLIES}` : `Tutor · ${REPLIES}`;
  }
  if (!about) return undefined;
  const who = other.role === "parent" ? `Parent of ${about.firstName}` : about.learningProfile.year;
  return label ? `${who} · ${label}` : who;
}

function headerAction(viewer: MessagesViewer, ctx: ThreadContext, student: Student) {
  const { other, about, lessons, tutorId } = ctx;
  if (other.role === "support" || !tutorId) return undefined;
  if (viewer === "tutor") {
    return about ? { label: `View ${about.firstName}’s progress`, href: `/tutor/students?student=${about.id}` } : undefined;
  }
  const course = currentCourse(lessons);
  const query = bookQuery({
    child: viewer === "parent" && about ? childKey(about) : undefined,
    curriculum: course?.curriculumId,
    subject: course?.subjectId,
  });
  if (viewer === "student" && !canBook(student)) return undefined;
  return { label: "Book a lesson", href: `/${viewer}/tutors/${tutorId}/book${query ? `?${query}` : ""}` };
}

async function offerView(
  message: Message,
  viewer: MessagesViewer,
  mine: boolean,
  ctx: ThreadContext,
  student: Student,
  now: string,
): Promise<OfferView | undefined> {
  const offer = message.offer;
  if (!offer) return undefined;
  const when = `${formatDateShort(offer.start)}, ${formatTimeRange(offer.start, offer.durationMin)} · ${courseLabel(offer.curriculumId, offer.subjectId)}`;
  const price = formatMoney(offer.price);
  const priceLine = mine
    ? `${price} · ${ctx.other.firstName} can accept and pay by card in one tap`
    : `${price} · accept to book it and pay by card in one tap`;

  if (offer.status === "accepted") {
    const lesson = offer.lessonId ? await getLesson(offer.lessonId) : undefined;
    const waiting = lesson?.status === "awaiting_payment";
    return {
      when,
      priceLine: price,
      pill: waiting ? { label: "Accepted · waiting for payment", tone: "warning" } : { label: "Accepted · booked", tone: "success" },
    };
  }
  if (offer.status === "expired" || new Date(offer.start).getTime() <= new Date(now).getTime()) {
    return { when, priceLine: price, pill: { label: "Expired", tone: "neutral" } };
  }
  if (mine) return { when, priceLine, pill: { label: `Waiting for ${ctx.other.firstName}`, tone: "info" } };

  const tutorId = message.senderId;
  const query = bookQuery({
    child: viewer === "parent" && ctx.about ? childKey(ctx.about) : undefined,
    curriculum: offer.curriculumId,
    subject: offer.subjectId,
    start: offer.start,
    offer: message.id,
  });
  if (viewer === "student" && !canBook(student)) {
    return { when, priceLine, pill: { label: "Ask your parent to book this", tone: "neutral" } };
  }
  return { when, priceLine, acceptHref: `/${viewer}/tutors/${tutorId}/book?${query}` };
}

async function chatItems(
  messages: Message[],
  meId: string,
  viewer: MessagesViewer,
  ctx: ThreadContext,
  student: Student,
  now: string,
): Promise<ChatItem[]> {
  const myLast = [...messages].reverse().find((message) => message.senderId === meId);
  const items: ChatItem[] = [];
  let day = "";
  for (const message of messages) {
    const date = gaboroneDate(message.sentAt);
    if (date !== day) {
      day = date;
      items.push({ type: "day", id: `day-${date}`, label: relativeDayWord(message.sentAt, now) ?? formatDateShort(message.sentAt) });
    }
    const mine = message.senderId === meId;
    const meta = `${formatTime(message.sentAt)}${message.id === myLast?.id && message.readAt ? " · Read" : ""}`;
    const sender = mine ? undefined : ctx.other;
    const fromTutor = mine ? viewer === "tutor" : sender?.role === "tutor";
    const file = message.file
      ? {
          name: message.file.name,
          kind: message.file.kind,
          note:
            fromTutor && ctx.about
              ? `${viewer === "student" ? "Added to your Library" : `Added to ${ctx.about.firstName}’s Library`} · ${formatFileSize(message.file.sizeKb)}`
              : `${message.file.kind === "pdf" ? "PDF" : "Image"} · ${formatFileSize(message.file.sizeKb)}`,
        }
      : undefined;
    items.push({
      type: "message",
      id: message.id,
      mine,
      meta,
      text: message.kind === "text" ? message.text : undefined,
      file,
      offer: await offerView(message, viewer, mine, ctx, student, now),
    });
  }
  return items;
}

async function contextCard(viewer: MessagesViewer, ctx: ThreadContext, meId: string, now: string): Promise<ContextCard | undefined> {
  const { other, about, lessons, tutorId } = ctx;
  if (other.role === "support" || !about || !tutorId) return undefined;
  const next = upcoming(lessons, now, ["booked", "live"]);
  const nextLine = next ? `Next lesson: ${lowerFirst(formatLessonWhen(next.start, now))}` : "No lesson booked yet";
  const course = currentCourse(lessons);
  const label = course ? courseLabel(course.curriculumId, course.subjectId) : undefined;

  if (viewer === "parent") {
    const together = await getLessonsTogether(tutorId, about.id);
    return {
      title: "About this tutor",
      lines: [label ? `Teaches ${about.firstName} ${label}` : `Tutor for ${about.firstName}`, nextLine, `${plural(together, "lesson")} together`],
    };
  }

  if (viewer === "student") {
    const booking = upcoming(lessons, now, ["awaiting_payment"]) ?? upcoming(lessons, now, ["live", "booked"]);
    if (!booking) return { title: `Your booking with ${other.firstName}`, lines: ["No lessons booked yet."] };
    const parent = about.linkedParentId ? await getParent(about.linkedParentId) : undefined;
    const status = lessonStatusView(booking, "student", { now, parentName: parent?.firstName });
    return {
      title: `Your booking with ${other.firstName}`,
      lines: [`${formatBookingWhen(booking.start)} · ${subjectShort(booking.curriculumId, booking.subjectId)}`],
      pill: { label: status.label, tone: status.tone },
    };
  }

  const roster = (await getTutorRoster(meId, now)).find((entry) => entry.student.id === about.id);
  const together = roster?.lessonsTogether ?? (await getLessonsTogether(meId, about.id));
  const homework = roster && roster.homework.label !== "None set" ? `Homework ${lowerFirst(roster.homework.label)}` : null;
  return {
    title: `About ${about.firstName}`,
    lines: [
      [about.learningProfile.year, roster?.course ?? label].filter(Boolean).join(" · "),
      nextLine,
      `${plural(together, "lesson")} together`,
      ...(homework ? [homework] : []),
    ],
  };
}

function safetyNote(viewer: MessagesViewer, student: Student) {
  const lead = "Kept on Thanodi.";
  if (viewer === "parent") {
    return {
      lead,
      text: "Messages between tutors and your child are visible to you. Phone numbers and outside links are hidden automatically to keep everyone safe.",
    };
  }
  if (viewer === "tutor") {
    return {
      lead,
      text: "You message parents here. Phone numbers and outside links are hidden automatically, and all lessons are booked and paid through Thanodi.",
    };
  }
  return {
    lead,
    text:
      student.isUnder18 && student.linkedParentId
        ? "Because you’re under 18, your linked parent can see your messages with tutors. Phone numbers and outside links are hidden automatically."
        : "Phone numbers and outside links are hidden automatically to keep everyone safe.",
  };
}

async function offerComposer(ctx: ThreadContext, tutorId: string, now: string): Promise<OfferComposer | undefined> {
  if (ctx.other.role === "support" || !ctx.about) return undefined;
  const tutor = await getTutor(tutorId);
  if (!tutor) return undefined;
  const price = formatMoney(tutor.prices.min60);

  const seen = new Set<string>();
  const courses = [...ctx.lessons].reverse().flatMap((lesson) => {
    const key = `${lesson.curriculumId}:${lesson.subjectId}`;
    if (seen.has(key)) return [];
    seen.add(key);
    return [{ curriculumId: lesson.curriculumId, subjectId: lesson.subjectId, label: courseLabel(lesson.curriculumId, lesson.subjectId), price }];
  });
  if (courses.length === 0) {
    const curriculumId = ctx.about.learningProfile.curriculumId;
    for (const offering of tutor.offerings) {
      if (offering.curriculumId === curriculumId && offering.subjectId) {
        courses.push({ curriculumId, subjectId: offering.subjectId, label: courseLabel(curriculumId, offering.subjectId), price });
      }
    }
  }

  const days = buildBookingDays(tutorId, now).map((day) => ({
    date: day.date,
    label: `${day.weekday} ${day.label}`,
    slots: day.slots
      .filter((slot) => slot.state === "open")
      .map((slot) => ({ start: slot.start, time: slot.time, range: formatTimeRange(slot.start, 60) })),
  }));
  return { recipientName: ctx.other.firstName, days, courses };
}

async function Messages({ viewer, searchParams }: MessagesPageProps) {
  const query = await searchParams;
  const now = nowIso();
  const session = await getDemoSession();
  const me = session[viewer];
  const basePath = `/${viewer}/messages`;
  const threads = await getThreads(me.id);
  const contexts = (await Promise.all(threads.map((thread) => threadContext(thread, me.id, viewer)))).filter(
    (ctx): ctx is ThreadContext => Boolean(ctx),
  );

  const requested = one(query.thread);
  const selected = contexts.find((ctx) => ctx.thread.id === requested) ?? contexts[0];

  const summaries: ThreadSummary[] = contexts.map((ctx) => ({
    id: ctx.thread.id,
    href: `${basePath}?thread=${ctx.thread.id}`,
    name: ctx.other.name,
    initials: ctx.other.initials,
    roleLine: threadRoleLine(viewer, ctx),
    time: formatThreadTime(ctx.thread.lastMessageAt, now),
    preview: ctx.thread.preview,
    support: ctx.other.role === "support",
  }));

  let conversation: ConversationView | undefined;
  if (selected) {
    const messages = await getMessages(selected.thread.id);
    conversation = {
      threadId: selected.thread.id,
      name: selected.other.name,
      initials: selected.other.initials,
      roleLine: headerRoleLine(viewer, selected),
      action: headerAction(viewer, selected, session.student),
      items: await chatItems(messages, me.id, viewer, selected, session.student, now),
      context: await contextCard(viewer, selected, me.id, now),
      safety: safetyNote(viewer, session.student),
      offer: viewer === "tutor" ? await offerComposer(selected, me.id, now) : undefined,
    };
  }

  return (
    <MessagesLayout
      viewer={viewer}
      threads={summaries}
      conversation={conversation}
      threadOpen={Boolean(requested && selected?.thread.id === requested)}
      basePath={basePath}
      searchPlaceholder={SEARCH_PLACEHOLDER[viewer]}
    />
  );
}

export function MessagesPage(props: MessagesPageProps) {
  return (
    <Suspense
      fallback={
        <div className="flex h-[calc(100dvh-8.5rem)] gap-4 sm:h-[calc(100dvh-4.5rem)] lg:h-[calc(100dvh-4rem)]" aria-busy="true" aria-label="Loading">
          <div className="hidden flex-1 rounded-xl bg-divider-soft lg:block" />
          <div className="flex-[3] rounded-xl bg-divider-soft" />
          <div className="hidden flex-1 rounded-xl bg-divider-soft xl:block" />
        </div>
      }
    >
      <Messages {...props} />
    </Suspense>
  );
}
