import { CURRICULA, getCurriculum, subjectsByCategory, type Level, type System } from "./curricula";
import { addGaboroneDays, gaboroneDate } from "./format";
import { MOCK_NOW_ISO } from "./mock/ids";
import type { Tutor, TutorFilter, TutorOffering } from "./types";

export type Cascade = {
  level: Level | "any";
  system: System | "any";
  curriculumId: string | "any";
  subjectId: string | "any";
};

function isAny(value: string | undefined): boolean {
  return !value || value === "any";
}

export function curriculaForCascade(level: Cascade["level"], system: Cascade["system"]) {
  return CURRICULA.filter(
    (curriculum) =>
      (level === "any" || curriculum.level === level) &&
      (system === "any" || curriculum.system === system),
  );
}

/** Drop a curriculum or subject the current level and system no longer allow. */
export function sanitizeCascade(cascade: Cascade): Cascade {
  const allowed = curriculaForCascade(cascade.level, cascade.system);
  if (cascade.curriculumId !== "any" && !allowed.some((curriculum) => curriculum.id === cascade.curriculumId)) {
    return { ...cascade, curriculumId: "any", subjectId: "any" };
  }
  if (cascade.curriculumId === "any") {
    return { ...cascade, subjectId: "any" };
  }
  const curriculum = getCurriculum(cascade.curriculumId);
  const subjectOk = curriculum?.subjects.some((subject) => subject.id === cascade.subjectId);
  if (cascade.subjectId !== "any" && !subjectOk) {
    return { ...cascade, subjectId: "any" };
  }
  return cascade;
}

export function withLevel(cascade: Cascade, level: Cascade["level"]): Cascade {
  return sanitizeCascade({ ...cascade, level });
}

export function withSystem(cascade: Cascade, system: Cascade["system"]): Cascade {
  return sanitizeCascade({ ...cascade, system });
}

export function withCurriculum(cascade: Cascade, curriculumId: string | "any"): Cascade {
  return sanitizeCascade({ ...cascade, curriculumId, subjectId: "any" });
}

export function withSubject(cascade: Cascade, subjectId: string | "any"): Cascade {
  return sanitizeCascade({ ...cascade, subjectId });
}

export function systemOptionLabel(level: Cascade["level"], system: System): string {
  if (level === "secondary") {
    return system === "national" ? "Public · national" : "Private · international";
  }
  return system === "national" ? "Botswana national" : "International";
}

export function offeringMatches(offering: TutorOffering, filter: TutorFilter): boolean {
  const curriculum = getCurriculum(offering.curriculumId);
  if (!curriculum) return false;

  if (!isAny(filter.level) && curriculum.level !== filter.level) return false;
  if (!isAny(filter.system) && curriculum.system !== filter.system) return false;
  if (!isAny(filter.curriculumId) && offering.curriculumId !== filter.curriculumId) return false;

  if (isAny(filter.subjectId)) return true;
  if (offering.entireCurriculum) return true;
  return offering.subjectId === filter.subjectId;
}

function priceFits(min60: number, band: TutorFilter["priceBand"]): boolean {
  if (!band || band === "any") return true;
  if (band === "under-100") return min60 < 10000;
  if (band === "100-150") return min60 >= 10000 && min60 <= 15000;
  return min60 > 15000;
}

function availabilityFits(nextFreeSlot: string | undefined, availability: TutorFilter["availability"], now = MOCK_NOW_ISO): boolean {
  if (!availability || availability === "any") return true;
  if (!nextFreeSlot) return false;
  const day = gaboroneDate(nextFreeSlot);
  const today = gaboroneDate(now);
  if (availability === "today") return day === today;
  return day >= today && day <= addGaboroneDays(today, 6);
}

export function tutorMatchesFilter(tutor: Tutor, filter: TutorFilter, now = MOCK_NOW_ISO): boolean {
  if (filter.verifiedOnly && tutor.verification.id !== "verified") return false;
  if (filter.teachesSetswana && !tutor.languages.includes("Setswana")) return false;
  if (filter.freeTrial && !tutor.freeTrial) return false;
  if (!priceFits(tutor.prices.min60, filter.priceBand)) return false;
  if (!availabilityFits(tutor.nextFreeSlot, filter.availability, now)) return false;
  return tutor.offerings.some((offering) => offeringMatches(offering, filter));
}

export function offeringTag(offering: TutorOffering): string {
  const curriculum = getCurriculum(offering.curriculumId);
  const name = curriculum?.name ?? offering.curriculumId;
  if (offering.entireCurriculum) return `${name} · Entire curriculum`;
  const subject = curriculum?.subjects.find((item) => item.id === offering.subjectId);
  return `${name} · ${subject?.name ?? ""}`;
}

export function tutorTags(tutor: Tutor, filter: TutorFilter): { label: string; matched: boolean }[] {
  const tags = tutor.offerings.map((offering) => ({
    label: offeringTag(offering),
    matched: offeringMatches(offering, filter),
  }));
  const matched = tags.filter((tag) => tag.matched);
  const rest = tags.filter((tag) => !tag.matched);
  return [...matched, ...rest];
}

export function subjectGroups(curriculumId: string | "any") {
  if (curriculumId === "any") return [];
  return subjectsByCategory(curriculumId);
}

export function subjectName(curriculumId: string | undefined, subjectId: string | undefined): string | undefined {
  if (!curriculumId || !subjectId || subjectId === "any") return undefined;
  return getCurriculum(curriculumId)?.subjects.find((subject) => subject.id === subjectId)?.name;
}

export function resultsTrail(filter: TutorFilter): string {
  const level = filter.level === "primary" ? "Primary" : filter.level === "secondary" ? "Secondary" : "Any level";
  const parts = [level];
  if (!isAny(filter.curriculumId)) {
    parts.push(getCurriculum(filter.curriculumId ?? "")?.name ?? filter.curriculumId ?? "");
  }
  parts.push(isAny(filter.subjectId) ? "All subjects" : (subjectName(filter.curriculumId, filter.subjectId) ?? "All subjects"));
  return parts.join(" · ");
}
