import { Suspense } from "react";
import { io } from "next/cache";
import { NoticeBox } from "@/components/shared/NoticeBox";
import { PageHeader } from "@/components/shell/PageHeader";
import { ResourcesWorkspace, type ResourceRow } from "@/components/tutor/ResourcesWorkspace";
import { UploadResourceDialog, type CourseOption } from "@/components/tutor/UploadResourceDialog";
import { PLACEHOLDERS } from "@/config/placeholders";
import { getCurriculum } from "@/lib/curricula";
import { nowIso } from "@/lib/clock";
import { getTutorUpcoming } from "@/lib/data/lessons";
import { getDemoSession, listStudents } from "@/lib/data/profiles";
import { getSharedResources, getSyllabusDocuments, getTutorResources } from "@/lib/data/resources";
import { listTutors } from "@/lib/data/tutors";
import { formatDateShort, formatDayMonth, formatMoney, formatTime, relativeDayWord, tutorShortName } from "@/lib/format";
import { courseLabel } from "@/lib/lessonStatus";
import type { Resource, Tutor } from "@/lib/types";

const RECENT_MS = 7 * 24 * 60 * 60 * 1000;

function plural(count: number, word: string) {
  return `${count} ${word}${count === 1 ? "" : "s"}`;
}

function course(resource: { curriculumId: string; subjectId?: string }) {
  return resource.subjectId
    ? courseLabel(resource.curriculumId, resource.subjectId)
    : (getCurriculum(resource.curriculumId)?.name ?? resource.curriculumId);
}

function visibilityPill(resource: Resource): ResourceRow["pill"] {
  if (resource.visibility === "private") return { label: "Private", tone: "neutral" };
  if (resource.visibility === "my_students") return { label: "My students", tone: "info" };
  const price = resource.price ? formatMoney(resource.price, resource.price % 100 !== 0) : PLACEHOLDERS.RESOURCE_PRICE;
  return { label: `For sale · ${price}`, tone: "success" };
}

function courseOptions(tutor: Tutor): CourseOption[] {
  const ids = [...new Set(tutor.offerings.map((offering) => offering.curriculumId))];
  return ids.flatMap((curriculumId) => {
    const curriculum = getCurriculum(curriculumId);
    if (!curriculum) return [];
    const offerings = tutor.offerings.filter((offering) => offering.curriculumId === curriculumId);
    const entire = offerings.some((offering) => offering.entireCurriculum);
    const subjects = curriculum.subjects
      .filter((subject) => entire || offerings.some((offering) => offering.subjectId === subject.id))
      .map((subject) => ({ id: subject.id, name: subject.name }));
    return [{ curriculumId, name: curriculum.name, subjects }];
  });
}

async function TutorResources() {
  await io();
  const now = nowIso();
  const nowMs = new Date(now).getTime();
  const { tutor } = await getDemoSession();
  const [mine, shared, syllabus, tutors, upcoming, students] = await Promise.all([
    getTutorResources(tutor.id),
    getSharedResources(tutor.id),
    getSyllabusDocuments(),
    listTutors(),
    getTutorUpcoming(tutor.id, now),
    listStudents(),
  ]);

  const mineRows: ResourceRow[] = mine.map((resource) => {
    const recent = nowMs - new Date(resource.updatedAt).getTime() <= RECENT_MS;
    const use = resource.boughtBy
      ? `bought by ${plural(resource.boughtBy, "tutor")}`
      : resource.usedInLessons > 0
        ? `used in ${plural(resource.usedInLessons, "lesson")}`
        : "not used in a lesson yet";
    return {
      id: resource.id,
      kind: resource.kind,
      title: resource.title,
      course: course(resource),
      meta: [course(resource), resource.note, use, recent ? `updated ${formatDayMonth(resource.updatedAt)}` : null]
        .filter(Boolean)
        .join(" · "),
      pill: visibilityPill(resource),
    };
  });

  const sharedRows: ResourceRow[] = shared.map((resource) => {
    const author = tutors.find((item) => item.id === resource.tutorId);
    return {
      id: resource.id,
      kind: resource.kind,
      title: resource.title,
      course: course(resource),
      meta: [
        course(resource),
        author ? `by ${tutorShortName(author.fullName)}` : null,
        resource.boughtBy ? `bought by ${plural(resource.boughtBy, "tutor")}` : null,
      ]
        .filter(Boolean)
        .join(" · "),
      pill: visibilityPill(resource),
    };
  });

  const syllabusRows: ResourceRow[] = syllabus.map((document) => ({
    id: document.id,
    kind: document.kind,
    title: document.title,
    course: course(document),
    meta: `${course(document)} · ${document.source}`,
  }));

  const next = upcoming[0];
  const nextStudent = next ? students.find((student) => student.id === next.studentId) : undefined;
  const day = next ? relativeDayWord(next.start, now) : null;
  const nextLesson = next
    ? `your ${formatTime(next.start)} lesson ${day ? day.toLowerCase() : `on ${formatDateShort(next.start)}`}${nextStudent ? ` with ${nextStudent.fullName}` : ""}`
    : undefined;

  return (
    <>
      <PageHeader
        title="Resources"
        subtitle="Your teaching materials, syllabus documents and resources shared by other tutors, ready to open in any lesson."
        actions={<UploadResourceDialog courses={courseOptions(tutor)} />}
      />
      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <ResourcesWorkspace mine={mineRows} shared={sharedRows} syllabus={syllabusRows} nextLesson={nextLesson} />
        <aside className="flex flex-col gap-4">
          <section className="rounded-xl border border-border bg-card p-5">
            <h2 className="mb-3 text-[15px] font-bold text-foreground">Who can see a resource</h2>
            <dl className="flex flex-col gap-2 text-[13px] text-text-secondary">
              <div>
                <dt className="inline font-bold text-foreground">Private</dt>
                <dd className="inline"> · only you, for use in your lessons</dd>
              </div>
              <div>
                <dt className="inline font-bold text-foreground">My students</dt>
                <dd className="inline"> · appears in your students’ Library</dd>
              </div>
              <div>
                <dt className="inline font-bold text-foreground">For sale</dt>
                <dd className="inline"> · other tutors can buy it for a price you set, minus Thanodi’s fee</dd>
              </div>
            </dl>
          </section>
          <NoticeBox tone="warning" className="text-[13px]">
            Only upload material you made yourself or have permission to share. Past papers come from the syllabus
            documents tab, so don’t re-upload them.
          </NoticeBox>
          <section className="rounded-xl bg-accent p-5">
            <h2 className="mb-2 text-[15px] font-bold text-foreground">Teaching tips</h2>
            <div className="flex flex-col gap-2 text-[13px] text-text-secondary">
              <p>
                Hand the student the whiteboard pen in the first 10 minutes. Solving one problem themselves keeps them
                engaged.
              </p>
              <p>End each lesson by agreeing on one homework task the student can finish in under 30 minutes.</p>
            </div>
          </section>
        </aside>
      </div>
    </>
  );
}

export default function TutorResourcesPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col gap-6" aria-busy="true" aria-label="Loading">
          <div className="h-16 rounded-xl bg-divider-soft" />
          <div className="grid gap-6 xl:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
            <div className="h-96 rounded-xl bg-divider-soft" />
            <div className="h-80 rounded-xl bg-divider-soft" />
          </div>
        </div>
      }
    >
      <TutorResources />
    </Suspense>
  );
}
