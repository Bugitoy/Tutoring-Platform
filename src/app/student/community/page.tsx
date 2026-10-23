import { Suspense } from "react";
import { AskQuestionDialog } from "@/components/community/AskQuestionDialog";
import { CommunityFeed, type SubjectChip } from "@/components/community/CommunityFeed";
import {
  CommunityRulesCard,
  HowPointsWorkCard,
  PointsCard,
  StuckCard,
} from "@/components/community/CommunitySideCards";
import type { FeedQuestion } from "@/components/community/QuestionCard";
import { PageHeader } from "@/components/shell/PageHeader";
import { getBotswanaRank, getMember, getQuestions } from "@/lib/data/community";
import { getDemoSession } from "@/lib/data/profiles";
import { formatAgo } from "@/lib/format";
import { courseLabel, subjectShort } from "@/lib/lessonStatus";
import { MOCK_NOW_ISO } from "@/lib/mock/ids";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

async function StudentCommunity({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const ask = typeof params.ask === "string" ? params.ask.slice(0, 150) : undefined;
  const { student } = await getDemoSession();
  const profile = student.learningProfile;
  const mainSubjectId = profile.goals[0]?.subjectId ?? profile.subjectIds[0];
  const [questions, rank] = await Promise.all([getQuestions(), getBotswanaRank(student.id, mainSubjectId)]);

  const feed: FeedQuestion[] = questions.map((question) => ({
    id: question.id,
    title: question.title,
    status: question.status,
    answerCount: question.answerCount,
    course: courseLabel(question.curriculumId, question.subjectId),
    topic: question.topic,
    byline: `${getMember(question.authorId).name} · ${formatAgo(question.createdAt, MOCK_NOW_ISO)}`,
    curriculumId: question.curriculumId,
    subjectId: question.subjectId,
    isMine: question.authorId === student.id,
    isPastPaper: Boolean(question.pastPaperRef),
  }));

  const goalSubjects = profile.goals.map((goal) => goal.subjectId);
  const chips: SubjectChip[] = goalSubjects.slice(0, 2).map((subjectId, index) =>
    index === 0
      ? {
          id: subjectId,
          label: courseLabel(profile.curriculumId, subjectId),
          curriculumId: profile.curriculumId,
          subjectId,
        }
      : { id: subjectId, label: subjectShort(profile.curriculumId, subjectId), subjectId },
  );

  const pointsLine = [
    `Level ${student.communityLevel}`,
    `${subjectShort(profile.curriculumId, mainSubjectId)} helper`,
    rank ? `rank ${rank} in Botswana` : null,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <>
      <PageHeader
        title="Ask the community"
        subtitle="Questions from students across Botswana and beyond. Verified answers are checked by a tutor."
      />
      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="flex min-w-0 flex-col gap-4">
          <div>
            <AskQuestionDialog
              key={ask ?? ""}
              defaultCurriculumId={profile.curriculumId}
              defaultSubjectId={mainSubjectId}
              pool={questions.map(({ id, title, curriculumId, subjectId }) => ({ id, title, curriculumId, subjectId }))}
              initialTitle={ask}
            />
          </div>
          <CommunityFeed questions={feed} subjectChips={chips} />
        </div>
        <aside className="flex flex-col gap-4">
          <PointsCard points={student.points} line={pointsLine} />
          <HowPointsWorkCard />
          <CommunityRulesCard />
          <StuckCard href="/student/tutors" />
        </aside>
      </div>
    </>
  );
}

export default function StudentCommunityPage({ searchParams }: { searchParams: SearchParams }) {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col gap-6" aria-busy="true" aria-label="Loading">
          <div className="h-20 rounded-xl bg-divider-soft" />
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
            <div className="h-[28rem] rounded-xl bg-divider-soft" />
            <div className="h-[28rem] rounded-xl bg-divider-soft" />
          </div>
        </div>
      }
    >
      <StudentCommunity searchParams={searchParams} />
    </Suspense>
  );
}
