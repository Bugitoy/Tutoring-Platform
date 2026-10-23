import { Suspense } from "react";
import { FindTutors } from "@/components/tutors/FindTutors";
import { getChildrenForParent, getDemoSession } from "@/lib/data/profiles";
import { searchTutors } from "@/lib/data/tutors";
import { IDS } from "@/lib/mock/ids";
import { parseTutorSearch, stateFromProfile, toTutorFilter, type ChildKey } from "@/lib/tutorSearch";
import type { Student } from "@/lib/types";

export default function ParentTutorsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return (
    <Suspense fallback={<div className="min-h-40" />}>
      <ParentFindTutors searchParams={searchParams} />
    </Suspense>
  );
}

function childKey(student: Student): Exclude<ChildKey, "other"> | null {
  if (student.id === IDS.neo) return "neo";
  if (student.id === IDS.lesego) return "lesego";
  return null;
}

async function ParentFindTutors({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const { parent } = await getDemoSession();
  const kids = await getChildrenForParent(parent.id);
  const children = kids.flatMap((student) => {
    const key = childKey(student);
    return key ? [{ key, student }] : [];
  });
  const neo = children.find((child) => child.key === "neo") ?? children[0];
  const fallback = neo ? stateFromProfile(neo.student.learningProfile, neo.key) : stateFromProfile(kids[0].learningProfile, "other");
  const state = parseTutorSearch(params, fallback);
  const tutors = await searchTutors(toTutorFilter(state));

  return (
    <FindTutors
      role="parent"
      state={state}
      tutors={tutors}
      student={null}
      childOptions={children}
      matchedProfile={false}
      subtitle="Choose who the lesson is for, then narrow by level, curriculum and subject. Every tutor lists exactly what they teach."
    />
  );
}
