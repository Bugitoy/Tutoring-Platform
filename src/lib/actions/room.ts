"use server";

import { revalidatePath } from "next/cache";
import { nowIso } from "@/lib/clock";
import { endLesson, markLessonChatRead, sendLessonChat, setVideoQuality } from "@/lib/data/room";
import { leaveHref, type RoomRole } from "@/lib/room";
import type { VideoQuality } from "@/lib/types";
import { attempt, sessionUserId } from "./attempt";

const QUALITIES = new Set<VideoQuality>(["hd", "auto", "data_saver"]);

export async function postLessonChat(lessonId: string, role: RoomRole, text: string) {
  return attempt(async () => sendLessonChat(lessonId, await sessionUserId(role), text, nowIso()));
}

export async function readLessonChat(lessonId: string, role: RoomRole) {
  return attempt(async () => {
    await markLessonChatRead(lessonId, await sessionUserId(role), nowIso());
    return {};
  });
}

// TODO(spec): tutors have no quality preference in their profile; only the student's choice is remembered.
export async function saveRoomQuality(role: RoomRole, quality: VideoQuality) {
  return attempt(async () => {
    if (!QUALITIES.has(quality)) throw new Error("Choose HD, Auto or Data saver.");
    if (role === "student") {
      await setVideoQuality(await sessionUserId("student"), quality);
      revalidatePath("/student/profile");
    }
    return {};
  });
}

export async function leaveLessonRoom(lessonId: string, role: RoomRole) {
  return attempt(async () => {
    if (role === "tutor") {
      await endLesson(lessonId, await sessionUserId("tutor"));
      revalidatePath("/tutor", "layout");
      revalidatePath("/student", "layout");
      revalidatePath("/parent", "layout");
    }
    return { href: leaveHref(role, lessonId) };
  });
}
