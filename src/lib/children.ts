import type { Student } from "./types";

/** `?child=` value, e.g. "neo". */
export function childKey(student: Student): string {
  return student.firstName.toLowerCase();
}

/** "Neo · Form 4", "Lesego · Std 6" */
export function childLabel(student: Student): string {
  return `${student.firstName} · ${student.learningProfile.year.replace(/^Standard /, "Std ")}`;
}

export function pickChild<T extends Student>(children: T[], key: string | undefined): T | undefined {
  return children.find((child) => childKey(child) === key);
}
