"use server";

import { revalidatePath } from "next/cache";
import { rescheduleLesson } from "@/lib/data/lessons";
import { markHomeworkDone } from "@/lib/data/reports";

export async function moveLesson(lessonId: string, start: string) {
  const lesson = await rescheduleLesson(lessonId, start);
  revalidatePath("/student/lessons", "layout");
  revalidatePath("/parent", "layout");
  revalidatePath("/tutor", "layout");
  return { start: lesson.start };
}

export async function completeHomework(lessonId: string) {
  await markHomeworkDone(lessonId);
  revalidatePath(`/student/lessons/${lessonId}`);
  revalidatePath("/parent");
  revalidatePath("/parent/reports");
}
