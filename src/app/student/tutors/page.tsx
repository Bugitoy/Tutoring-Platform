import { Suspense } from "react";
import { FindTutors } from "@/components/tutors/FindTutors";
import { getDemoSession } from "@/lib/data/profiles";
import { searchTutors } from "@/lib/data/tutors";
import {
  cascadesEqual,
  extrasAreDefault,
  parseTutorSearch,
  stateFromProfile,
  toTutorFilter,
} from "@/lib/tutorSearch";

export default function StudentTutorsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return (
    <Suspense fallback={<div className="min-h-40" />}>
      <StudentFindTutors searchParams={searchParams} />
    </Suspense>
  );
}

async function StudentFindTutors({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const { student } = await getDemoSession();
  const fallback = stateFromProfile(student.learningProfile);
  const state = parseTutorSearch(params, fallback);
  const tutors = await searchTutors(toTutorFilter(state));

  return (
    <FindTutors
      role="student"
      state={state}
      tutors={tutors}
      student={student}
      childOptions={[]}
      matchedProfile={cascadesEqual(state, fallback) && extrasAreDefault(state)}
      subtitle="Book a tutor for yourself. Pay with your own card, or send a booking to your parent to pay."
    />
  );
}
