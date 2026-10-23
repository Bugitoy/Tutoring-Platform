import type { LearningProfile, Student, StudentPermissions } from "./types";

export const canBook = (s: Student) => s.permissions.canBook;
export const canPayOwnCard = (s: Student) =>
  s.permissions.canPayOwnCard && s.learningProfile.level !== "primary";
export const canAskParentToPay = (s: Student) =>
  !!s.linkedParentId && s.permissions.canRequestParentPayment;
export const parentSeesMessages = (s: Student) => s.isUnder18 || s.permissions.parentSeesMessages;

export type PermissionSwitch = Exclude<keyof StudentPermissions, "monthlyRequestLimit">;

/** Permissions a parent can't change, with the value they are held at. */
export function lockedPermissions(
  child: Pick<Student, "isUnder18">,
  profile: Pick<LearningProfile, "level">,
): Partial<Record<PermissionSwitch, boolean>> {
  const locked: Partial<Record<PermissionSwitch, boolean>> = {};
  if (profile.level === "primary") locked.canPayOwnCard = false;
  if (child.isUnder18) locked.parentSeesMessages = true;
  return locked;
}

/** Applies the locks, so a saved permission can never contradict them. */
export function withLocks(
  child: Pick<Student, "isUnder18">,
  profile: Pick<LearningProfile, "level">,
  permissions: StudentPermissions,
): StudentPermissions {
  return { ...permissions, ...lockedPermissions(child, profile) };
}
