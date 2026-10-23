import { CURRICULA, TREE, getCurriculum, type Level, type System } from "@/lib/curricula";
import type { LearningProfile } from "@/lib/types";

export const LEVEL_OPTIONS: { value: Level; label: string }[] = [
  { value: "primary", label: "Primary" },
  { value: "secondary", label: "Secondary" },
];

export function systemOptions(level: Level): { value: System; label: string }[] {
  const systems = TREE[level].systems;
  return (Object.keys(systems) as System[]).map((system) => ({ value: system, label: systems[system].label }));
}

/** "Public" / "Private" for secondary, "Botswana national" / "International" for primary. */
export function systemShort(level: Level, system: System): string {
  return TREE[level].systems[system].label.split(" · ")[0];
}

export function curriculumOptions(level: Level, system: System): { value: string; label: string }[] {
  return TREE[level].systems[system].curricula.map((id) => ({ value: id, label: getCurriculum(id)?.name ?? id }));
}

const range = (prefix: string, from: number, to: number) =>
  Array.from({ length: to - from + 1 }, (_, index) => `${prefix} ${from + index}`);

// TODO(spec): the spec names years for the Botswana curricula only; the international ones use each board's usual names.
const YEARS: Record<string, string[]> = {
  psle: range("Standard", 1, 7),
  jce: range("Form", 1, 3),
  bgcse: range("Form", 4, 5),
  bsse: range("Form", 4, 5),
  "cambridge-primary": range("Stage", 1, 6),
  "ib-pyp": range("PYP", 1, 6),
  igcse: ["Year 10", "Year 11"],
  "ib-myp": range("MYP", 1, 5),
  "ib-dp": ["DP 1", "DP 2"],
  "a-level": ["AS Level", "A Level"],
};

export function yearOptions(curriculumId: string, current?: string): string[] {
  const years = YEARS[curriculumId] ?? [];
  return current && !years.includes(current) ? [current, ...years] : years;
}

const IB = new Set(["ib-pyp", "ib-myp", "ib-dp"]);

export function gradeOptions(curriculumId: string): string[] {
  if (IB.has(curriculumId)) return ["7", "6", "5", "4", "3", "2", "1"];
  if (curriculumId === "psle" || curriculumId === "jce") return ["A", "B", "C", "D", "E"];
  return ["A*", "A", "B", "C", "D", "E"];
}

type CascadeChange = Partial<Pick<LearningProfile, "level" | "system" | "curriculumId" | "year">>;

/**
 * Applies one select change and repairs everything below it: a new level keeps the system, a new
 * system picks its first curriculum, and a new curriculum resets the year and drops subjects it
 * doesn't have.
 */
export function cascadeProfile(profile: LearningProfile, change: CascadeChange): LearningProfile {
  const level = change.level ?? profile.level;
  const system = change.system ?? profile.system;
  const curricula = TREE[level].systems[system].curricula as readonly string[];
  const wanted = change.curriculumId ?? profile.curriculumId;
  const curriculumId = curricula.includes(wanted) ? wanted : curricula[0];
  let year = change.year ?? profile.year;
  if (change.year === undefined && curriculumId !== profile.curriculumId) year = yearOptions(curriculumId)[0] ?? "";
  const subjects = new Set(getCurriculum(curriculumId)?.subjects.map((subject) => subject.id) ?? []);
  const grades = gradeOptions(curriculumId);
  return {
    ...profile,
    level,
    system,
    curriculumId,
    year,
    subjectIds: profile.subjectIds.filter((id) => subjects.has(id)),
    goals: profile.goals
      .filter((goal) => subjects.has(goal.subjectId))
      .map((goal) => (grades.includes(goal.targetGrade) ? goal : { ...goal, targetGrade: grades[2] ?? grades[0] })),
  };
}

export type LearningProfileErrors = { subjects?: string; goals?: string };

export function validateLearningProfile(profile: LearningProfile): LearningProfileErrors {
  const errors: LearningProfileErrors = {};
  const curriculum = CURRICULA.find((entry) => entry.id === profile.curriculumId);
  if (!curriculum) return { subjects: "Choose a curriculum." };
  if (profile.subjectIds.length === 0) errors.subjects = "Choose at least one subject you’re taking.";
  const goalIds = profile.goals.map((goal) => goal.subjectId);
  if (goalIds.some((id) => !id)) errors.goals = "Choose a subject for each goal.";
  else if (new Set(goalIds).size !== goalIds.length) errors.goals = "Each subject can only have one goal.";
  return errors;
}

/** "Form 4 · Secondary · Public · BGCSE" */
export function profileLine(profile: LearningProfile): string {
  const level = LEVEL_OPTIONS.find((option) => option.value === profile.level)?.label ?? profile.level;
  return [profile.year, level, systemShort(profile.level, profile.system), getCurriculum(profile.curriculumId)?.name]
    .filter(Boolean)
    .join(" · ");
}

/** Subject names, or one "PSLE · entire curriculum" tag when every subject is taken. */
export function subjectTags(profile: LearningProfile): string[] {
  const curriculum = getCurriculum(profile.curriculumId);
  if (!curriculum) return [];
  if (curriculum.allowEntireCurriculum && curriculum.subjects.every((subject) => profile.subjectIds.includes(subject.id))) {
    return [`${curriculum.name} · entire curriculum`];
  }
  return profile.subjectIds.map((id) => curriculum.subjects.find((subject) => subject.id === id)?.name ?? id);
}
