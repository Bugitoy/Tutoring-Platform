import type { CalendarLessonEvent } from "@/components/calendar/CalendarWithDayPanel";
import type { LegendItem } from "@/components/calendar/MonthCalendar";
import { subjectCat, type CatIndex } from "./calendar";
import { formatTime, gaboroneDate } from "./format";
import { lessonStatusView, parentPayerNote, subjectShort } from "./lessonStatus";
import type { Lesson, Student, Tutor } from "./types";

type TutorLookup = (tutorId: string) => Tutor | undefined;

export function studentCalendarEvents(
  lessons: Lesson[],
  tutorOf: TutorLookup,
  ctx: { now: string; parentName?: string },
): CalendarLessonEvent[] {
  return lessons.map((lesson) => {
    const view = lessonStatusView(lesson, "student", ctx);
    const time = formatTime(lesson.start);
    const subject = subjectShort(lesson.curriculumId, lesson.subjectId);
    return {
      id: lesson.id,
      date: gaboroneDate(lesson.start),
      chipText: `${time} ${subject}`,
      chip: view.chip,
      row: {
        id: lesson.id,
        cat: subjectCat(lesson.subjectId),
        title: `${time} · ${lesson.title}`,
        meta: `${subject} · ${tutorOf(lesson.tutorId)?.fullName ?? "Tutor"}`,
        pill: { label: view.label, tone: view.tone },
        action: view.action,
      },
    };
  });
}

export function studentLegend(lessons: Lesson[]): LegendItem[] {
  const subjects = new Map<string, { label: string; cat: CatIndex }>();
  for (const lesson of lessons) {
    if (!subjects.has(lesson.subjectId)) {
      subjects.set(lesson.subjectId, {
        label: subjectShort(lesson.curriculumId, lesson.subjectId),
        cat: subjectCat(lesson.subjectId),
      });
    }
  }
  return [
    ...[...subjects.values()]
      .sort((a, b) => a.cat - b.cat)
      .map((subject) => ({ label: subject.label, swatch: { kind: "cat" as const, cat: subject.cat } })),
    { label: "Done", swatch: { kind: "done" } },
    { label: "Missed", swatch: { kind: "missed" } },
    { label: "Waiting for payment", swatch: { kind: "pending" } },
  ];
}

export type ChildColour = { student: Student; key: string; cat: CatIndex };

export function parentCalendarEvents(
  lessons: Lesson[],
  tutorOf: TutorLookup,
  children: ChildColour[],
  now: string,
): CalendarLessonEvent[] {
  return lessons.flatMap((lesson) => {
    const child = children.find((item) => item.student.id === lesson.studentId);
    if (!child) return [];
    const view = lessonStatusView(lesson, "parent", { now, childKey: child.key });
    const time = formatTime(lesson.start);
    const name = child.student.firstName;
    const tutor = tutorOf(lesson.tutorId)?.fullName ?? "the tutor";
    return [
      {
        id: lesson.id,
        date: gaboroneDate(lesson.start),
        chipText: `${time} ${name}`,
        chip: view.chip,
        row: {
          id: lesson.id,
          cat: child.cat,
          title: `${time} · ${name} · ${lesson.title}`,
          meta: `${subjectShort(lesson.curriculumId, lesson.subjectId)} with ${tutor} · ${parentPayerNote(lesson, name)}`,
          pill: { label: view.label, tone: view.tone },
          action: view.action,
        },
      },
    ];
  });
}

export function parentLegend(children: ChildColour[]): LegendItem[] {
  return [
    ...children.map((child) => ({ label: child.student.firstName, swatch: { kind: "cat" as const, cat: child.cat } })),
    { label: "Done", swatch: { kind: "done" } },
    { label: "Missed or cancelled", swatch: { kind: "missed" } },
    { label: "Needs your payment", swatch: { kind: "pending" } },
  ];
}
