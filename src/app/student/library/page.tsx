import { Suspense } from "react";
import { io } from "next/cache";
import { LibraryWorkspace, type LibraryRow } from "@/components/library/LibraryWorkspace";
import { StudyHelper } from "@/components/library/StudyHelper";
import { PageHeader } from "@/components/shell/PageHeader";
import { getCurriculum } from "@/lib/curricula";
import { getMainTutorId } from "@/lib/data/lessons";
import { getDemoSession } from "@/lib/data/profiles";
import { getLibraryItems } from "@/lib/data/resources";
import { getTutor } from "@/lib/data/tutors";

async function StudentLibrary() {
  await io();
  const { student } = await getDemoSession();
  const profile = student.learningProfile;
  const curriculum = getCurriculum(profile.curriculumId);
  const [items, mainTutorId] = await Promise.all([
    getLibraryItems(student.id, profile.curriculumId),
    getMainTutorId(student.id),
  ]);
  const tutor = mainTutorId ? await getTutor(mainTutorId) : undefined;

  const subjects = profile.subjectIds.map((subjectId) => ({
    id: subjectId,
    name: curriculum?.subjects.find((subject) => subject.id === subjectId)?.name ?? subjectId,
  }));
  const rows: LibraryRow[] = items.map(({ id, title, meta, kind, sizeMb, savedOffline, tab, subjectId }) => ({
    id,
    title,
    meta,
    kind,
    sizeMb,
    savedOffline,
    tab,
    subjectId,
  }));

  return (
    <>
      <PageHeader
        title="Library"
        subtitle={`Your lesson notes, past papers and resources from tutors, filtered to the ${curriculum?.name ?? "your"} syllabus.`}
      />
      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <LibraryWorkspace
          rows={rows}
          subjects={subjects}
          defaultSubjectId={profile.goals[0]?.subjectId ?? subjects[0]?.id ?? "all"}
        />
        <aside className="lg:sticky lg:top-8">
          {/* TODO(spec): "Working on" should follow the paper the student has open; v1 shows the design's example. */}
          <StudyHelper workingOn="2023 Paper 1, Q5" tutorName={tutor?.fullName} />
        </aside>
      </div>
    </>
  );
}

export default function StudentLibraryPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col gap-6" aria-busy="true" aria-label="Loading">
          <div className="h-20 rounded-xl bg-divider-soft" />
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
            <div className="h-96 rounded-xl bg-divider-soft" />
            <div className="h-96 rounded-xl bg-divider-soft" />
          </div>
        </div>
      }
    >
      <StudentLibrary />
    </Suspense>
  );
}
