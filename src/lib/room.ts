import { DATA_NOTES, MODE_BADGES, type RoomMode } from "@/config/room";
import type { Lesson, LessonChatMessage, Role, VideoQuality } from "./types";

export type RoomRole = "student" | "tutor";

export type RoomAccess =
  | { ok: true; role: RoomRole }
  | { ok: false; reason: "parent" | "not_participant" | "ended" | "not_paid" };

/** `?as=tutor` picks the demo tutor; everyone else is the demo student. */
// TODO(spec): the viewer comes from the signed-in session once auth exists.
export function roomRoleParam(as: string | undefined): Role {
  return as === "tutor" || as === "parent" ? as : "student";
}

/** Parents can't join; only the lesson's own student and tutor can, while the lesson is on. */
export function roomAccess(lesson: Lesson, role: Role, userId: string): RoomAccess {
  if (role === "parent") return { ok: false, reason: "parent" };
  const participant = role === "tutor" ? lesson.tutorId === userId : lesson.studentId === userId;
  if (!participant) return { ok: false, reason: "not_participant" };
  if (lesson.status === "awaiting_payment") return { ok: false, reason: "not_paid" };
  if (lesson.status !== "booked" && lesson.status !== "live") return { ok: false, reason: "ended" };
  return { ok: true, role };
}

/** "24:13", or "1:02:05" past the hour. */
export function formatElapsed(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;
  const pad = (value: number) => String(value).padStart(2, "0");
  return hours > 0 ? `${hours}:${pad(minutes)}:${pad(seconds)}` : `${pad(minutes)}:${pad(seconds)}`;
}

/** Time since the scheduled start; a lesson joined early counts from when you joined. */
export function elapsedMs(start: string, now: number, joinedAt: number): number {
  const startMs = new Date(start).getTime();
  return Math.max(0, now >= startMs ? now - startMs : now - joinedAt);
}

export function roomMode(quality: VideoQuality, voiceOnly: boolean): RoomMode {
  return voiceOnly ? "voice_only" : quality;
}

export function dataNote(quality: VideoQuality, voiceOnly: boolean): string {
  return DATA_NOTES[roomMode(quality, voiceOnly)];
}

export function modeBadge(quality: VideoQuality, voiceOnly: boolean): string {
  return MODE_BADGES[roomMode(quality, voiceOnly)];
}

/** Students go back to My lessons; tutors go straight to the after-class report. */
export function leaveHref(role: RoomRole, lessonId: string): string {
  return role === "tutor" ? `/tutor?report=${lessonId}#after-class-report` : "/student/lessons";
}

export function unreadCount(messages: LessonChatMessage[], viewerId: string): number {
  return messages.filter((message) => message.senderId !== viewerId && !message.readAt).length;
}

export type ConnectionQuality = "good" | "fair";

/** Uses the browser's own estimate where it has one; it only reflects this side of the call. */
export function connectionQuality(effectiveType: string | undefined): ConnectionQuality {
  return effectiveType === undefined || effectiveType === "4g" ? "good" : "fair";
}
