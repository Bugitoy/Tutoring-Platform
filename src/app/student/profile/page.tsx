import { Suspense } from "react";
import { io } from "next/cache";
import { StudentProfileForm, type LinkedParentView } from "@/components/profile/StudentProfileForm";
import { getCurriculum } from "@/lib/curricula";
import { getDemoSession, getParent } from "@/lib/data/profiles";
import { TIMEZONE } from "@/lib/format";
import { canAskParentToPay, canBook, canPayOwnCard, parentSeesMessages } from "@/lib/permissions";
import type { Parent, Student, StudentPreferences } from "@/lib/types";
import { formatInTimeZone } from "date-fns-tz";

const DEFAULT_PREFERENCES: StudentPreferences = {
  videoQuality: "auto",
  remindBeforeLesson: true,
  homeworkReminders: true,
  showOnLeaderboard: false,
};

const PRONOUNS = {
  she: { object: "her", subject: "She", manages: "manages", possessive: "her" },
  he: { object: "him", subject: "He", manages: "manages", possessive: "his" },
  none: { object: "them", subject: "They", manages: "manage", possessive: "their" },
} as const;

function parentView(student: Student, parent: Parent): LinkedParentView {
  const words = PRONOUNS[parent.pronoun ?? "none"];
  const object = words.object;
  const since = student.linkedSince
    ? `linked since ${formatInTimeZone(new Date(`${student.linkedSince}T12:00:00+02:00`), TIMEZONE, "MMM")}`
    : undefined;
  const can = ["See your lessons, reports and homework"];
  if (parentSeesMessages(student)) {
    can.push(student.isUnder18 ? "See your messages with tutors (you’re under 18)" : "See your messages with tutors");
  }
  if (canAskParentToPay(student)) can.push(`Pay for lessons you ask ${object} to pay for`);

  const allowed = [canBook(student) ? "book lessons" : null, canPayOwnCard(student) ? "pay with your own card" : null].filter(Boolean);
  const manages = `${words.subject} ${words.manages} these settings in ${words.possessive} profile.`;
  const note =
    allowed.length > 0
      ? `${parent.firstName} has allowed you to ${allowed.join(" and ")}. ${manages}`
      : `${parent.firstName} books your lessons. ${manages}`;

  return {
    name: parent.fullName,
    firstName: parent.firstName,
    initials: parent.initials,
    meta: [student.parentRelation, since].filter(Boolean).join(" · "),
    can,
    note,
  };
}

async function StudentProfile() {
  await io();
  const { student } = await getDemoSession();
  const parent = student.linkedParentId ? await getParent(student.linkedParentId) : undefined;
  const profile = student.learningProfile;
  const card = student.card;

  return (
    <StudentProfileForm
      initials={student.initials}
      summary={[profile.year, getCurriculum(profile.curriculumId)?.name, student.city].filter(Boolean).join(" · ")}
      initial={{
        fullName: student.fullName,
        email: student.email,
        learningProfile: profile,
        preferences: student.preferences ?? DEFAULT_PREFERENCES,
      }}
      parent={parent ? parentView(student, parent) : undefined}
      cardLabel={
        card ? `${card.brand === "visa" ? "Visa" : "Mastercard"} ${card.kind ?? ""} •••• ${card.last4}`.replace(/\s+/g, " ") : undefined
      }
      plusIncluded={Boolean(parent?.plan?.covers.includes(student.id))}
    />
  );
}

export default function StudentProfilePage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col gap-6" aria-busy="true" aria-label="Loading">
          <div className="h-20 rounded-xl bg-divider-soft" />
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
            <div className="h-[36rem] rounded-xl bg-divider-soft" />
            <div className="h-80 rounded-xl bg-divider-soft" />
          </div>
        </div>
      }
    >
      <StudentProfile />
    </Suspense>
  );
}
