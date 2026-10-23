import type { BookingSettings, TutorStats, TutorStudent } from "@/lib/types";
import { IDS } from "./ids";

export const TUTOR_STATS: Record<string, TutorStats> = {
  [IDS.molefe]: { activeStudents: 14, newThisWeek: 2 },
};

export const TUTOR_STUDENTS: TutorStudent[] = [
  {
    tutorId: IDS.molefe,
    studentId: IDS.neo,
    lessonsTogether: 11,
    privateNote: "Learns best by working examples himself. Test on Friday 23 Oct.",
  },
  { tutorId: IDS.molefe, studentId: IDS.amantle, lessonsTogether: 8, privateNote: "" },
  { tutorId: IDS.molefe, studentId: IDS.kabelo, lessonsTogether: 5, privateNote: "" },
  { tutorId: IDS.molefe, studentId: IDS.lesegoD, lessonsTogether: 3, privateNote: "Prefers explanations in Setswana." },
  { tutorId: IDS.molefe, studentId: IDS.tumi, lessonsTogether: 14, privateNote: "" },
  { tutorId: IDS.molefe, studentId: IDS.oratile, lessonsTogether: 1, privateNote: "" },
];

export const BOOKING_SETTINGS: Record<string, BookingSettings> = {
  [IDS.molefe]: { lessonLength: 60, breakMin: 15, bookAhead: "2w", repeatWeekly: true },
};
