import { Suspense } from "react";
import Link from "next/link";
import { LessonRoom } from "@/components/room/LessonRoom";
import { Logo } from "@/components/shell/Logo";
import { buttonVariants } from "@/components/ui/button";
import { ROLE_HOME } from "@/config/nav";
import { nowIso } from "@/lib/clock";
import { getCurriculum } from "@/lib/curricula";
import { getDemoSession } from "@/lib/data/profiles";
import { getLessonRoom } from "@/lib/data/room";
import { formatTime, tutorShortName } from "@/lib/format";
import { courseLabel, subjectShort } from "@/lib/lessonStatus";
import { subjectName } from "@/lib/matching";
import { roomAccess, roomRoleParam } from "@/lib/room";
import type { Role } from "@/lib/types";

const CLOSED: Record<"parent" | "not_participant" | "ended" | "not_paid" | "missing", { title: string; body: string }> = {
  parent: {
    title: "Parents can’t join lessons",
    body: "Lessons are one-to-one between your child and the tutor. You’ll get the tutor’s report after class.",
  },
  not_participant: { title: "This isn’t your lesson", body: "Only the student and tutor of a lesson can join it." },
  ended: { title: "This lesson has ended", body: "You’ll find the summary and the whiteboard with your lessons." },
  not_paid: { title: "This lesson isn’t paid yet", body: "The room opens once the lesson is paid for." },
  missing: { title: "We couldn’t find that lesson", body: "Check the link, or open the lesson from your lessons page." },
};

function RoomClosed({ reason, role }: { reason: keyof typeof CLOSED; role: Role }) {
  const copy = CLOSED[reason];
  const back = role === "student" ? "/student/lessons" : ROLE_HOME[role];
  return (
    <div className="flex min-h-dvh flex-col bg-room-bg text-room-text">
      <header className="border-b border-room-control px-4 py-3">
        <Logo wordmarkClassName="text-room-text" />
      </header>
      <main className="flex flex-1 items-center justify-center p-6">
        <div className="max-w-md text-center">
          <h1 className="text-lg font-semibold">{copy.title}</h1>
          <p className="mt-2 text-sm text-room-muted">{copy.body}</p>
          <Link href={back} className={buttonVariants({ variant: "accent-navy", className: "mt-6" })}>
            {role === "student" ? "Back to my lessons" : "Back home"}
          </Link>
        </div>
      </main>
    </div>
  );
}

async function Room({
  params,
  searchParams,
}: {
  params: Promise<{ lessonId: string }>;
  searchParams: Promise<{ as?: string }>;
}) {
  const [{ lessonId }, { as }] = await Promise.all([params, searchParams]);
  const role = roomRoleParam(as);
  const [room, session] = await Promise.all([getLessonRoom(lessonId), getDemoSession()]);
  if (!room) return <RoomClosed reason="missing" role={role} />;

  const access = roomAccess(room.lesson, role, session[role].id);
  if (!access.ok) return <RoomClosed reason={access.reason} role={role} />;

  const { lesson, student, tutor, chat, board } = room;
  const tutorPerson = { name: tutor.fullName, shortName: tutorShortName(tutor.fullName), initials: tutor.initials };
  const studentPerson = { name: student.fullName, shortName: student.firstName, initials: student.initials };
  const isTutor = access.role === "tutor";
  const remote = isTutor ? studentPerson : tutorPerson;
  const me = isTutor ? tutorPerson : studentPerson;
  const curriculum = getCurriculum(lesson.curriculumId)?.name ?? lesson.curriculumId;
  const subject = subjectName(lesson.curriculumId, lesson.subjectId) ?? lesson.subjectId;
  const ends = new Date(new Date(lesson.start).getTime() + lesson.durationMin * 60000).toISOString();

  return (
    <LessonRoom
      lessonId={lesson.id}
      role={access.role}
      viewerId={session[access.role].id}
      start={lesson.start}
      now={nowIso()}
      title={`${subject} · ${lesson.title}`}
      subline={`${curriculum} syllabus · 1:1 lesson with ${remote.name}`}
      phoneTitle={lesson.title}
      phoneSubline={`${remote.name} · ${courseLabel(lesson.curriculumId, lesson.subjectId)}`}
      remote={remote}
      self={{ ...me, label: `You (${me.shortName})` }}
      names={{ [student.id]: student.firstName, [tutor.id]: tutorPerson.shortName }}
      chat={chat}
      initialQuality={isTutor ? "auto" : (student.preferences?.videoQuality ?? "auto")}
      board={board}
      goal={lesson.goal}
      leaveDescription={
        isTutor
          ? `This ends the lesson for ${student.firstName} and opens your after-class report.`
          : `You can rejoin until ${formatTime(ends)}.`
      }
      helper={
        isTutor
          ? undefined
          : {
              workingOn: `${subjectShort(lesson.curriculumId, lesson.subjectId)} · ${lesson.title}`,
              tutorName: tutor.fullName,
            }
      }
    />
  );
}

export default function LessonRoomPage({
  params,
  searchParams,
}: {
  params: Promise<{ lessonId: string }>;
  searchParams: Promise<{ as?: string }>;
}) {
  return (
    <Suspense fallback={<div className="min-h-dvh bg-room-bg" aria-busy="true" aria-label="Joining lesson" />}>
      <Room params={params} searchParams={searchParams} />
    </Suspense>
  );
}
