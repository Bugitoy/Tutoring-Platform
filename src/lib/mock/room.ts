import type { LessonChatMessage, WhiteboardPage } from "@/lib/types";
import { IDS, cat } from "./ids";

/** What's already on the whiteboard when the room opens. */
export const ROOM_BOARDS: Record<string, WhiteboardPage> = {
  "lesson-neo-oct-22-pm": {
    caption: "Quadratic equations",
    lines: [
      { text: "x² − 5x + 6 = 0", tone: "ink" },
      { text: "(x − 2)(x − 3) = 0", tone: "work" },
      { text: "x = 2 or x = 3", tone: "work" },
    ],
    graph: true,
  },
};

/** Two unread messages from Ms. Molefe are waiting when Neo joins the 17:00 lesson (design: "Chat · 2"). */
export const LESSON_CHAT: LessonChatMessage[] = [
  {
    id: "chat-neo-pm-1",
    lessonId: "lesson-neo-oct-22-pm",
    senderId: IDS.neo,
    sentAt: cat("2026-10-22", "16:58"),
    readAt: cat("2026-10-22", "16:59"),
    text: "Dumela Ms. Molefe, I’m ready.",
  },
  {
    id: "chat-neo-pm-2",
    lessonId: "lesson-neo-oct-22-pm",
    senderId: IDS.molefe,
    sentAt: cat("2026-10-22", "17:02"),
    text: "Dumela Neo! The first question is on the whiteboard.",
  },
  {
    id: "chat-neo-pm-3",
    lessonId: "lesson-neo-oct-22-pm",
    senderId: IDS.molefe,
    sentAt: cat("2026-10-22", "17:03"),
    text: "Try factorising it yourself first. Take the pen when you’re ready.",
  },
];
