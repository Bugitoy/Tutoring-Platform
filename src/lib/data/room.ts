import { maskContactDetails } from "@/lib/contactSafety";
import { LESSONS } from "@/lib/mock/lessons";
import { LESSON_CHAT, ROOM_BOARDS } from "@/lib/mock/room";
import { getTutorById } from "@/lib/mock/tutors";
import { getStudentById } from "@/lib/mock/users";
import type { Lesson, LessonChatMessage, Student, Tutor, VideoQuality, WhiteboardPage } from "@/lib/types";

export type LessonRoomData = {
  lesson: Lesson;
  student: Student;
  tutor: Tutor;
  chat: LessonChatMessage[];
  board?: WhiteboardPage;
};

const MAX_CHAT_LENGTH = 500;

export async function getLessonRoom(lessonId: string): Promise<LessonRoomData | undefined> {
  const lesson = LESSONS.find((item) => item.id === lessonId);
  if (!lesson) return undefined;
  const student = getStudentById(lesson.studentId);
  const tutor = getTutorById(lesson.tutorId);
  if (!student || !tutor) return undefined;
  const chat = LESSON_CHAT.filter((message) => message.lessonId === lessonId).sort((a, b) =>
    a.sentAt.localeCompare(b.sentAt),
  );
  return { lesson, student, tutor, chat, board: ROOM_BOARDS[lessonId] };
}

function participantLesson(lessonId: string, userId: string) {
  const lesson = LESSONS.find((item) => item.id === lessonId);
  if (!lesson || (lesson.studentId !== userId && lesson.tutorId !== userId)) {
    throw new Error("We couldn’t find that lesson.");
  }
  return lesson;
}

let sequence = 0;

/** Contact details are masked here too, the same as in Messages. */
export async function sendLessonChat(
  lessonId: string,
  senderId: string,
  text: string,
  now: string,
): Promise<{ message: LessonChatMessage; masked: boolean }> {
  participantLesson(lessonId, senderId);
  const trimmed = text.trim();
  if (!trimmed) throw new Error("Type a message first.");
  if (trimmed.length > MAX_CHAT_LENGTH) throw new Error(`Keep messages under ${MAX_CHAT_LENGTH} characters.`);

  const latest = LESSON_CHAT.filter((message) => message.lessonId === lessonId).reduce(
    (max, message) => Math.max(max, new Date(message.sentAt).getTime()),
    0,
  );
  const { text: safe, masked } = maskContactDetails(trimmed);
  sequence += 1;
  const message: LessonChatMessage = {
    id: `chat-${Date.now().toString(36)}-${sequence}`,
    lessonId,
    senderId,
    sentAt: new Date(Math.max(new Date(now).getTime(), latest + 1000)).toISOString(),
    readAt: new Date(now).toISOString(),
    text: safe,
  };
  LESSON_CHAT.push(message);
  return { message, masked };
}

export async function markLessonChatRead(lessonId: string, readerId: string, now: string): Promise<void> {
  participantLesson(lessonId, readerId);
  for (const message of LESSON_CHAT) {
    if (message.lessonId === lessonId && message.senderId !== readerId && !message.readAt) message.readAt = now;
  }
}

/** The room remembers the last choice through the student's profile preference. */
export async function setVideoQuality(studentId: string, quality: VideoQuality): Promise<void> {
  const student = getStudentById(studentId);
  if (!student) throw new Error("We couldn’t find your profile.");
  student.preferences = {
    videoQuality: quality,
    remindBeforeLesson: student.preferences?.remindBeforeLesson ?? true,
    homeworkReminders: student.preferences?.homeworkReminders ?? true,
    showOnLeaderboard: student.preferences?.showOnLeaderboard ?? false,
  };
}

/** The tutor leaving ends the lesson; the after-class report is then due (section 8.2). */
export async function endLesson(lessonId: string, tutorId: string): Promise<Lesson> {
  const lesson = participantLesson(lessonId, tutorId);
  if (lesson.tutorId !== tutorId) throw new Error("Only the tutor can end the lesson.");
  if (lesson.status === "booked" || lesson.status === "live") {
    lesson.status = "completed";
    lesson.reportStatus = "report_due";
  }
  return lesson;
}
