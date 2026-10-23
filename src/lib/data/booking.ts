import { formatInTimeZone } from "date-fns-tz";
import { getTutorById } from "@/lib/mock/tutors";
import { LESSONS, PAYMENT_REQUESTS } from "@/lib/mock/lessons";
import { MOCK_NOW_ISO } from "@/lib/mock/ids";
import { getStudentById } from "@/lib/mock/users";
import { TIMEZONE } from "@/lib/format";
import {
  recordLessonPaid,
  recordPaymentRequested,
  recordRequestDeclined,
  recordRequestPaid,
} from "./payments";
import type { BookingInput, Lesson, PaymentRequest } from "@/lib/types";

const BLOCKING = new Set<Lesson["status"]>(["booked", "live", "awaiting_payment"]);

function id(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 8)}`;
}

function priceFor(input: BookingInput) {
  const tutor = getTutorById(input.tutorId);
  if (!tutor) return 0;
  if (input.durationMin === 30) return tutor.prices.min30;
  if (input.durationMin === 45) return tutor.prices.min45;
  return tutor.prices.min60;
}

function assertSlotFree(input: BookingInput) {
  const taken = LESSONS.some(
    (lesson) =>
      lesson.tutorId === input.tutorId && lesson.start === input.start && BLOCKING.has(lesson.status),
  );
  if (taken) throw new Error("That time was just booked.");
}

export async function createBooking(input: BookingInput): Promise<Lesson> {
  assertSlotFree(input);
  const lesson: Lesson = {
    id: id("lesson"),
    studentId: input.studentId,
    tutorId: input.tutorId,
    curriculumId: input.curriculumId,
    subjectId: input.subjectId,
    title: input.title,
    goal: input.goal,
    start: input.start,
    durationMin: input.durationMin,
    status: "booked",
    payer: input.payer,
    paymentId: id("pay"),
    price: priceFor(input),
  };
  LESSONS.push(lesson);
  recordLessonPaid(lesson, MOCK_NOW_ISO);
  return lesson;
}

export async function requestParentPayment(input: BookingInput): Promise<PaymentRequest> {
  assertSlotFree(input);
  const student = getStudentById(input.studentId);
  if (!student?.linkedParentId) throw new Error("This student has no linked parent.");

  const price = priceFor(input);
  const requestId = id("preq");
  const expiresAt = formatInTimeZone(
    new Date(new Date(MOCK_NOW_ISO).getTime() + 12 * 60 * 60 * 1000),
    TIMEZONE,
    "yyyy-MM-dd'T'HH:mm:ssXXX",
  );

  const lesson: Lesson = {
    id: id("lesson"),
    studentId: input.studentId,
    tutorId: input.tutorId,
    curriculumId: input.curriculumId,
    subjectId: input.subjectId,
    title: input.title,
    goal: input.goal,
    start: input.start,
    durationMin: input.durationMin,
    status: "awaiting_payment",
    payer: "parent",
    paymentRequestId: requestId,
    price,
  };

  const request: PaymentRequest = {
    id: requestId,
    lessonId: lesson.id,
    fromStudentId: input.studentId,
    toParentId: student.linkedParentId,
    amount: price,
    expiresAt,
    status: "pending",
  };

  LESSONS.push(lesson);
  PAYMENT_REQUESTS.push(request);
  recordPaymentRequested(lesson, MOCK_NOW_ISO);
  return request;
}

function pendingRequest(requestId: string) {
  const request = PAYMENT_REQUESTS.find((item) => item.id === requestId);
  if (!request || request.status !== "pending") throw new Error("This request is no longer waiting for payment.");
  const lesson = LESSONS.find((item) => item.id === request.lessonId);
  if (!lesson) throw new Error("We couldn’t find the lesson for this request.");
  return { request, lesson };
}

export async function payPaymentRequest(requestId: string): Promise<Lesson> {
  const { request, lesson } = pendingRequest(requestId);
  request.status = "paid";
  lesson.status = "booked";
  lesson.paymentId = id("pay");
  recordRequestPaid(lesson, MOCK_NOW_ISO);
  return lesson;
}

export async function declinePaymentRequest(requestId: string, message?: string): Promise<Lesson> {
  const { request, lesson } = pendingRequest(requestId);
  request.status = "declined";
  request.declineMessage = message?.trim() || undefined;
  lesson.status = "cancelled";
  recordRequestDeclined(lesson);
  return lesson;
}
