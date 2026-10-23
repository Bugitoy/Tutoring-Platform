import { tutorMatchesFilter } from "@/lib/matching";
import { TUTORS, getTutorById } from "@/lib/mock/tutors";
import type { Tutor, TutorFilter } from "@/lib/types";

export async function searchTutors(filter: TutorFilter): Promise<Tutor[]> {
  return TUTORS.filter((tutor) => tutorMatchesFilter(tutor, filter));
}

export async function getTutor(tutorId: string): Promise<Tutor | undefined> {
  return getTutorById(tutorId);
}

export async function listTutors(): Promise<Tutor[]> {
  return TUTORS;
}
