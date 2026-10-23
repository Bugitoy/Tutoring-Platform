import { CURRICULA, TREE, getCurriculum, type Level, type System } from "./curricula";
import { offeringTag } from "./matching";
import type { Tutor, TutorOffering } from "./types";

/** Offerings plus curriculum cards that are ticked but have no subjects yet. */
export type TeachingState = { offerings: TutorOffering[]; ticked: string[] };

const ORDER = new Map(CURRICULA.map((curriculum, index) => [curriculum.id, index]));

function subjectIndex(curriculumId: string, subjectId?: string) {
  return getCurriculum(curriculumId)?.subjects.findIndex((subject) => subject.id === subjectId) ?? 0;
}

function sortOfferings(offerings: TutorOffering[]): TutorOffering[] {
  return [...offerings].sort(
    (a, b) =>
      (ORDER.get(a.curriculumId) ?? 0) - (ORDER.get(b.curriculumId) ?? 0) ||
      subjectIndex(a.curriculumId, a.subjectId) - subjectIndex(b.curriculumId, b.subjectId),
  );
}

function others(state: TeachingState, curriculumId: string) {
  return state.offerings.filter((offering) => offering.curriculumId !== curriculumId);
}

function keepTicked(state: TeachingState, curriculumId: string) {
  return state.ticked.includes(curriculumId) ? state.ticked : [...state.ticked, curriculumId];
}

/** Primary lists every primary curriculum; secondary depends on the school system. */
export function curriculaFor(level: Level, system: System): string[] {
  if (level === "primary") {
    return [...TREE.primary.systems.national.curricula, ...TREE.primary.systems.international.curricula];
  }
  return [...TREE.secondary.systems[system].curricula];
}

export function teachingFromOfferings(offerings: TutorOffering[]): TeachingState {
  return { offerings: sortOfferings(offerings), ticked: [...new Set(offerings.map((offering) => offering.curriculumId))] };
}

export function isTicked(state: TeachingState, curriculumId: string): boolean {
  return state.ticked.includes(curriculumId) || state.offerings.some((offering) => offering.curriculumId === curriculumId);
}

export function isEntire(state: TeachingState, curriculumId: string): boolean {
  return state.offerings.some((offering) => offering.curriculumId === curriculumId && offering.entireCurriculum);
}

/** Subject ids shown as selected chips; all of them when the entire curriculum is on. */
export function selectedSubjects(state: TeachingState, curriculumId: string): string[] {
  if (isEntire(state, curriculumId)) return getCurriculum(curriculumId)?.subjects.map((subject) => subject.id) ?? [];
  return state.offerings.flatMap((offering) =>
    offering.curriculumId === curriculumId && offering.subjectId ? [offering.subjectId] : [],
  );
}

export function toggleCurriculum(state: TeachingState, curriculumId: string): TeachingState {
  if (isTicked(state, curriculumId)) {
    return { offerings: others(state, curriculumId), ticked: state.ticked.filter((id) => id !== curriculumId) };
  }
  return { offerings: state.offerings, ticked: [...state.ticked, curriculumId] };
}

/** On selects every subject as one offering. Off clears the subjects but keeps the card ticked. */
export function setEntire(state: TeachingState, curriculumId: string, on: boolean): TeachingState {
  if (on && !getCurriculum(curriculumId)?.allowEntireCurriculum) return state;
  return {
    offerings: sortOfferings(on ? [...others(state, curriculumId), { curriculumId, entireCurriculum: true }] : others(state, curriculumId)),
    ticked: keepTicked(state, curriculumId),
  };
}

/** Unticking one chip while the entire curriculum is on turns entire off and keeps the rest. */
export function toggleSubject(state: TeachingState, curriculumId: string, subjectId: string): TeachingState {
  const ticked = keepTicked(state, curriculumId);
  if (isEntire(state, curriculumId)) {
    const rest = (getCurriculum(curriculumId)?.subjects ?? [])
      .filter((subject) => subject.id !== subjectId)
      .map((subject) => ({ curriculumId, subjectId: subject.id }));
    return { offerings: sortOfferings([...others(state, curriculumId), ...rest]), ticked };
  }
  const has = state.offerings.some((offering) => offering.curriculumId === curriculumId && offering.subjectId === subjectId);
  const offerings = has
    ? state.offerings.filter((offering) => !(offering.curriculumId === curriculumId && offering.subjectId === subjectId))
    : sortOfferings([...state.offerings, { curriculumId, subjectId, ...(curriculumId === "ib-dp" ? { ibLevel: "SL" as const } : {}) }]);
  return { offerings, ticked };
}

export function setIbLevel(state: TeachingState, subjectId: string, ibLevel: "SL" | "HL"): TeachingState {
  return {
    ...state,
    offerings: state.offerings.map((offering) =>
      offering.curriculumId === "ib-dp" && offering.subjectId === subjectId ? { ...offering, ibLevel } : offering,
    ),
  };
}

/** The status line on a curriculum card. */
export function curriculumStatus(state: TeachingState, curriculumId: string): string {
  if (!isTicked(state, curriculumId)) return "Not selected";
  if (isEntire(state, curriculumId)) return "Entire curriculum";
  const count = selectedSubjects(state, curriculumId).length;
  if (count === 0) return "Pick subjects below";
  return count === 1 ? "1 subject" : `${count} subjects`;
}

/** "BGCSE · Mathematics", "PSLE · entire curriculum", "IB Diploma · Physics HL" */
export function teachingListLabel(offering: TutorOffering): string {
  if (offering.entireCurriculum) {
    return `${getCurriculum(offering.curriculumId)?.name ?? offering.curriculumId} · entire curriculum`;
  }
  const label = offeringTag(offering);
  return offering.ibLevel ? `${label} ${offering.ibLevel}` : label;
}

/** Search tags on the preview card: the curricula, then "Verified" and "Setswana" when they apply. */
export function previewTags(
  offerings: TutorOffering[],
  verification: Tutor["verification"],
  languages: Tutor["languages"],
): string[] {
  const curricula = [...new Set(sortOfferings(offerings).map((offering) => getCurriculum(offering.curriculumId)?.name ?? offering.curriculumId))];
  const verified = verification.id === "verified" && verification.qualification === "verified";
  return [...curricula, ...(verified ? ["Verified"] : []), ...(languages.includes("Setswana") ? ["Setswana"] : [])];
}

/** Where the picker opens: the level and system of the first offering. */
export function initialView(offerings: TutorOffering[]): { level: Level; system: System } {
  const first = sortOfferings(offerings).find((offering) => getCurriculum(offering.curriculumId)?.level === "secondary") ?? offerings[0];
  const curriculum = first ? getCurriculum(first.curriculumId) : undefined;
  return { level: curriculum?.level ?? "secondary", system: curriculum?.system ?? "national" };
}
