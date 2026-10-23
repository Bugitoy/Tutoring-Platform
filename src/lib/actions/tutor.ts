"use server";

import { revalidatePath } from "next/cache";
import { nowIso } from "@/lib/clock";
import { payOutNow } from "@/lib/data/earnings";
import { toggleOpenSlot } from "@/lib/data/lessons";
import { getDemoSession, getParent, getStudent, updateTutorProfile } from "@/lib/data/profiles";
import { sendReport } from "@/lib/data/reports";
import { addResource } from "@/lib/data/resources";
import { saveBookingSettings, saveStudentNote } from "@/lib/data/tutorWorkspace";
import type { BookingSettings, ReportInput, ResourceInput, TutorProfileInput } from "@/lib/types";
import { attempt } from "./attempt";

async function tutorId() {
  const { tutor } = await getDemoSession();
  return tutor.id;
}

export async function sendLessonReport(input: ReportInput) {
  return attempt(async () => {
    const { lesson } = await sendReport(input, await tutorId(), nowIso());
    const student = await getStudent(lesson.studentId);
    const parent = student?.linkedParentId ? await getParent(student.linkedParentId) : undefined;
    revalidatePath("/tutor", "layout");
    revalidatePath("/student/lessons", "layout");
    revalidatePath("/parent", "layout");
    return { recipient: parent?.firstName ?? student?.firstName ?? "the family" };
  });
}

export async function toggleSlot(start: string) {
  return attempt(async () => {
    const state = await toggleOpenSlot(await tutorId(), start, nowIso());
    revalidatePath("/tutor/calendar");
    return { state };
  });
}

export async function updateBookingSettings(settings: BookingSettings) {
  return attempt(async () => {
    await saveBookingSettings(await tutorId(), settings);
    revalidatePath("/tutor/calendar");
    return {};
  });
}

export async function updateStudentNote(studentId: string, note: string) {
  return attempt(async () => {
    await saveStudentNote(await tutorId(), studentId, note);
    revalidatePath("/tutor/students");
    return {};
  });
}

export async function uploadResource(input: ResourceInput) {
  return attempt(async () => {
    const resource = await addResource(await tutorId(), input, nowIso());
    revalidatePath("/tutor/resources");
    return { id: resource.id };
  });
}

export async function requestPayout() {
  return attempt(async () => {
    const result = await payOutNow(await tutorId());
    revalidatePath("/tutor/earnings");
    return result;
  });
}

export async function saveTutorProfile(input: TutorProfileInput) {
  return attempt(async () => {
    await updateTutorProfile(await tutorId(), input);
    revalidatePath("/tutor", "layout");
    revalidatePath("/student/tutors", "layout");
    revalidatePath("/parent/tutors", "layout");
    return {};
  });
}
