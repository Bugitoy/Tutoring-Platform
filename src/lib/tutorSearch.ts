import type { Level, System } from "./curricula";
import { getCurriculum } from "./curricula";
import {
  sanitizeCascade,
  type Cascade,
} from "./matching";
import type { AvailabilityFilter, LearningProfile, PriceBand, TutorFilter } from "./types";

export type ChildKey = "neo" | "lesego" | "other";

export type TutorSearchState = Cascade & {
  child: ChildKey;
  verifiedOnly: boolean;
  teachesSetswana: boolean;
  freeTrial: boolean;
  availability: AvailabilityFilter;
  priceBand: PriceBand;
};

export type SearchParamsInput = Record<string, string | string[] | undefined>;

const LEVELS = new Set<Level>(["primary", "secondary"]);
const SYSTEMS = new Set<System>(["national", "international"]);

export function profileCascade(profile: LearningProfile): Cascade {
  const curriculum = getCurriculum(profile.curriculumId);
  const goalId = profile.goals[0]?.subjectId;
  const subjectOk = Boolean(goalId && curriculum?.subjects.some((subject) => subject.id === goalId));
  return {
    level: profile.level,
    system: profile.system,
    curriculumId: profile.curriculumId,
    subjectId: subjectOk && goalId ? goalId : "any",
  };
}

export function defaultExtras(): Pick<
  TutorSearchState,
  "verifiedOnly" | "teachesSetswana" | "freeTrial" | "availability" | "priceBand"
> {
  return {
    verifiedOnly: true,
    teachesSetswana: false,
    freeTrial: false,
    availability: "any",
    priceBand: "any",
  };
}

export function stateFromProfile(profile: LearningProfile, child: ChildKey = "other"): TutorSearchState {
  return { ...profileCascade(profile), child, ...defaultExtras() };
}

function one(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function asLevel(value: string | undefined): Cascade["level"] {
  return value && LEVELS.has(value as Level) ? (value as Level) : "any";
}

function asSystem(value: string | undefined): Cascade["system"] {
  return value && SYSTEMS.has(value as System) ? (value as System) : "any";
}

function asChild(value: string | undefined): ChildKey {
  if (value === "neo" || value === "lesego") return value;
  return "other";
}

function asAvailability(value: string | undefined): AvailabilityFilter {
  if (value === "today" || value === "week") return value;
  return "any";
}

function asPrice(value: string | undefined): PriceBand {
  if (value === "under-100" || value === "100-150" || value === "over-150") return value;
  return "any";
}

const QUERY_KEYS = ["level", "system", "curriculum", "subject", "child", "verified", "setswana", "trial", "when", "price"];

export function hasTutorQuery(params: SearchParamsInput): boolean {
  return QUERY_KEYS.some((key) => one(params[key]));
}

export function parseTutorSearch(params: SearchParamsInput, fallback: TutorSearchState): TutorSearchState {
  if (!hasTutorQuery(params)) return fallback;
  const cascade = sanitizeCascade({
    level: asLevel(one(params.level)),
    system: asSystem(one(params.system)),
    curriculumId: one(params.curriculum) || "any",
    subjectId: one(params.subject) || "any",
  });
  return {
    ...cascade,
    child: asChild(one(params.child)),
    verifiedOnly: one(params.verified) !== "0",
    teachesSetswana: one(params.setswana) === "1",
    freeTrial: one(params.trial) === "1",
    availability: asAvailability(one(params.when)),
    priceBand: asPrice(one(params.price)),
  };
}

export function cascadesEqual(a: Cascade, b: Cascade): boolean {
  return (
    a.level === b.level &&
    a.system === b.system &&
    a.curriculumId === b.curriculumId &&
    a.subjectId === b.subjectId
  );
}

export function extrasAreDefault(state: TutorSearchState): boolean {
  return (
    state.verifiedOnly &&
    !state.teachesSetswana &&
    !state.freeTrial &&
    state.availability === "any" &&
    state.priceBand === "any"
  );
}

export function toTutorFilter(state: TutorSearchState): TutorFilter {
  return {
    level: state.level,
    system: state.system,
    curriculumId: state.curriculumId,
    subjectId: state.subjectId,
    verifiedOnly: state.verifiedOnly,
    teachesSetswana: state.teachesSetswana,
    freeTrial: state.freeTrial,
    availability: state.availability,
    priceBand: state.priceBand,
  };
}

export function activeFilterCount(state: TutorSearchState): number {
  let count = 0;
  if (state.level !== "any") count += 1;
  if (state.system !== "any") count += 1;
  if (state.curriculumId !== "any") count += 1;
  if (state.subjectId !== "any") count += 1;
  if (state.verifiedOnly) count += 1;
  if (state.teachesSetswana) count += 1;
  if (state.freeTrial) count += 1;
  if (state.availability !== "any") count += 1;
  if (state.priceBand !== "any") count += 1;
  return count;
}

export function searchQuery(state: TutorSearchState, role: "student" | "parent"): string {
  const params = new URLSearchParams();
  params.set("level", state.level);
  params.set("system", state.system);
  params.set("curriculum", state.curriculumId);
  params.set("subject", state.subjectId);
  if (role === "parent") params.set("child", state.child);
  params.set("verified", state.verifiedOnly ? "1" : "0");
  if (state.teachesSetswana) params.set("setswana", "1");
  if (state.freeTrial) params.set("trial", "1");
  if (state.availability !== "any") params.set("when", state.availability);
  if (state.priceBand !== "any") params.set("price", state.priceBand);
  return params.toString();
}

export function clearedSearch(): TutorSearchState {
  return {
    level: "any",
    system: "any",
    curriculumId: "any",
    subjectId: "any",
    child: "other",
    verifiedOnly: false,
    teachesSetswana: false,
    freeTrial: false,
    availability: "any",
    priceBand: "any",
  };
}
