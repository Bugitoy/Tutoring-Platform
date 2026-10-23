"use server";

import { revalidatePath } from "next/cache";
import {
  createBooking,
  declinePaymentRequest,
  payPaymentRequest,
  requestParentPayment,
} from "@/lib/data/booking";
import { acceptOffer } from "@/lib/data/messages";
import type { BookingInput } from "@/lib/types";

function refresh() {
  revalidatePath("/student/lessons");
  revalidatePath("/student/payments");
  revalidatePath("/parent");
  revalidatePath("/parent/calendar");
  revalidatePath("/parent/payments");
  revalidatePath("/tutor");
  revalidatePath("/tutor/calendar");
}

function refreshMessages() {
  revalidatePath("/student/messages");
  revalidatePath("/parent/messages");
  revalidatePath("/tutor/messages");
}

export async function payAndBook(input: BookingInput, offerId?: string) {
  await new Promise((resolve) => setTimeout(resolve, 800));
  const lesson = await createBooking(input);
  if (offerId) {
    await acceptOffer(offerId, lesson.id);
    refreshMessages();
  }
  refresh();
  return { lessonId: lesson.id, start: lesson.start };
}

export async function sendParentRequest(input: BookingInput, offerId?: string) {
  const request = await requestParentPayment(input);
  if (offerId) {
    await acceptOffer(offerId, request.lessonId);
    refreshMessages();
  }
  refresh();
  return { requestId: request.id, start: input.start };
}

export async function payRequest(requestId: string) {
  await new Promise((resolve) => setTimeout(resolve, 800));
  const lesson = await payPaymentRequest(requestId);
  refresh();
  refreshMessages();
  return { lessonId: lesson.id, start: lesson.start };
}

export async function declineRequest(requestId: string, message?: string) {
  const lesson = await declinePaymentRequest(requestId, message);
  refresh();
  refreshMessages();
  return { lessonId: lesson.id };
}
