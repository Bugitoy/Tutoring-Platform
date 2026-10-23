import { maskContactDetails } from "@/lib/contactSafety";
import { formatBookingWhen } from "@/lib/format";
import { LIBRARY_ITEMS } from "@/lib/mock/resources";
import { IDS } from "@/lib/mock/ids";
import { LESSONS } from "@/lib/mock/lessons";
import { MESSAGES, THREADS } from "@/lib/mock/messages";
import { getTutorById } from "@/lib/mock/tutors";
import { getParentById, getStudentById } from "@/lib/mock/users";
import { buildBookingDays } from "@/lib/slots";
import type { FileRef, LessonOffer, Message, OfferInput, Role, Thread } from "@/lib/types";

export type Participant = {
  id: string;
  role: Role | "support";
  name: string;
  firstName: string;
  initials: string;
};

const SUPPORT: Participant = {
  id: IDS.support,
  role: "support",
  name: "Thanodi support",
  firstName: "Thanodi",
  initials: "T",
};

const MAX_FILE_KB = 10 * 1024;

export async function getParticipant(userId: string): Promise<Participant | undefined> {
  if (userId === IDS.support) return SUPPORT;
  const user = getStudentById(userId) ?? getParentById(userId) ?? getTutorById(userId);
  if (!user) return undefined;
  return { id: user.id, role: user.role, name: user.fullName, firstName: user.firstName, initials: user.initials };
}

export async function getThreads(userId: string): Promise<Thread[]> {
  return THREADS.filter((thread) => thread.participantIds.includes(userId)).sort(
    (a, b) => +new Date(b.lastMessageAt) - +new Date(a.lastMessageAt),
  );
}

export async function getThread(threadId: string): Promise<Thread | undefined> {
  return THREADS.find((thread) => thread.id === threadId);
}

export async function getMessages(threadId: string): Promise<Message[]> {
  return MESSAGES.filter((message) => message.threadId === threadId).sort(
    (a, b) => +new Date(a.sentAt) - +new Date(b.sentAt),
  );
}

export async function getMessage(messageId: string): Promise<Message | undefined> {
  return MESSAGES.find((message) => message.id === messageId);
}

function threadFor(threadId: string, senderId: string) {
  const thread = THREADS.find((item) => item.id === threadId);
  if (!thread || !thread.participantIds.includes(senderId)) throw new Error("We couldn’t find that conversation.");
  return thread;
}

/** The demo clock sits before some fixture messages, so new ones never sort above the newest message. */
function nextSentAt(threadId: string, now: string) {
  const latest = MESSAGES.filter((message) => message.threadId === threadId).reduce(
    (max, message) => Math.max(max, new Date(message.sentAt).getTime()),
    0,
  );
  return new Date(Math.max(new Date(now).getTime(), latest)).toISOString();
}

let sequence = 0;
function messageId() {
  sequence += 1;
  return `msg-${Date.now().toString(36)}-${sequence}`;
}

export function previewOf(message: Message): string {
  if (message.kind === "file" && message.file) return `Shared ${message.file.name}`;
  if (message.kind === "lesson_offer" && message.offer) return `Lesson offer · ${formatBookingWhen(message.offer.start)}`;
  return message.text ?? "";
}

function push(thread: Thread, message: Message) {
  MESSAGES.push(message);
  thread.lastMessageAt = message.sentAt;
  thread.preview = previewOf(message);
}

function offerPrice(tutorId: string, durationMin: OfferInput["durationMin"]) {
  const tutor = getTutorById(tutorId);
  if (!tutor) throw new Error("Only tutors can offer lesson times.");
  if (durationMin === 30) return tutor.prices.min30;
  if (durationMin === 45) return tutor.prices.min45;
  return tutor.prices.min60;
}

function assertOfferable(tutorId: string, offer: OfferInput, now: string) {
  const slot = buildBookingDays(tutorId, now)
    .flatMap((day) => day.slots)
    .find((item) => item.start === offer.start);
  if (!slot || slot.state !== "open") throw new Error("That time is no longer free. Pick another one.");
}

export async function sendMessage(
  threadId: string,
  senderId: string,
  input: { text?: string; offer?: OfferInput },
  now: string,
): Promise<{ messages: Message[]; masked: boolean }> {
  const thread = threadFor(threadId, senderId);
  const raw = input.text?.trim() ?? "";
  if (!raw && !input.offer) throw new Error("Write a message first.");
  if (raw.length > 2000) throw new Error("Keep messages under 2,000 characters.");
  if (input.offer) assertOfferable(senderId, input.offer, now);

  const sentAt = nextSentAt(threadId, now);
  const { text, masked } = maskContactDetails(raw);
  const created: Message[] = [];
  if (text) created.push({ id: messageId(), threadId, senderId, sentAt, kind: "text", text });
  if (input.offer) {
    const offer: LessonOffer = {
      ...input.offer,
      price: offerPrice(senderId, input.offer.durationMin),
      status: "open",
    };
    created.push({ id: messageId(), threadId, senderId, sentAt, kind: "lesson_offer", offer });
  }
  for (const message of created) push(thread, message);
  return { messages: created, masked };
}

export async function shareFile(
  threadId: string,
  senderId: string,
  file: Pick<FileRef, "name" | "kind" | "sizeKb">,
  now: string,
): Promise<Message> {
  const thread = threadFor(threadId, senderId);
  const name = file.name.trim();
  if (!name) throw new Error("Choose a file to attach.");
  if (file.sizeKb > MAX_FILE_KB) throw new Error("Files can be up to 10 MB.");

  const message: Message = {
    id: messageId(),
    threadId,
    senderId,
    sentAt: nextSentAt(threadId, now),
    kind: "file",
    file: { id: `file-${Date.now().toString(36)}`, name, kind: file.kind, sizeKb: Math.max(1, Math.round(file.sizeKb)) },
  };
  push(thread, message);

  const tutor = getTutorById(senderId);
  const student = thread.aboutStudentId ? getStudentById(thread.aboutStudentId) : undefined;
  if (tutor && student) {
    const course = LESSONS.filter((lesson) => lesson.tutorId === tutor.id && lesson.studentId === student.id)
      .sort((a, b) => a.start.localeCompare(b.start))
      .at(-1);
    LIBRARY_ITEMS.unshift({
      id: `lib-${message.id}`,
      title: name,
      meta: `Shared by ${tutor.fullName} in Messages`,
      kind: file.kind,
      sizeMb: Math.round((file.sizeKb / 1024) * 10) / 10,
      savedOffline: false,
      tab: "from-tutors",
      curriculumId: course?.curriculumId ?? student.learningProfile.curriculumId,
      subjectId: course?.subjectId ?? student.learningProfile.subjectIds[0] ?? "",
      studentId: student.id,
      addedAt: message.sentAt,
    });
  }
  return message;
}

/** Marks an open offer as taken once checkout books the lesson or sends the payment request. */
export async function acceptOffer(messageId: string, lessonId: string): Promise<void> {
  const message = MESSAGES.find((item) => item.id === messageId);
  if (!message?.offer || message.offer.status !== "open") return;
  message.offer.status = "accepted";
  message.offer.lessonId = lessonId;
}
