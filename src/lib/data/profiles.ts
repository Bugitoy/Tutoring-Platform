import { PARENTS, STUDENTS, getParentById, getStudentById } from "@/lib/mock/users";
import { getTutorById } from "@/lib/mock/tutors";
import { IDS } from "@/lib/mock/ids";
import { TREE } from "@/lib/curricula";
import { validateLearningProfile } from "@/lib/learningProfile";
import { withLocks } from "@/lib/permissions";
import type {
  LearningProfile,
  Parent,
  ParentProfileInput,
  Student,
  StudentProfileInput,
  Tutor,
  TutorProfileInput,
} from "@/lib/types";

export async function getStudent(id: string): Promise<Student | undefined> {
  return getStudentById(id);
}

export async function getParent(id: string): Promise<Parent | undefined> {
  return getParentById(id);
}

export async function getTutorProfile(id: string): Promise<Tutor | undefined> {
  return getTutorById(id);
}

/** Saves Tutor · Profile & pricing. Search and the preview read the same tutor record. */
export async function updateTutorProfile(id: string, input: TutorProfileInput): Promise<Tutor> {
  const tutor = getTutorById(id);
  if (!tutor) throw new Error("We couldn’t find your profile.");
  const headline = input.headline.trim();
  if (!headline) throw new Error("Add a headline so parents know what you teach.");
  if (input.offerings.length === 0) throw new Error("Choose at least one subject or curriculum you teach.");
  if (input.languages.length === 0) throw new Error("Choose at least one language you teach in.");
  const prices = [input.prices.min60, input.prices.min45, input.prices.min30];
  if (prices.some((price) => !Number.isFinite(price) || price <= 0)) throw new Error("Enter a price for every lesson length.");

  Object.assign(tutor, {
    headline,
    bio: input.bio.trim(),
    offerings: input.offerings,
    languages: input.languages,
    prices: input.prices,
    freeTrial: input.freeTrial,
  });
  return tutor;
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function checkLearningProfile(profile: LearningProfile, who: "your" | string) {
  const curricula = TREE[profile.level]?.systems[profile.system]?.curricula as readonly string[] | undefined;
  if (!curricula?.includes(profile.curriculumId)) throw new Error(`Choose a curriculum for ${who} level and school system.`);
  const errors = validateLearningProfile(profile);
  const first = errors.subjects ?? errors.goals;
  if (first) throw new Error(who === "your" ? first : `${who}: ${first}`);
}

function checkPerson(fullName: string, email: string) {
  if (!fullName.trim()) throw new Error("Enter your full name.");
  if (!EMAIL.test(email.trim())) throw new Error("Enter an email address like name@example.com.");
}

/** Saves Student · Profile. Find tutors and the Library read the same learning profile. */
export async function updateStudentProfile(id: string, input: StudentProfileInput): Promise<Student> {
  const student = getStudentById(id);
  if (!student) throw new Error("We couldn’t find your profile.");
  checkPerson(input.fullName, input.email);
  checkLearningProfile(input.learningProfile, "your");
  const fullName = input.fullName.trim();
  Object.assign(student, {
    fullName,
    firstName: fullName.split(/\s+/)[0],
    email: input.email.trim(),
    learningProfile: { ...input.learningProfile, school: input.learningProfile.school?.trim() || undefined },
    preferences: input.preferences,
  });
  return student;
}

/** Saves Parent · Profile, including each child's permissions and learning profile. Locked permissions stay locked. */
export async function updateParentProfile(id: string, input: ParentProfileInput): Promise<Parent> {
  const parent = getParentById(id);
  if (!parent) throw new Error("We couldn’t find your profile.");
  checkPerson(input.fullName, input.email);
  const phone = input.phone.replace(/\D/g, "");
  if (phone && !/^7\d{7}$/.test(phone)) throw new Error("Enter a Botswana mobile number: 8 digits starting with 7.");

  const updates = input.children.map((entry) => {
    const child = parent.childIds.includes(entry.id) ? getStudentById(entry.id) : undefined;
    if (!child) throw new Error("That child isn’t linked to your account.");
    checkLearningProfile(entry.learningProfile, child.firstName);
    return { child, entry };
  });

  const fullName = input.fullName.trim();
  Object.assign(parent, {
    fullName,
    firstName: fullName.split(/\s+/)[0],
    email: input.email.trim(),
    phone,
    language: input.language,
    notifications: input.notifications,
  });
  for (const { child, entry } of updates) {
    child.learningProfile = entry.learningProfile;
    child.permissions = withLocks(child, entry.learningProfile, entry.permissions);
  }
  return parent;
}

export async function listStudents(): Promise<Student[]> {
  return STUDENTS;
}

export async function listParents(): Promise<Parent[]> {
  return PARENTS;
}

/** Demo session until auth exists. */
export async function getDemoSession(): Promise<{
  student: Student;
  parent: Parent;
  tutor: Tutor;
}> {
  return {
    student: getStudentById(IDS.neo)!,
    parent: getParentById(IDS.masego)!,
    tutor: getTutorById(IDS.molefe)!,
  };
}

export async function getChildrenForParent(parentId: string): Promise<Student[]> {
  const parent = getParentById(parentId);
  if (!parent) return [];
  return parent.childIds
    .map((id) => getStudentById(id))
    .filter((student): student is Student => Boolean(student));
}
