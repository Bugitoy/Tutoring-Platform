import { getCurriculum } from "@/lib/curricula";
import type { Parent, Student, Tutor } from "@/lib/types";

export type AccountChipData = {
  name: string;
  initials: string;
  subline: string;
};

export function studentAccount(student: Student): AccountChipData {
  const curriculum = getCurriculum(student.learningProfile.curriculumId);
  return {
    name: student.fullName,
    initials: student.initials,
    subline: `${student.learningProfile.year} · ${curriculum?.name ?? ""}`,
  };
}

export function parentAccount(parent: Parent, children: Student[]): AccountChipData {
  const names = children.map((child) => child.firstName);
  const subline =
    names.length === 2 ? `Parent of ${names[0]} & ${names[1]}` : `Parent of ${names.join(", ")}`;
  return {
    name: parent.fullName,
    initials: parent.initials,
    subline,
  };
}

export function tutorAccount(tutor: Tutor): AccountChipData {
  return {
    name: tutor.fullName,
    initials: tutor.initials,
    subline: "Maths tutor",
  };
}
